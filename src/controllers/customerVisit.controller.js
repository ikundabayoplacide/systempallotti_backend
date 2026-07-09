const { Op } = require('sequelize');
const CustomerVisit = require('../database/models/CustomerVisit');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const visitIncludes = [
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone', 'email', 'company'] },
  { model: User, as: 'recordedBy', attributes: ['id', 'name', 'email', 'role'] },
];

/**
 * GET /api/visits
 * Get all visits (paginated, filterable).
 */
const getAllVisits = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { customerId, type, date, from, to } = req.query;

    const where = {};
    if (customerId) where.customerId = customerId;
    if (type) where.type = type;
    if (from || to) {
      const start = from ? new Date(from) : new Date('2000-01-01');
      const end   = to   ? new Date(to)   : new Date();
      if (!to) end.setHours(23, 59, 59, 999);
      where.checkinAt = { [Op.between]: [start, end] };
    } else if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.checkinAt = { [Op.between]: [start, end] };
    }

    const { count, rows } = await CustomerVisit.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['checkinAt', 'DESC']],
      include: visitIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/visits/:id
 */
const getVisitById = async (req, res, next) => {
  try {
    const visit = await CustomerVisit.findByPk(req.params.id, { include: visitIncludes });
    if (!visit) return error(res, 'Visit not found.', 404);
    return success(res, visit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/visits/customer/:customerId
 * Get all visits for a specific customer.
 */
const getVisitsByCustomer = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const customer = await Customer.findByPk(req.params.customerId);
    if (!customer) return error(res, 'Customer not found.', 404);

    const { count, rows } = await CustomerVisit.findAndCountAll({
      where: { customerId: req.params.customerId },
      offset: skip,
      limit,
      order: [['checkinAt', 'DESC']],
      include: [{ model: User, as: 'recordedBy', attributes: ['id', 'name', 'role'] }],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/visits/checkin
 * Record a customer check-in.
 */
const checkIn = async (req, res, next) => {
  try {
    const { customerId, purpose, notes } = req.body;

    const customer = await Customer.findByPk(customerId);
    if (!customer) return error(res, 'Customer not found.', 404);
    if (!customer.isActive) return error(res, 'Customer is inactive.', 422);

    const visit = await CustomerVisit.create({
      customerId,
      recordedById: req.user.id,
      type: 'IN',
      checkinAt: new Date(),
      purpose: purpose || null,
      notes: notes || null,
    });

    await notify({
      createdById: req.user.id,
      title: 'Customer Check-In',
      message: `Customer "${customer.name}" has checked in.${purpose ? ` Purpose: ${purpose}` : ''}`,
      type: 'CUSTOMER_CHECKIN',
      relatedEntityType: 'customer',
      relatedEntityId: customer.id,
      targetRoles: ['ADMIN', 'SALES'],
    });

    const created = await CustomerVisit.findByPk(visit.id, { include: visitIncludes });
    return success(res, created, `Customer "${customer.name}" checked in successfully.`, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/visits/:id/checkout
 * Record a customer check-out on an existing visit.
 */
const checkOut = async (req, res, next) => {
  try {
    const visit = await CustomerVisit.findByPk(req.params.id, { include: visitIncludes });
    if (!visit) return error(res, 'Visit not found.', 404);

    if (visit.type === 'OUT' || visit.checkoutAt) {
      return error(res, 'Customer has already checked out.', 409);
    }

    await visit.update({
      type: 'OUT',
      checkoutAt: new Date(),
    });

    return success(res, visit, `Customer "${visit.customer.name}" checked out successfully.`);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/visits/:id
 * Delete a visit record (ADMIN only).
 */
const deleteVisit = async (req, res, next) => {
  try {
    const visit = await CustomerVisit.findByPk(req.params.id);
    if (!visit) return error(res, 'Visit not found.', 404);
    await visit.destroy();
    return success(res, null, 'Visit record deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllVisits, getVisitById, getVisitsByCustomer, checkIn, checkOut, deleteVisit };
