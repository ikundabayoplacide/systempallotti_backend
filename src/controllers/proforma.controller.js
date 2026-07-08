const { Op } = require('sequelize');
const Proforma = require('../database/models/Proforma');
const ProformaItem = require('../database/models/ProformaItem');
const Job = require('../database/models/Job');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const proformaIncludes = [
  { model: ProformaItem, as: 'items' },
  { model: Job, as: 'job', attributes: ['id', 'jobNumber', 'title'], required: false },
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'], required: false },
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] },
];

const computeTotals = (items, taxRate, discount) => {
  const subtotal = parseFloat(items.reduce((sum, i) => sum + (parseFloat(i.qty) * parseFloat(i.unitPrice)), 0).toFixed(2));
  const tax = parseFloat(taxRate ?? 18);
  const disc = parseFloat(discount ?? 0);
  const taxAmount = parseFloat(((subtotal - disc) * tax / 100).toFixed(2));
  const totalAmount = parseFloat(((subtotal - disc) + taxAmount).toFixed(2));
  return { subtotal, taxRate: tax, taxAmount, discount: disc, totalAmount };
};

/**
 * GET /api/proformas
 */
const getAllProformas = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [
      { proformaNo: { [Op.like]: `%${search}%` } },
      { clientName: { [Op.like]: `%${search}%` } },
      { jobNumber: { [Op.like]: `%${search}%` } },
    ];

    const { count, rows } = await Proforma.findAndCountAll({
      where, offset: skip, limit,
      order: [['createdAt', 'DESC']],
      include: proformaIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

/**
 * GET /api/proformas/:id
 */
const getProformaById = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id, { include: proformaIncludes });
    if (!proforma) return error(res, 'Proforma not found.', 404);
    return success(res, proforma);
  } catch (err) { next(err); }
};

/**
 * POST /api/proformas
 */
const createProforma = async (req, res, next) => {
  try {
    const {
      jobNumber, jobName, clientName, clientPhone, jobCreatedAt,
      items = [], taxRate, discount, validUntil, notes, terms,
    } = req.body;

    const proformaNo = await Proforma.generateProformaNo();
    const { subtotal, taxRate: tax, taxAmount, discount: disc, totalAmount } = computeTotals(items, taxRate, discount);

    const proforma = await Proforma.create({
      proformaNo,
      jobNumber: jobNumber || null,
      jobName: jobName || null,
      clientName: clientName || null,
      clientPhone: clientPhone || null,
      jobCreatedAt: jobCreatedAt || null,
      subtotal, taxRate: tax, taxAmount, discount: disc, totalAmount,
      validUntil: validUntil || null,
      notes: notes || null,
      terms: terms || null,
      createdById: req.user.id,
    });

    if (items.length) {
      await ProformaItem.bulkCreate(
        items.map((i) => ({
          proformaId: proforma.id,
          description: i.description,
          qty: parseFloat(i.qty),
          unitPrice: parseFloat(i.unitPrice),
          totalPrice: parseFloat((i.qty * i.unitPrice).toFixed(2)),
        }))
      );
    }

    const created = await Proforma.findByPk(proforma.id, { include: proformaIncludes });
    return success(res, created, 'Proforma created successfully.', 201);
  } catch (err) { next(err); }
};

/**
 * PUT /api/proformas/:id
 */
const updateProforma = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id);
    if (!proforma) return error(res, 'Proforma not found.', 404);
    if (proforma.status !== 'draft') return error(res, `Cannot edit a proforma with status "${proforma.status}".`, 422);

    const {
      jobNumber, jobName, clientName, clientPhone, jobCreatedAt,
      items, taxRate, discount, validUntil, notes, terms,
    } = req.body;

    // Replace items if provided
    let financials = {};
    if (items !== undefined) {
      await ProformaItem.destroy({ where: { proformaId: proforma.id } });
      if (items.length) {
        await ProformaItem.bulkCreate(
          items.map((i) => ({
            proformaId: proforma.id,
            description: i.description,
            qty: parseFloat(i.qty),
            unitPrice: parseFloat(i.unitPrice),
            totalPrice: parseFloat((i.qty * i.unitPrice).toFixed(2)),
          }))
        );
      }
      financials = computeTotals(items, taxRate ?? proforma.taxRate, discount ?? proforma.discount);
    } else if (taxRate !== undefined || discount !== undefined) {
      const existingItems = await ProformaItem.findAll({ where: { proformaId: proforma.id } });
      financials = computeTotals(
        existingItems.map(i => ({ qty: i.qty, unitPrice: i.unitPrice })),
        taxRate ?? proforma.taxRate,
        discount ?? proforma.discount
      );
    }

    await proforma.update({
      ...(jobNumber !== undefined && { jobNumber }),
      ...(jobName !== undefined && { jobName }),
      ...(clientName !== undefined && { clientName }),
      ...(clientPhone !== undefined && { clientPhone }),
      ...(jobCreatedAt !== undefined && { jobCreatedAt }),
      ...(validUntil !== undefined && { validUntil }),
      ...(notes !== undefined && { notes }),
      ...(terms !== undefined && { terms }),
      ...financials,
    });

    const updated = await Proforma.findByPk(proforma.id, { include: proformaIncludes });
    return success(res, updated, 'Proforma updated successfully.');
  } catch (err) { next(err); }
};

/**
 * PATCH /api/proformas/:id/status
 */
const updateProformaStatus = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id);
    if (!proforma) return error(res, 'Proforma not found.', 404);

    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}.`, 400);

    await proforma.update({ status });
    return success(res, { id: proforma.id, proformaNo: proforma.proformaNo, status }, 'Proforma status updated.');
  } catch (err) { next(err); }
};

/**
 * DELETE /api/proformas/:id
 */
const deleteProforma = async (req, res, next) => {
  try {
    const proforma = await Proforma.findByPk(req.params.id);
    if (!proforma) return error(res, 'Proforma not found.', 404);
    if (proforma.status !== 'draft') return error(res, 'Only draft proformas can be deleted.', 422);

    await proforma.destroy();
    return success(res, null, 'Proforma deleted successfully.');
  } catch (err) { next(err); }
};

module.exports = { getAllProformas, getProformaById, createProforma, updateProforma, updateProformaStatus, deleteProforma };
