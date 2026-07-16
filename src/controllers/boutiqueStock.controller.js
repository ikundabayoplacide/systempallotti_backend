const { Op } = require('sequelize');
const User = require('../database/models/User');
const BoutiqueStockItem = require('../database/models/BoutiqueStockItem');
const BoutiqueStockEntry = require('../database/models/BoutiqueStockEntry');
const BoutiqueStockSortie = require('../database/models/BoutiqueStockSortie');
const BoutiqueSale = require('../database/models/BoutiqueSale');
const Customer = require('../database/models/Customer');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');
const createStockController = require('./stockFactory.controller');

const calcPayment = (totalPrice, amountPaid) => {
  const paid = parseFloat(amountPaid);
  const total = parseFloat(totalPrice);
  if (paid === 0) return { totalPrice: total, balanceDue: total, changeGiven: 0, paymentStatus: 'oncredit' };
  const diff = paid - total;
  return {
    totalPrice: total,
    balanceDue: diff < 0 ? Math.abs(diff) : 0,
    changeGiven: diff > 0 ? diff : 0,
    paymentStatus: diff < 0 ? 'partial' : diff > 0 ? 'overpaid' : 'paid',
  };
};

// Inherit all base item/entry/sortie CRUD from factory
const base = createStockController(
  BoutiqueStockItem,
  BoutiqueStockEntry,
  BoutiqueStockSortie,
  User,
  ['ADMIN', 'DAF']
);

const sortieIncludes = [
  { model: BoutiqueStockItem, as: 'stockItem', attributes: ['id', 'itemName', 'unit', 'currentStock'] },
  { model: User, as: 'requester', attributes: ['id', 'name', 'role'] },
  { model: User, as: 'approvedBy', attributes: ['id', 'name', 'role'] },
];

/**
 * PATCH /boutique-stock/sorties/:id/approve
 * DAF or ADMIN approves — status → 'approved', no stock deduction.
 */
const approveSortie = async (req, res, next) => {
  try {
    const sortie = await BoutiqueStockSortie.findByPk(req.params.id);
    if (!sortie) return error(res, 'Sortie not found.', 404);
    if (sortie.status !== 'pending') return error(res, `Sortie is already ${sortie.status}.`, 409);

    await sortie.update({ status: 'approved', approvedById: req.user.id });

    const item = await BoutiqueStockItem.findByPk(sortie.stockItemId);

    await notify({
      createdById: req.user.id,
      title: 'Stock Sortie Approved',
      message: `Your request for ${sortie.quantityOut} ${item.unit || ''} of "${item.itemName}" has been approved.`,
      type: 'GENERAL',
      relatedEntityType: 'stockSortie',
      relatedEntityId: sortie.id,
      targetUserIds: [sortie.requesterId],
    });

    const updated = await BoutiqueStockSortie.findByPk(sortie.id, { include: sortieIncludes });
    return success(res, updated, 'Sortie approved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /boutique-stock/sorties/:id/take
 * STOCK marks as taken — status → 'taken', stock deducted here.
 */
const takeSortie = async (req, res, next) => {
  try {
    const sortie = await BoutiqueStockSortie.findByPk(req.params.id);
    if (!sortie) return error(res, 'Sortie not found.', 404);
    if (sortie.status !== 'approved') return error(res, `Sortie must be approved before marking as taken. Current status: ${sortie.status}.`, 409);

    const item = await BoutiqueStockItem.findByPk(sortie.stockItemId);
    const stockBefore = parseFloat(item.currentStock);
    const qty = parseFloat(sortie.quantityOut);

    if (qty > stockBefore) return error(res, `Insufficient stock. Available: ${stockBefore}, requested: ${qty}.`, 422);

    const stockAfter = stockBefore - qty;

    await item.update({ currentStock: stockAfter });
    await sortie.update({ status: 'taken', takenById: req.user.id, takenAt: new Date(), stockBefore, stockAfter });

    await notify({
      createdById: req.user.id,
      title: 'Stock Sortie Taken',
      message: `Your request for ${qty} ${item.unit || ''} of "${item.itemName}" has been collected from stock.`,
      type: 'GENERAL',
      relatedEntityType: 'stockSortie',
      relatedEntityId: sortie.id,
      targetUserIds: [sortie.requesterId],
    });

    if (stockAfter <= item.alarmStock) {
      await notify({
        createdById: req.user.id,
        title: 'Low Stock Alert',
        message: `"${item.itemName}" is running low. Current stock: ${stockAfter} ${item.unit || ''}.`,
        type: 'GENERAL',
        relatedEntityType: 'stockItem',
        relatedEntityId: item.id,
        targetRoles: ['ADMIN', 'DAF'],
      });
    }

    const [updated, updatedItem] = await Promise.all([
      BoutiqueStockSortie.findByPk(sortie.id, { include: sortieIncludes }),
      BoutiqueStockItem.findByPk(item.id),
    ]);

    return success(res, {
      ...updated.toJSON(),
      stockItem: {
        ...updated.toJSON().stockItem,
        currentStock: parseFloat(updatedItem.currentStock),
        stockStatus: updatedItem.stockStatus,
      },
    }, 'Sortie marked as taken and stock deducted.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /boutique-stock/sorties/:id
 * Any authenticated user can delete regardless of status.
 */
const deleteSortie = async (req, res, next) => {
  try {
    const sortie = await BoutiqueStockSortie.findByPk(req.params.id);
    if (!sortie) return error(res, 'Sortie not found.', 404);
    await sortie.destroy();
    return success(res, null, 'Sortie deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /boutique-stock/items/:id/sell
 * Stock manager sells a boutique stock item directly.
 */
const sellStockItem = async (req, res, next) => {
  try {
    const item = await BoutiqueStockItem.findByPk(req.params.id);
    if (!item) return error(res, 'Stock item not found.', 404);

    const {
      quantity,
      unitPrice,
      amountPaid,
      paymentMethod = 'cash',
      customerId,
      customerName, customerPhone,
      note,
    } = req.body;

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    const paid = parseFloat(amountPaid);

    if (!qty || qty <= 0) return error(res, 'quantity must be a positive number.', 422);
    if (!price || price < 0) return error(res, 'unitPrice is required and must be non-negative.', 422);
    if (paid === undefined || paid === null || isNaN(paid)) return error(res, 'amountPaid is required.', 422);
    if (paid < 0) return error(res, 'amountPaid cannot be negative.', 422);

    const currentStock = parseFloat(item.currentStock);
    if (qty > currentStock)
      return error(res, `Insufficient stock. Available: ${currentStock}, requested: ${qty}.`, 422);

    // Resolve customer
    let resolvedCustomerId = customerId || null;
    if (!resolvedCustomerId && customerName && customerPhone) {
      const [customer] = await Customer.findOrCreate({
        where: { phone: customerPhone },
        defaults: { name: customerName, phone: customerPhone, type: 'RETAIL', isActive: true },
      });
      resolvedCustomerId = customer.id;
    }

    const stockAfter = currentStock - qty;
    await item.update({ currentStock: stockAfter });

    const totalPrice = qty * price;

    const sale = await BoutiqueSale.create({
      stockItemId: item.id,
      productId: null,
      soldById: req.user.id,
      customerId: resolvedCustomerId,
      quantity: qty,
      unitPrice: price,
      amountPaid: paid,
      ...calcPayment(totalPrice, paid),
      paymentMethod,
      note: note || null,
    });

    if (stockAfter <= item.alarmStock) {
      await notify({
        createdById: req.user.id,
        title: 'Low Stock Alert',
        message: `"${item.itemName}" is running low. Current stock: ${stockAfter} ${item.unit || ''}.`,
        type: 'GENERAL',
        relatedEntityType: 'stockItem',
        relatedEntityId: item.id,
        targetRoles: ['ADMIN', 'DAF'],
      });
    }

    return success(res, {
      sale,
      stockItem: { ...item.toJSON(), currentStock: stockAfter, stockStatus: item.stockStatus },
    }, 'Sale recorded successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /boutique-stock/sales
 * Returns all sales made from boutique stock items.
 * Filterable by stockItemId, paymentStatus, from, to.
 */
const getStockItemSales = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { stockItemId, paymentStatus, from, to } = req.query;

    const where = { stockItemId: { [Op.ne]: null } };
    if (stockItemId) where.stockItemId = stockItemId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setUTCHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = toDate;
      }
    }

    const { count, rows } = await BoutiqueSale.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: BoutiqueStockItem, as: 'stockItem', attributes: ['id', 'itemName', 'unit', 'category'] },
        { model: User, as: 'soldBy', attributes: ['id', 'name', 'role'] },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'], required: false },
      ],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /boutique-stock/sales/:id
 * Edit a stock item sale. Adjusts stock if quantity changed.
 */
const updateStockItemSale = async (req, res, next) => {
  try {
    const sale = await BoutiqueSale.findByPk(req.params.id);
    if (!sale || !sale.stockItemId) return error(res, 'Sale not found.', 404);

    if (req.user.role === 'STOCK' && sale.soldById !== req.user.id)
      return error(res, 'You can only edit your own sales.', 403);

    const { quantity, unitPrice, amountPaid, paymentMethod, note } = req.body;

    const newQty = quantity !== undefined ? parseFloat(quantity) : parseFloat(sale.quantity);
    const newUnitPrice = unitPrice !== undefined ? parseFloat(unitPrice) : parseFloat(sale.unitPrice);
    const newAmountPaid = amountPaid !== undefined ? parseFloat(amountPaid) : parseFloat(sale.amountPaid);

    if (newQty <= 0) return error(res, 'quantity must be a positive number.', 422);
    if (newAmountPaid < 0) return error(res, 'amountPaid cannot be negative.', 422);

    // Adjust stock if quantity changed
    const qtyDiff = newQty - parseFloat(sale.quantity);
    if (qtyDiff !== 0) {
      const item = await BoutiqueStockItem.findByPk(sale.stockItemId);
      if (!item) return error(res, 'Associated stock item not found.', 404);

      const currentStock = parseFloat(item.currentStock);
      const stockAfter = currentStock - qtyDiff;

      if (stockAfter < 0)
        return error(res, `Insufficient stock. Available: ${currentStock}, need ${qtyDiff} more.`, 422);

      await item.update({ currentStock: stockAfter });
    }

    const newTotalPrice = newQty * newUnitPrice;

    await sale.update({
      quantity: newQty,
      unitPrice: newUnitPrice,
      amountPaid: newAmountPaid,
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(note !== undefined && { note }),
      ...calcPayment(newTotalPrice, newAmountPaid),
    });

    const updated = await BoutiqueSale.findByPk(sale.id, {
      include: [
        { model: BoutiqueStockItem, as: 'stockItem', attributes: ['id', 'itemName', 'unit', 'category'] },
        { model: User, as: 'soldBy', attributes: ['id', 'name', 'role'] },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'], required: false },
      ],
    });

    return success(res, updated, 'Sale updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /boutique-stock/sales/:id
 * Delete a stock item sale and restore stock.
 */
const deleteStockItemSale = async (req, res, next) => {
  try {
    const sale = await BoutiqueSale.findByPk(req.params.id);
    if (!sale || !sale.stockItemId) return error(res, 'Sale not found.', 404);

    if (req.user.role === 'STOCK' && sale.soldById !== req.user.id)
      return error(res, 'You can only delete your own sales.', 403);

    const item = await BoutiqueStockItem.findByPk(sale.stockItemId);
    if (!item) return error(res, 'Associated stock item not found.', 404);

    await item.update({ currentStock: parseFloat(item.currentStock) + parseFloat(sale.quantity) });
    await sale.destroy();

    return success(res, null, 'Sale deleted and stock restored successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  ...base,
  approveSortie,
  takeSortie,
  deleteSortie,
  sellStockItem,
  getStockItemSales,
  updateStockItemSale,
  deleteStockItemSale,
};
