const { Op } = require('sequelize');
const User = require('../database/models/User');
const BoutiqueStockItem = require('../database/models/BoutiqueStockItem');
const BoutiqueStockEntry = require('../database/models/BoutiqueStockEntry');
const BoutiqueStockSortie = require('../database/models/BoutiqueStockSortie');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');
const createStockController = require('./stockFactory.controller');

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

module.exports = {
  ...base,
  approveSortie,
  takeSortie,
  deleteSortie,
};
