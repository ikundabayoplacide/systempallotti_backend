const { Op } = require('sequelize');
const Payment = require('../database/models/Payment');
const Job = require('../database/models/Job');
const User = require('../database/models/User');
const Customer = require('../database/models/Customer');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');
const { adjustBalance } = require('../utils/fundBalance');

const paymentIncludes = [
  {
    model: Job, as: 'job', attributes: ['id', 'jobNumber', 'title', 'amount', 'paymentStatus', 'status'],
    include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] }],
  },
  { model: User, as: 'recordedBy', attributes: ['id', 'name'] },
  { model: User, as: 'receivedBy', attributes: ['id', 'name'] },
  { model: User, as: 'verifiedBy', attributes: ['id', 'name'] },
];

/**
 * POST /api/payments
 * Record a payment for a job.
 */
const createPayment = async (req, res, next) => {
  try {
    const { jobId, amountPaid, paymentMethod, paymentState, paymentNote, receivedById, verifiedById } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job) return error(res, 'Job not found.', 404);

    const isOnCredit = paymentState === 'ONCREDIT';

    // Validate receivedById is a RECEPTIONIST or ADMIN
    if (!isOnCredit) {
      if (!receivedById) return error(res, 'receivedById is required.', 400);
      const receiver = await User.findOne({ where: { id: receivedById, isActive: true } });
      if (!receiver) return error(res, 'Received by user not found.', 404);
      if (!['RECEPTIONIST', 'ADMIN', 'ACCOUNTANT', 'HOBE'].includes(receiver.role)) {
        return error(res, 'receivedById must be a RECEPTIONIST, ACCOUNTANT, HOBE, or ADMIN.', 400);
      }
    }

    // Validate verifiedById is an ACCOUNTANT or ADMIN if provided
    if (verifiedById) {
      const verifier = await User.findOne({ where: { id: verifiedById, isActive: true } });
      if (!verifier) return error(res, 'Verified by user not found.', 404);
      if (!['ACCOUNTANT', 'ADMIN'].includes(verifier.role)) {
        return error(res, 'verifiedById must be an ACCOUNTANT or ADMIN.', 400);
      }
    }

    const jobAmount = parseFloat(job.amount || 0);
    const paid = isOnCredit ? 0 : parseFloat(amountPaid);
    const balance = Math.max(0, jobAmount - paid);

    const receiptNo = isOnCredit ? null : await Payment.generateReceiptNo();

    // Update the pending (no receiptNo) record if one exists, otherwise create
    const existing = await Payment.findOne({ where: { jobId, receiptNo: null } });

    let payment;
    if (existing) {
      payment = await existing.update({
        recordedById: req.user.id,
        receivedById,
        verifiedById: verifiedById || null,
        receiptNo,
        amountPaid: paid,
        balance,
        paymentMethod,
        paymentState,
        paymentNote: paymentNote || null,
        paidAt: new Date(),
      });
    } else {
      payment = await Payment.create({
        jobId,
        recordedById: req.user.id,
        receivedById,
        verifiedById: verifiedById || null,
        receiptNo,
        amountPaid: paid,
        balance,
        paymentMethod,
        paymentState,
        paymentNote: paymentNote || null,
        paidAt: new Date(),
      });
    }

    // Update job paymentStatus
    const newPaymentStatus = isOnCredit ? 'oncredit' : paymentState === 'PARTIAL' ? 'partial' : 'paid';
    await job.update({ paymentStatus: newPaymentStatus });

    // Payment received → add to balance (skip for ONCREDIT state)
    if (!isOnCredit) await adjustBalance('add', paid);

    // Notify ADMIN and DAF users
    await notify({
      createdById: req.user.id,
      title: isOnCredit ? 'Payment On Credit' : 'Payment Collected',
      message: `Payment of ${paid} recorded for job ${job.jobNumber} (${paymentState}). Balance: ${balance}.${receiptNo ? ` Receipt: ${receiptNo}.` : ''}`,
      type: 'PAYMENT_COLLECTED',
      relatedEntityType: 'payment',
      relatedEntityId: payment.id,
      targetRoles: ['ADMIN', 'DAF', 'ACCOUNTANT', 'CASHIER'],
    });

    const created = await Payment.findByPk(payment.id, { include: paymentIncludes });
    return success(res, created, 'Payment recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments
 * Get all payments (paginated).
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { jobId, paymentMethod, paymentState, search, from, to } = req.query;

    const where = {};
    if (jobId) where.jobId = jobId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (paymentState) where.paymentState = paymentState;
    if (from || to) {
      const start = from ? new Date(from) : new Date('2000-01-01');
      const end   = to   ? new Date(to)   : new Date();
      where.paidAt = { [Op.between]: [start, end] };
    }

    if (search) {
      where[Op.or] = [
        { receiptNo: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['paidAt', 'DESC']],
      include: paymentIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/:id
 * Get a single payment by ID.
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: paymentIncludes });
    if (!payment) return error(res, 'Payment not found.', 404);
    return success(res, payment);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/job/:jobId
 * Get all payments for a specific job.
 */
const getPaymentsByJob = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const job = await Job.findByPk(req.params.jobId);
    if (!job) return error(res, 'Job not found.', 404);

    const { count, rows } = await Payment.findAndCountAll({
      where: { jobId: req.params.jobId },
      offset: skip,
      limit,
      order: [['paidAt', 'DESC']],
      include: paymentIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getAllPayments, getPaymentById, getPaymentsByJob };
