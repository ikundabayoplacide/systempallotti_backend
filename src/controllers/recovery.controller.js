const { Op } = require('sequelize');
const Job = require('../database/models/Job');
const Payment = require('../database/models/Payment');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const RecoveryRecord = require('../database/models/RecoveryRecord');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const jobIncludes = [
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'email', 'company'] },
  { model: User, as: 'createdBy', attributes: ['id', 'name'] },
];

const recoveryIncludes = [
  { model: Job, as: 'job', attributes: ['id', 'jobNumber', 'title', 'amount', 'paymentStatus', 'dueDate', 'status'] },
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'email', 'company'] },
  { model: User, as: 'recordedBy', attributes: ['id', 'name'] },
];

/**
 * GET /api/recovery/debts
 * Returns all jobs that have outstanding balances:
 * - Jobs with paymentStatus = 'unpaid' (never paid)
 * - Jobs with at least one PARTIAL payment (paid something but still owes)
 */
const getDebtList = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, from, to, status } = req.query;

    const where = {
      [Op.or]: [
        // 1. Never paid at all
        { paymentStatus: 'unpaid' },
        // 2. Has at least one PARTIAL payment
        {
          '$payments.paymentState$': 'PARTIAL',
          '$payments.balance$': { [Op.gt]: 0 },
        },
      ],
    };

    if (status) where.status = status;
    if (from || to) {
      where.dueDate = {};
      if (from) where.dueDate[Op.gte] = new Date(from);
      if (to) where.dueDate[Op.lte] = new Date(to);
    }
    if (search) {
      where[Op.and] = [{
        [Op.or]: [
          { jobNumber: { [Op.like]: `%${search}%` } },
          { title: { [Op.like]: `%${search}%` } },
          { '$customer.name$': { [Op.like]: `%${search}%` } },
          { '$customer.phone$': { [Op.like]: `%${search}%` } },
        ],
      }];
    }

    const jobs = await Job.findAll({
      where,
      include: [
        ...jobIncludes,
        { model: Payment, as: 'payments', required: false, order: [['paidAt', 'DESC']] },
      ],
      order: [['dueDate', 'ASC']],
      subQuery: false,
    });

    const debts = jobs.map((job) => {
      const payments = job.payments || [];
      const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);
      const totalAmount = parseFloat(job.amount || 0);
      const balanceDue = Math.max(0, totalAmount - totalPaid);
      const lastPayment = payments[0] || null;

      return {
        jobId: job.id,
        jobNumber: job.jobNumber,
        title: job.title,
        status: job.status,
        customer: job.customer,
        totalAmount,
        amountPaid: totalPaid,
        balanceDue,
        dueDate: job.dueDate,
        daysOverdue: job.dueDate
          ? Math.max(0, Math.floor((Date.now() - new Date(job.dueDate)) / 86400000))
          : null,
        lastPaymentAt: lastPayment?.paidAt || null,
        paymentMethod: lastPayment?.paymentMethod || null,
        debtType: totalPaid > 0 ? 'partial' : 'unpaid',
      };
    }).filter((d) => d.balanceDue > 0); // exclude jobs fully paid

    debts.sort((a, b) => (b.daysOverdue ?? -1) - (a.daysOverdue ?? -1));

    const total = debts.length;
    const paged = debts.slice(skip, skip + limit);

    return res.json({
      success: true,
      data: paged,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/recovery/records
 * Get all recovery records (paginated).
 */
const getRecoveryRecords = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { jobId, customerId, status, from, to } = req.query;

    const where = {};
    if (jobId) where.jobId = jobId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const { count, rows } = await RecoveryRecord.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: recoveryIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/recovery
 * Record a debt recovery (customer returns to pay remaining balance).
 */
const createRecoveryRecord = async (req, res, next) => {
  try {
    const { jobId, amountRecovered, paymentMethod, note, contactedAt } = req.body;

    const job = await Job.findByPk(jobId, { include: jobIncludes });
    if (!job) return error(res, 'Job not found.', 404);
    if (!job.customerId) return error(res, 'Job has no associated customer.', 422);

    // Get total already paid for this job
    const payments = await Payment.findAll({ where: { jobId } });
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);
    const totalAmount = parseFloat(job.amount || 0);
    const currentBalance = Math.max(0, totalAmount - totalPaid);

    if (currentBalance === 0) return error(res, 'This job has no outstanding balance.', 422);

    const recovered = parseFloat(amountRecovered);
    if (recovered <= 0) return error(res, 'amountRecovered must be greater than 0.', 422);
    if (recovered > currentBalance) return error(res, `Amount exceeds balance due (${currentBalance}).`, 422);

    const balanceAfter = Math.max(0, currentBalance - recovered);
    const status = balanceAfter === 0 ? 'recovered' : 'partial';

    const record = await RecoveryRecord.create({
      jobId,
      customerId: job.customerId,
      recordedById: req.user.id,
      amountRecovered: recovered,
      balanceAfter,
      paymentMethod: paymentMethod || null,
      status,
      note: note || null,
      contactedAt: contactedAt ? new Date(contactedAt) : new Date(),
    });

    // Also create a Payment record so payment history stays consistent
    const receiptNo = await Payment.generateReceiptNo();
    const newTotalPaid = totalPaid + recovered;
    const paymentBalance = Math.max(0, totalAmount - newTotalPaid);

    await Payment.create({
      jobId,
      recordedById: req.user.id,
      receivedById: req.user.id,
      receiptNo,
      amountPaid: recovered,
      balance: paymentBalance,
      paymentMethod: paymentMethod || null,
      paymentState: paymentBalance === 0 ? 'FULL' : 'PARTIAL',
      paymentNote: note || 'Recovery payment',
      paidAt: new Date(),
    });

    // Mark job as paid if fully recovered
    if (balanceAfter === 0) {
      await job.update({ paymentStatus: 'paid' });
    }

    await notify({
      createdById: req.user.id,
      title: 'Debt Recovery Recorded',
      message: `Recovery of ${recovered} recorded for job ${job.jobNumber} (${job.customer?.name}). Balance remaining: ${balanceAfter}.`,
      type: 'PAYMENT_COLLECTED',
      relatedEntityType: 'recovery',
      relatedEntityId: record.id,
      targetRoles: ['ADMIN', 'DAF', 'ACCOUNTANT'],
    });

    const created = await RecoveryRecord.findByPk(record.id, { include: recoveryIncludes });
    return success(res, created, 'Recovery recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/recovery/:id/status
 * Update recovery status (e.g. mark as written_off).
 */
const updateRecoveryStatus = async (req, res, next) => {
  try {
    const record = await RecoveryRecord.findByPk(req.params.id);
    if (!record) return error(res, 'Recovery record not found.', 404);

    const { status, note } = req.body;
    const allowed = ['pending', 'recovered', 'partial', 'written_off'];
    if (!allowed.includes(status)) return error(res, `Invalid status. Allowed: ${allowed.join(', ')}.`, 400);

    await record.update({
      status,
      ...(note !== undefined && { note }),
    });

    const updated = await RecoveryRecord.findByPk(record.id, { include: recoveryIncludes });
    return success(res, updated, 'Recovery status updated.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDebtList, getRecoveryRecords, createRecoveryRecord, updateRecoveryStatus };
