const { Op } = require('sequelize');
const Outstand = require('../database/models/Outstand');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const userAttrs = ['id', 'name', 'email', 'role'];

const outstandIncludes = [
  { model: User, as: 'recordedBy', attributes: userAttrs },
  { model: User, as: 'approvedBy', attributes: userAttrs },
];

/** Generate next ref like OUT-001, OUT-002, ... OUT-1000 */
const generateRef = async () => {
  const last = await Outstand.findOne({ order: [['createdAt', 'DESC']] });
  if (!last) return 'OUT-001';
  const num = parseInt(last.ref.split('-')[1] || '0', 10) + 1;
  return `OUT-${String(num).padStart(3, '0')}`;
};

/**
 * GET /api/outstands
 */
const getAllOutstands = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, category, from, to } = req.query;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    // Receptionist/Cashier sees only their own records
    if (['RECEPTIONIST', 'CASHIER'].includes(req.user.role)) {
      where.recordedById = req.user.id;
    }

    const { count, rows } = await Outstand.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: outstandIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/outstands/:id
 */
const getOutstandById = async (req, res, next) => {
  try {
    const outstand = await Outstand.findByPk(req.params.id, { include: outstandIncludes });
    if (!outstand) return error(res, 'Outstand not found.', 404);

    // Receptionist/Cashier can only see their own
    if (['RECEPTIONIST', 'CASHIER'].includes(req.user.role) && outstand.recordedById !== req.user.id) {
      return error(res, 'Forbidden.', 403);
    }

    return success(res, outstand);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/outstands
 */
const createOutstand = async (req, res, next) => {
  try {
    const { description, category, quantity = 1, unitCost, recipientName, recipientPhone, recipientRole, purpose, notes } = req.body;

    const qty = parseFloat(quantity);
    const cost = parseFloat(unitCost);
    const ref = await generateRef();

    const outstand = await Outstand.create({
      ref,
      description,
      category,
      quantity: qty,
      unitCost: cost,
      totalAmount: parseFloat((qty * cost).toFixed(2)),
      recipientName,
      recipientPhone: recipientPhone || null,
      recipientRole: recipientRole || null,
      purpose,
      notes: notes || null,
      recordedById: req.user.id,
    });

    const created = await Outstand.findByPk(outstand.id, { include: outstandIncludes });

    await notify({
      createdById: req.user.id,
      title: 'New Expense Recorded',
      message: `Expense "${description}" (${ref}) of ${parseFloat((parseFloat(quantity || 1) * parseFloat(unitCost)).toFixed(2))} recorded by ${req.user.name || req.user.email}.`,
      type: 'OUTSTAND_CREATED',
      relatedEntityType: 'outstand',
      relatedEntityId: outstand.id,
      targetRoles: ['ADMIN', 'DAF', 'ACCOUNTANT', 'CASHIER'],
    });

    return success(res, created, 'Outstand recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/outstands/:id
 * Only allowed while status is still 'pending'
 */
const updateOutstand = async (req, res, next) => {
  try {
    const outstand = await Outstand.findByPk(req.params.id);
    if (!outstand) return error(res, 'Outstand not found.', 404);

    // Receptionist/Cashier can only edit their own
    if (['RECEPTIONIST', 'CASHIER'].includes(req.user.role) && outstand.recordedById !== req.user.id) {
      return error(res, 'Forbidden.', 403);
    }

    if (outstand.status !== 'pending') {
      return error(res, `Cannot edit an outstand with status "${outstand.status}". Only pending outstands can be edited.`, 400);
    }

    const { description, category, quantity, unitCost, recipientName, recipientPhone, recipientRole, purpose, notes } = req.body;

    const qty = quantity !== undefined ? parseFloat(quantity) : parseFloat(outstand.quantity);
    const cost = unitCost !== undefined ? parseFloat(unitCost) : parseFloat(outstand.unitCost);

    await outstand.update({
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(recipientName !== undefined && { recipientName }),
      ...(recipientPhone !== undefined && { recipientPhone }),
      ...(recipientRole !== undefined && { recipientRole }),
      ...(purpose !== undefined && { purpose }),
      ...(notes !== undefined && { notes }),
      quantity: qty,
      unitCost: cost,
      totalAmount: parseFloat((qty * cost).toFixed(2)),
    });

    const updated = await Outstand.findByPk(outstand.id, { include: outstandIncludes });
    return success(res, updated, 'Outstand updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/outstands/:id/approve
 */
const approveOutstand = async (req, res, next) => {
  try {
    const outstand = await Outstand.findByPk(req.params.id);
    if (!outstand) return error(res, 'Outstand not found.', 404);
    if (outstand.status !== 'pending') {
      return error(res, `Cannot approve an outstand with status "${outstand.status}".`, 400);
    }

    await outstand.update({ status: 'approved', approvedById: req.user.id, approvedAt: new Date() });
    const updated = await Outstand.findByPk(outstand.id, { include: outstandIncludes });
    return success(res, updated, 'Outstand approved.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/outstands/:id/reject
 */
const rejectOutstand = async (req, res, next) => {
  try {
    const outstand = await Outstand.findByPk(req.params.id);
    if (!outstand) return error(res, 'Outstand not found.', 404);
    if (outstand.status !== 'pending') {
      return error(res, `Cannot reject an outstand with status "${outstand.status}".`, 400);
    }

    await outstand.update({
      status: 'rejected',
      approvedById: req.user.id,
      rejectionNote: req.body.rejectionNote,
    });
    const updated = await Outstand.findByPk(outstand.id, { include: outstandIncludes });
    return success(res, updated, 'Outstand rejected.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/outstands/:id/pay
 */
const markAsPaid = async (req, res, next) => {
  try {
    const outstand = await Outstand.findByPk(req.params.id);
    if (!outstand) return error(res, 'Outstand not found.', 404);
    if (outstand.status !== 'approved') {
      return error(res, `Cannot mark as paid — outstand must be approved first (current: "${outstand.status}").`, 400);
    }

    await outstand.update({ status: 'paid', paidAt: new Date() });
    const updated = await Outstand.findByPk(outstand.id, { include: outstandIncludes });
    return success(res, updated, 'Outstand marked as paid.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllOutstands, getOutstandById, createOutstand, updateOutstand, approveOutstand, rejectOutstand, markAsPaid };
