const { Op } = require('sequelize');
const Proforma = require('../database/models/Proforma');
const Job = require('../database/models/Job');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const JobItem = require('../database/models/JobItem');
const StockItem = require('../database/models/StockItem');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const proformaIncludes = [
  {
    model: Job, as: 'job',
    attributes: ['id', 'jobNumber', 'title', 'status', 'jobType', 'quantity', 'size', 'colorMode', 'bindingType', 'dueDate', 'amount'],
    include: [
      {
        model: JobItem, as: 'jobItems',
        attributes: ['id', 'itemName', 'unit', 'unitCost', 'quantityNeeded', 'totalCost', 'notes'],
        include: [{ model: StockItem, as: 'stockItem', attributes: ['id', 'itemName', 'unit'] }],
      },
    ],
  },
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'company', 'tin', 'address'] },
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] },
];

/**
 * GET /api/proformas
 */
const getAllProformas = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, customerId, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where[Op.or] = [
        { proformaNo: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Proforma.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: proformaIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/proformas/:id
 */
const getProformaById = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id, { include: proformaIncludes });
    if (!proforma) return error(res, 'Proforma not found.', 404);
    return success(res, proforma);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/proformas/job/:jobId
 */
const getProformasByJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) return error(res, 'Job not found.', 404);

    const proformas = await Proforma.findAll({
      where: { jobId: req.params.jobId },
      order: [['createdAt', 'DESC']],
      include: proformaIncludes,
    });

    return success(res, proformas);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/proformas
 * Create a proforma manually or auto-called from job creation.
 */
const createProforma = async (req, res, next) => {
  try {
    const { jobId, subtotal, validUntil, notes, terms } = req.body;

    const job = await Job.findByPk(jobId, {
      include: [{ model: Customer, as: 'customer' }],
    });
    if (!job) return error(res, 'Job not found.', 404);

    const sub = parseFloat(subtotal || job.amount || 0);

    const proformaNo = await Proforma.generateProformaNo();

    const proforma = await Proforma.create({
      proformaNo,
      jobId,
      customerId: job.customerId,
      createdById: req.user.id,
      subtotal: sub,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      totalAmount: sub,
      status: 'draft',
      validUntil: validUntil || null,
      notes: notes || null,
      terms: terms || null,
    });

    const created = await Proforma.findByPk(proforma.id, { include: proformaIncludes });
    return success(res, created, 'Proforma created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/proformas/:id
 * Update proforma details (only if draft).
 */
const updateProforma = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id);
    if (!proforma) return error(res, 'Proforma not found.', 404);

    if (proforma.status !== 'draft') {
      return error(res, `Cannot edit a proforma with status "${proforma.status}". Only draft proformas can be edited.`, 422);
    }

    const { subtotal, taxRate, discount, validUntil, notes, terms } = req.body;

    const sub = parseFloat(subtotal !== undefined ? subtotal : proforma.subtotal);
    const tax = parseFloat(taxRate !== undefined ? taxRate : proforma.taxRate);
    const disc = parseFloat(discount !== undefined ? discount : proforma.discount);
    const taxAmount = parseFloat(((sub * tax) / 100).toFixed(2));
    const totalAmount = parseFloat((sub + taxAmount - disc).toFixed(2));

    await proforma.update({
      subtotal: sub,
      taxRate: tax,
      taxAmount,
      discount: disc,
      totalAmount,
      ...(validUntil !== undefined && { validUntil }),
      ...(notes !== undefined && { notes }),
      ...(terms !== undefined && { terms }),
    });

    const updated = await Proforma.findByPk(proforma.id, { include: proformaIncludes });
    return success(res, updated, 'Proforma updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/proformas/:id/status
 * Update proforma status.
 */
const updateProformaStatus = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id);
    if (!proforma) return error(res, 'Proforma not found.', 404);

    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}.`, 400);
    }

    await proforma.update({ status });
    return success(res, { id: proforma.id, proformaNo: proforma.proformaNo, status }, 'Proforma status updated.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/proformas/:id
 * Delete a proforma (only draft).
 */
const deleteProforma = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id);
    if (!proforma) return error(res, 'Proforma not found.', 404);

    if (proforma.status !== 'draft') {
      return error(res, 'Only draft proformas can be deleted.', 422);
    }

    await proforma.destroy();
    return success(res, null, 'Proforma deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProformas,
  getProformaById,
  getProformasByJob,
  createProforma,
  updateProforma,
  updateProformaStatus,
  deleteProforma,
};
