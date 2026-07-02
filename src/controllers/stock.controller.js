const { Op } = require('sequelize');
const StockItem = require('../database/models/StockItem');
const StockEntry = require('../database/models/StockEntry');
const StockSortie = require('../database/models/StockSortie');
const Job = require('../database/models/Job');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const entryIncludes = [
  { model: StockItem, as: 'stockItem', attributes: ['id', 'itemName', 'category', 'unit', 'currentStock'] },
  { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email', 'role'] },
];

const sortieIncludes = [
  { model: StockItem, as: 'stockItem', attributes: ['id', 'itemName', 'category', 'unit', 'currentStock'] },
  { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'role'] },
  { model: User, as: 'approvedBy', attributes: ['id', 'name', 'email', 'role'] },
  { model: Job, as: 'job', attributes: ['id', 'jobNumber', 'title'] },
];

// ── Stock Items ───────────────────────────────────────────────────────────────

const getAllItems = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, stockStatus, search, type } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;
    if (type) where.type = type;

    // Role-based stock type filter
    if (req.user.role === 'RECEPTIONIST') where.type = 'boutique';
    if (req.user.role === 'HOBE') where.type = 'general';
    if (req.user.role === 'SUPERVISOR') where.type = 'binding';

    if (search) {
      where[Op.or] = [
        { itemName: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { supplier: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await StockItem.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['itemName', 'ASC']],
    });

    const data = rows.map((item) => ({ ...item.toJSON(), stockStatus: item.stockStatus }));
    const filtered = stockStatus ? data.filter((i) => i.stockStatus === stockStatus) : data;

    return paginated(res, filtered, stockStatus ? filtered.length : count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) return error(res, 'Stock item not found.', 404);
    return success(res, { ...item.toJSON(), stockStatus: item.stockStatus });
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { itemName, category, unit, description, supplier, unitCost, currentStock, alarmStock, type } = req.body;
    const item = await StockItem.create({
      itemName, category, unit, description, supplier, unitCost,
      currentStock: currentStock || 0,
      alarmStock: alarmStock || 5,
      type: type || 'boutique',
    });
    return success(res, { ...item.toJSON(), stockStatus: item.stockStatus }, 'Stock item created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) return error(res, 'Stock item not found.', 404);

    const { itemName, category, unit, description, supplier, unitCost, alarmStock, isActive, type } = req.body;
    await item.update({
      ...(itemName !== undefined && { itemName }),
      ...(category !== undefined && { category }),
      ...(unit !== undefined && { unit }),
      ...(description !== undefined && { description }),
      ...(supplier !== undefined && { supplier }),
      ...(unitCost !== undefined && { unitCost }),
      ...(alarmStock !== undefined && { alarmStock }),
      ...(isActive !== undefined && { isActive }),
      ...(type !== undefined && { type }),
    });
    return success(res, { ...item.toJSON(), stockStatus: item.stockStatus }, 'Stock item updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) return error(res, 'Stock item not found.', 404);
    await item.update({ isActive: false });
    return success(res, null, 'Stock item deleted successfully.');
  } catch (err) {
    next(err);
  }
};

// ── Stock Entries (IN) ────────────────────────────────────────────────────────

const getAllEntries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { stockItemId } = req.query;

    const where = {};
    if (stockItemId) where.stockItemId = stockItemId;

    const { count, rows } = await StockEntry.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['entryDate', 'DESC']],
      include: entryIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const createEntry = async (req, res, next) => {
  try {
    const { stockItemId, quantityIn, unitCost, supplier, referenceNo, notes, entryDate } = req.body;

    const item = await StockItem.findByPk(stockItemId);
    if (!item) return error(res, 'Stock item not found.', 404);

    const stockBefore = parseFloat(item.currentStock);
    const qty = parseFloat(quantityIn);
    const stockAfter = stockBefore + qty;
    const totalCost = unitCost ? qty * parseFloat(unitCost) : null;

    const entry = await StockEntry.create({
      stockItemId,
      receivedById: req.user.id,
      quantityIn: qty,
      unitCost: unitCost || null,
      totalCost,
      supplier: supplier || item.supplier,
      referenceNo: referenceNo || null,
      notes: notes || null,
      entryDate: entryDate || new Date(),
      stockBefore,
      stockAfter,
    });

    await item.update({ currentStock: stockAfter, ...(unitCost && { unitCost }) });

    if (stockBefore <= item.alarmStock) {
      await notify({
        createdById: req.user.id,
        title: 'Stock Restocked',
        message: `"${item.itemName}" restocked. New stock: ${stockAfter} ${item.unit || ''}.`,
        type: 'GENERAL',
        relatedEntityType: 'stockEntry',
        relatedEntityId: entry.id,
        targetRoles: ['ADMIN', 'STOCK'],
      });
    }

    const created = await StockEntry.findByPk(entry.id, { include: entryIncludes });
    return success(res, created, 'Stock entry recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// ── Stock Sorties (OUT) ───────────────────────────────────────────────────────

const getAllSorties = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { stockItemId, status, jobId, requesterRole } = req.query;

    const where = {};
    if (stockItemId) where.stockItemId = stockItemId;
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    // Filter by the role of the requester (e.g. RECEPTIONIST or HOBE)
    const requesterWhere = requesterRole ? { role: requesterRole } : undefined;

    const { count, rows } = await StockSortie.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['sortieDate', 'DESC']],
      include: sortieIncludes.map((inc) =>
        inc.as === 'requester' && requesterWhere
          ? { ...inc, where: requesterWhere }
          : inc
      ),
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getSortieById = async (req, res, next) => {
  try {
    const sortie = await StockSortie.findByPk(req.params.id, { include: sortieIncludes });
    if (!sortie) return error(res, 'Stock sortie not found.', 404);
    return success(res, sortie);
  } catch (err) {
    next(err);
  }
};

const getMySorties = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { requesterId: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await StockSortie.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['sortieDate', 'DESC']],
      include: sortieIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const createSortie = async (req, res, next) => {
  try {
    const { stockItemId, quantityOut, jobId, dossierNo, reason, notes, sortieDate } = req.body;

    const item = await StockItem.findByPk(stockItemId);
    if (!item) return error(res, 'Stock item not found.', 404);

    // Role-based stock type restriction
    if (req.user.role === 'RECEPTIONIST' && item.type !== 'boutique')
      return error(res, 'You can only request stock items designated for boutique.', 403);
    if (req.user.role === 'HOBE' && item.type !== 'general')
      return error(res, 'You can only request stock items designated for general use.', 403);
    if (req.user.role === 'SUPERVISOR' && item.type !== 'binding')
      return error(res, 'You can only request stock items designated for binding.', 403);

    const stockBefore = parseFloat(item.currentStock);
    const qty = parseFloat(quantityOut);

    if (qty > stockBefore) {
      return error(res, `Insufficient stock. Available: ${stockBefore} ${item.unit || ''}, requested: ${qty}.`, 422);
    }

    // Resolve dossierNo from job if jobId provided
    let resolvedDossierNo = dossierNo;
    if (jobId && !dossierNo) {
      const job = await Job.findByPk(jobId);
      if (job) resolvedDossierNo = job.jobNumber;
    }

    const sortie = await StockSortie.create({
      stockItemId,
      requesterId: req.user.id,
      approvedById: null,
      jobId: jobId || null,
      dossierNo: resolvedDossierNo || null,
      quantityOut: qty,
      reason: reason || null,
      notes: notes || null,
      status: 'pending',
      sortieDate: sortieDate || new Date(),
      stockBefore,
      stockAfter: stockBefore - qty,
    });

    await notify({
      createdById: req.user.id,
      title: 'Stock Sortie Request',
      message: `${req.user.name || 'A user'} (${req.user.role}) requested ${qty} ${item.unit || ''} of "${item.itemName}"${resolvedDossierNo ? ` for ${resolvedDossierNo}` : ''}.`,
      type: 'GENERAL',
      relatedEntityType: 'stockSortie',
      relatedEntityId: sortie.id,
      targetRoles: ['STOCK', 'ADMIN'],
    });

    const created = await StockSortie.findByPk(sortie.id, { include: sortieIncludes });
    return success(res, created, 'Stock sortie request created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const approveSortie = async (req, res, next) => {
  try {
    const sortie = await StockSortie.findByPk(req.params.id);
    if (!sortie) return error(res, 'Stock sortie not found.', 404);
    if (sortie.status !== 'pending') return error(res, `Sortie is already ${sortie.status}.`, 409);

    const item = await StockItem.findByPk(sortie.stockItemId);
    const stockBefore = parseFloat(item.currentStock);
    const qty = parseFloat(sortie.quantityOut);

    if (qty > stockBefore) {
      return error(res, `Insufficient stock. Available: ${stockBefore}, requested: ${qty}.`, 422);
    }

    const stockAfter = stockBefore - qty;
    await sortie.update({ status: 'approved', approvedById: req.user.id, stockBefore, stockAfter });
    await item.update({ currentStock: stockAfter });

    await notify({
      createdById: req.user.id,
      title: 'Stock Sortie Approved',
      message: `Your request for ${qty} ${item.unit || ''} of "${item.itemName}" has been approved.`,
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
        targetRoles: ['ADMIN', 'STOCK'],
      });
    }

    const updated = await StockSortie.findByPk(sortie.id, { include: sortieIncludes });
    return success(res, updated, 'Stock sortie approved successfully.');
  } catch (err) {
    next(err);
  }
};

const rejectSortie = async (req, res, next) => {
  try {
    const sortie = await StockSortie.findByPk(req.params.id);
    if (!sortie) return error(res, 'Stock sortie not found.', 404);
    if (sortie.status !== 'pending') return error(res, `Sortie is already ${sortie.status}.`, 409);

    const { notes } = req.body;

    await sortie.update({ status: 'rejected', approvedById: req.user.id, ...(notes && { notes }) });

    const item = await StockItem.findByPk(sortie.stockItemId);
    await notify({
      createdById: req.user.id,
      title: 'Stock Sortie Rejected',
      message: `Your request for ${sortie.quantityOut} ${item.unit || ''} of "${item.itemName}" has been rejected.${notes ? ` Reason: ${notes}` : ''}`,
      type: 'GENERAL',
      relatedEntityType: 'stockSortie',
      relatedEntityId: sortie.id,
      targetUserIds: [sortie.requesterId],
    });

    const updated = await StockSortie.findByPk(sortie.id, { include: sortieIncludes });
    return success(res, updated, 'Stock sortie rejected.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllItems, getItemById, createItem, updateItem, deleteItem,
  getAllEntries, createEntry,
  getAllSorties, getSortieById, getMySorties, createSortie, approveSortie, rejectSortie,
};
