const { Op, fn, col } = require('sequelize');
const Hobe = require('../database/models/Hobe');
const HobeSale = require('../database/models/HobeSale');
const User = require('../database/models/User');
const Customer = require('../database/models/Customer');
const notify = require('../utils/notification.service');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination, generateNumber } = require('../utils/helpers');

const calcPayment = (totalPrice, amountPaid) => {
  const diff = parseFloat(amountPaid) - parseFloat(totalPrice);
  return {
    balanceDue: diff < 0 ? Math.abs(diff) : 0,
    changeGiven: diff > 0 ? diff : 0,
    paymentStatus: diff < 0 ? 'partial' : diff > 0 ? 'overpaid' : 'paid',
  };
};

const hobeIncludes = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
];

// ── Hobe CRUD ─────────────────────────────────────────────────────────────────

const getAllHobes = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { hobeNo: { [Op.iLike]: `%${search}%` } },
        { nameOfHobe: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Hobe.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: hobeIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getHobeById = async (req, res, next) => {
  try {
    const hobe = await Hobe.findByPk(req.params.id, { include: hobeIncludes });
    if (!hobe) return error(res, 'Hobe not found.', 404);
    return success(res, hobe);
  } catch (err) {
    next(err);
  }
};

const createHobe = async (req, res, next) => {
  try {
    const { nameOfHobe, doneAt, expiredAt, qty, pricePerItem, ob, note } = req.body;

    const totalPrice = parseFloat(qty) * parseFloat(pricePerItem);
    const hobeNo = generateNumber('HB');

    const hobe = await Hobe.create({
      hobeNo,
      nameOfHobe,
      doneAt,
      expiredAt: expiredAt || null,
      qty,
      pricePerItem,
      totalPrice,
      qtySold: 0,
      qtyRemains: qty,
      ob: ob || 0,
      note: note || null,
      createdById: req.user.id,
    });

    const created = await Hobe.findByPk(hobe.id, { include: hobeIncludes });

    await notify({
      createdById: req.user.id,
      title: 'New Hobe Received',
      message: `A new hobe "${nameOfHobe}" (${hobeNo}) with quantity ${qty} has been recorded.`,
      type: 'HOBE_CREATED',
      relatedEntityType: 'hobe',
      relatedEntityId: hobe.id,
      targetRoles: ['ADMIN', 'HOBE'],
    });

    return success(res, created, 'Hobe created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateHobe = async (req, res, next) => {
  try {
    const hobe = await Hobe.findByPk(req.params.id);
    if (!hobe) return error(res, 'Hobe not found.', 404);

    const { nameOfHobe, doneAt, expiredAt, pricePerItem, ob, note, status } = req.body;

    const newPrice = pricePerItem !== undefined ? parseFloat(pricePerItem) : parseFloat(hobe.pricePerItem);
    const newTotalPrice = parseFloat(hobe.qty) * newPrice;

    await hobe.update({
      ...(nameOfHobe !== undefined && { nameOfHobe }),
      ...(doneAt !== undefined && { doneAt }),
      ...(expiredAt !== undefined && { expiredAt }),
      ...(pricePerItem !== undefined && { pricePerItem, totalPrice: newTotalPrice }),
      ...(ob !== undefined && { ob }),
      ...(note !== undefined && { note }),
      ...(status !== undefined && { status }),
    });

    const updated = await Hobe.findByPk(hobe.id, { include: hobeIncludes });
    return success(res, updated, 'Hobe updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteHobe = async (req, res, next) => {
  try {
    const hobe = await Hobe.findByPk(req.params.id);
    if (!hobe) return error(res, 'Hobe not found.', 404);
    if (hobe.qtySold > 0) return error(res, 'Cannot delete a hobe with recorded sales.', 422);
    await hobe.destroy();
    return success(res, null, 'Hobe deleted successfully.');
  } catch (err) {
    next(err);
  }
};

// ── Hobe Trade (sell) ─────────────────────────────────────────────────────────

const sellFromHobe = async (req, res, next) => {
  try {
    const hobe = await Hobe.findByPk(req.params.id);
    if (!hobe) return error(res, 'Hobe not found.', 404);
    if (hobe.status !== 'active') return error(res, `Hobe is ${hobe.status} and cannot be traded.`, 422);

    const { quantity, amountPaid, customerId, paymentMethod = 'cash', note } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1)
      return error(res, 'quantity must be a positive integer.', 422);
    if (amountPaid === undefined || amountPaid === null)
      return error(res, 'amountPaid is required.', 422);
    if (parseFloat(amountPaid) < 0)
      return error(res, 'amountPaid cannot be negative.', 422);
    if (hobe.qtyRemains < quantity)
      return error(res, `Insufficient quantity. Available: ${hobe.qtyRemains}, requested: ${quantity}.`, 422);

    const unitPrice = parseFloat(hobe.pricePerItem);
    const totalPrice = quantity * unitPrice;
    const payment = calcPayment(totalPrice, amountPaid);

    const newQtySold = hobe.qtySold + quantity;
    const newQtyRemains = hobe.qtyRemains - quantity;
    const newStatus = newQtyRemains === 0 ? 'closed' : 'active';

    await hobe.update({ qtySold: newQtySold, qtyRemains: newQtyRemains, status: newStatus });

    const sale = await HobeSale.create({
      hobeId: hobe.id,
      soldById: req.user.id,
      customerId: customerId || null,
      quantity,
      unitPrice,
      totalPrice,
      amountPaid,
      ...payment,
      paymentMethod,
      note: note || null,
    });

    return success(res, sale, 'Sale recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// ── Hobe Sales ────────────────────────────────────────────────────────────────

const getHobeSales = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { hobeId, from, to, paymentStatus } = req.query;

    const where = {};
    if (hobeId) where.hobeId = hobeId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const { count, rows } = await HobeSale.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: saleIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getHobeSalesSummary = async (req, res, next) => {
  try {
    const { from, to, hobeId } = req.query;

    const where = {};
    if (hobeId) where.hobeId = hobeId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const [totals] = await HobeSale.findAll({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalTransactions'],
        [fn('SUM', col('quantity')), 'totalQuantitySold'],
        [fn('SUM', col('amount_paid')), 'totalAmountPaid'],
        [fn('SUM', col('total_price')), 'totalExpectedRevenue'],
        [fn('SUM', col('balance_due')), 'totalBalanceDue'],
      ],
      raw: true,
    });

    return success(res, totals);
  } catch (err) {
    next(err);
  }
};

const saleIncludes = [
  { model: Hobe, as: 'hobe', attributes: ['id', 'hobeNo', 'nameOfHobe'] },
  { model: User, as: 'soldBy', attributes: ['id', 'name', 'email'] },
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'], required: false },
];

const updateHobeSale = async (req, res, next) => {
  try {
    const sale = await HobeSale.findByPk(req.params.saleId);
    if (!sale) return error(res, 'Sale not found.', 404);

    const { amountPaid, paymentMethod, note } = req.body;
    const paymentFields = amountPaid !== undefined ? calcPayment(sale.totalPrice, amountPaid) : {};

    await sale.update({
      ...(amountPaid !== undefined && { amountPaid }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(note !== undefined && { note }),
      ...paymentFields,
    });

    const updated = await HobeSale.findByPk(sale.id, { include: saleIncludes });
    return success(res, updated, 'Sale updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteHobeSale = async (req, res, next) => {
  try {
    const sale = await HobeSale.findByPk(req.params.saleId);
    if (!sale) return error(res, 'Sale not found.', 404);

    const hobe = await Hobe.findByPk(sale.hobeId);
    if (!hobe) return error(res, 'Associated hobe not found.', 404);

    await hobe.update({
      qtySold: hobe.qtySold - sale.quantity,
      qtyRemains: hobe.qtyRemains + sale.quantity,
      status: 'active',
    });

    await sale.destroy();
    return success(res, null, 'Sale deleted and quantity restored successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllHobes, getHobeById, createHobe, updateHobe, deleteHobe,
  sellFromHobe,
  getHobeSales, getHobeSalesSummary, updateHobeSale, deleteHobeSale,
};
