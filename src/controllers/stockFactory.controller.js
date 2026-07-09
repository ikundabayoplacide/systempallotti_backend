const { Op } = require('sequelize');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

/**
 * Factory that returns a full set of controller functions
 * for a given stock (boutique / general / binding).
 *
 * @param {Model} Item     - StockItem model
 * @param {Model} Entry    - StockEntry model
 * @param {Model} Sortie   - StockSortie model
 * @param {Model} User     - User model
 * @param {string[]} managerRoles  - roles that manage this stock (approve/reject)
 * @param {string[]} requesterRoles - roles that can request sorties
 */
const createStockController = (Item, Entry, Sortie, User, managerRoles) => {
  const entryIncludes = [
    { model: Item, as: 'stockItem', attributes: ['id', 'itemName', 'unit', 'currentStock'] },
    { model: User, as: 'receivedBy', attributes: ['id', 'name', 'role'] },
  ];
  const sortieIncludes = [
    { model: Item, as: 'stockItem', attributes: ['id', 'itemName', 'unit', 'currentStock'] },
    { model: User, as: 'requester', attributes: ['id', 'name', 'role'] },
    { model: User, as: 'approvedBy', attributes: ['id', 'name', 'role'] },
  ];

  // ── Items ──────────────────────────────────────────────────────────────────

  const getAllItems = async (req, res, next) => {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { search, stockStatus } = req.query;

      const where = { isActive: true };
      if (search) {
        where[Op.or] = [
          { itemName: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } },
          { supplier: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Item.findAndCountAll({ where, offset: skip, limit, order: [['itemName', 'ASC']] });
      const data = rows.map((i) => ({ ...i.toJSON(), stockStatus: i.stockStatus }));
      const filtered = stockStatus ? data.filter((i) => i.stockStatus === stockStatus) : data;

      return paginated(res, filtered, stockStatus ? filtered.length : count, page, limit);
    } catch (err) { next(err); }
  };

  const getItemById = async (req, res, next) => {
    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) return error(res, 'Stock item not found.', 404);
      return success(res, { ...item.toJSON(), stockStatus: item.stockStatus });
    } catch (err) { next(err); }
  };

  const createItem = async (req, res, next) => {
    try {
      const { itemName, category, unit, description, supplier, unitCost, amountPerUnit, currentStock, alarmStock } = req.body;
      if (currentStock === undefined || currentStock === null || currentStock === '') return error(res, 'Initial stock is required.', 400);
      const parsedStock = parseFloat(currentStock);
      if (isNaN(parsedStock)) return error(res, 'Initial stock must be a valid number.', 400);
      const item = await Item.create({ itemName, category, unit: unit || null, description, supplier, unitCost, amountPerUnit: amountPerUnit || null, currentStock: parsedStock, alarmStock: alarmStock || 5 });
      return success(res, { ...item.toJSON(), stockStatus: item.stockStatus }, 'Stock item created successfully.', 201);
    } catch (err) { next(err); }
  };

  const updateItem = async (req, res, next) => {
    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) return error(res, 'Stock item not found.', 404);
      const { itemName, category, unit, description, supplier, unitCost, amountPerUnit, alarmStock, isActive } = req.body;
      await item.update({
        ...(itemName !== undefined && { itemName }),
        ...(category !== undefined && { category }),
        ...(unit !== undefined && { unit }),
        ...(description !== undefined && { description }),
        ...(supplier !== undefined && { supplier }),
        ...(unitCost !== undefined && { unitCost }),
        ...(amountPerUnit !== undefined && { amountPerUnit }),
        ...(alarmStock !== undefined && { alarmStock }),
        ...(isActive !== undefined && { isActive }),
      });
      return success(res, { ...item.toJSON(), stockStatus: item.stockStatus }, 'Stock item updated successfully.');
    } catch (err) { next(err); }
  };

  const deleteItem = async (req, res, next) => {
    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) return error(res, 'Stock item not found.', 404);
      await item.destroy();
      return success(res, null, 'Stock item deleted successfully.');
    } catch (err) { next(err); }
  };

  // ── Entries (IN) ───────────────────────────────────────────────────────────

  const getAllEntries = async (req, res, next) => {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const where = {};
      if (req.query.stockItemId) where.stockItemId = req.query.stockItemId;
      const { count, rows } = await Entry.findAndCountAll({ where, offset: skip, limit, order: [['entryDate', 'DESC']], include: entryIncludes });
      return paginated(res, rows, count, page, limit);
    } catch (err) { next(err); }
  };

  const createEntry = async (req, res, next) => {
    try {
      const { stockItemId, quantityIn, quantity, unitCost, supplier, referenceNo, notes, entryDate } = req.body;
      const resolvedQty = quantityIn ?? quantity;
      const item = await Item.findByPk(stockItemId);
      if (!item) return error(res, 'Stock item not found.', 404);

      const stockBefore = parseFloat(item.currentStock);
      const qty = parseFloat(resolvedQty);
      if (isNaN(qty)) return error(res, 'Quantity is required and must be a valid number.', 400);
      const stockAfter = stockBefore + qty;
      const totalCost = unitCost ? qty * parseFloat(unitCost) : null;

      const entry = await Entry.create({ stockItemId, receivedById: req.user.id, quantityIn: qty, unitCost: unitCost || null, totalCost, supplier: supplier || item.supplier, referenceNo: referenceNo || null, notes: notes || null, entryDate: entryDate || new Date(), stockBefore, stockAfter });
      await item.update({ currentStock: stockAfter, ...(unitCost && { unitCost }) });

      const created = await Entry.findByPk(entry.id, { include: entryIncludes });
      return success(res, created, 'Stock entry recorded successfully.', 201);
    } catch (err) { next(err); }
  };

  // ── Sorties (OUT) ──────────────────────────────────────────────────────────

  const getAllSorties = async (req, res, next) => {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const where = {};
      if (req.query.status) where.status = req.query.status;
      if (req.query.stockItemId) where.stockItemId = req.query.stockItemId;
      const { count, rows } = await Sortie.findAndCountAll({ where, offset: skip, limit, order: [['sortieDate', 'DESC']], include: sortieIncludes });
      return paginated(res, rows, count, page, limit);
    } catch (err) { next(err); }
  };

  const getSortieById = async (req, res, next) => {
    try {
      const sortie = await Sortie.findByPk(req.params.id, { include: sortieIncludes });
      if (!sortie) return error(res, 'Sortie not found.', 404);
      return success(res, sortie);
    } catch (err) { next(err); }
  };

  const getMySorties = async (req, res, next) => {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const where = { requesterId: req.user.id };
      if (req.query.status) where.status = req.query.status;
      const { count, rows } = await Sortie.findAndCountAll({ where, offset: skip, limit, order: [['sortieDate', 'DESC']], include: sortieIncludes });
      return paginated(res, rows, count, page, limit);
    } catch (err) { next(err); }
  };

  const createSortie = async (req, res, next) => {
    try {
      const { stockItemId, quantityOut, reason, notes, sortieDate, jobId } = req.body;
      const item = await Item.findByPk(stockItemId);
      if (!item) return error(res, 'Stock item not found.', 404);

      const stockBefore = parseFloat(item.currentStock);
      const qty = parseFloat(quantityOut);
      if (qty > stockBefore) return error(res, `Insufficient stock. Available: ${stockBefore} ${item.unit || ''}, requested: ${qty}.`, 422);

      const sortie = await Sortie.create({
        stockItemId, requesterId: req.user.id, approvedById: null,
        ...(jobId !== undefined && { jobId }),
        quantityOut: qty, reason: reason || null, notes: notes || null,
        status: 'pending', sortieDate: sortieDate || new Date(), stockBefore, stockAfter: stockBefore - qty,
      });

      await notify({
        createdById: req.user.id,
        title: 'Stock Sortie Request',
        message: `${req.user.name || 'A user'} requested ${qty} ${item.unit || ''} of "${item.itemName}".`,
        type: 'GENERAL',
        relatedEntityType: 'stockSortie',
        relatedEntityId: sortie.id,
        targetRoles: managerRoles,
      });

      const created = await Sortie.findByPk(sortie.id, { include: sortieIncludes });
      return success(res, created, 'Stock sortie request created successfully.', 201);
    } catch (err) { next(err); }
  };

  const approveSortie = async (req, res, next) => {
    try {
      const sortie = await Sortie.findByPk(req.params.id);
      if (!sortie) return error(res, 'Sortie not found.', 404);
      if (sortie.status !== 'pending') return error(res, `Sortie is already ${sortie.status}.`, 409);

      const item = await Item.findByPk(sortie.stockItemId);
      const stockBefore = parseFloat(item.currentStock);
      const qty = parseFloat(sortie.quantityOut);
      if (qty > stockBefore) return error(res, `Insufficient stock. Available: ${stockBefore}, requested: ${qty}.`, 422);

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
          targetRoles: managerRoles,
        });
      }

      const [updated, updatedItem] = await Promise.all([
        Sortie.findByPk(sortie.id, { include: sortieIncludes }),
        Item.findByPk(item.id),
      ]);
      const data = {
        ...updated.toJSON(),
        stockItem: {
          ...updated.toJSON().stockItem,
          currentStock: parseFloat(updatedItem.currentStock),
          stockStatus: updatedItem.stockStatus,
        },
      };
      return success(res, data, 'Stock sortie approved successfully.');
    } catch (err) { next(err); }
  };

  const rejectSortie = async (req, res, next) => {
    try {
      const sortie = await Sortie.findByPk(req.params.id);
      if (!sortie) return error(res, 'Sortie not found.', 404);
      if (sortie.status !== 'pending') return error(res, `Sortie is already ${sortie.status}.`, 409);

      const { notes } = req.body;
      await sortie.update({ status: 'rejected', approvedById: req.user.id, ...(notes && { notes }) });

      const item = await Item.findByPk(sortie.stockItemId);
      await notify({
        createdById: req.user.id,
        title: 'Stock Sortie Rejected',
        message: `Your request for ${sortie.quantityOut} ${item.unit || ''} of "${item.itemName}" has been rejected.${notes ? ` Reason: ${notes}` : ''}`,
        type: 'GENERAL',
        relatedEntityType: 'stockSortie',
        relatedEntityId: sortie.id,
        targetUserIds: [sortie.requesterId],
      });

      const updated = await Sortie.findByPk(sortie.id, { include: sortieIncludes });
      return success(res, updated, 'Stock sortie rejected.');
    } catch (err) { next(err); }
  };

  const updateSortie = async (req, res, next) => {
    try {
      const sortie = await Sortie.findByPk(req.params.id);
      if (!sortie) return error(res, 'Sortie not found.', 404);
      if (sortie.requesterId !== req.user.id) return error(res, 'Forbidden.', 403);
      if (sortie.status !== 'pending') return error(res, 'Only pending sorties can be edited.', 409);

      const { quantityOut, reason, notes } = req.body;
      if (quantityOut !== undefined) {
        const item = await Item.findByPk(sortie.stockItemId);
        const qty = parseFloat(quantityOut);
        if (isNaN(qty) || qty <= 0) return error(res, 'Invalid quantity.', 422);
        if (qty > parseFloat(item.currentStock)) return error(res, `Insufficient stock. Available: ${item.currentStock}.`, 422);
        await sortie.update({ quantityOut: qty, stockAfter: parseFloat(item.currentStock) - qty, ...(reason !== undefined && { reason }), ...(notes !== undefined && { notes }) });
      } else {
        await sortie.update({ ...(reason !== undefined && { reason }), ...(notes !== undefined && { notes }) });
      }

      const updated = await Sortie.findByPk(sortie.id, { include: sortieIncludes });
      return success(res, updated, 'Sortie updated successfully.');
    } catch (err) { next(err); }
  };

  const deleteSortie = async (req, res, next) => {
    try {
      const sortie = await Sortie.findByPk(req.params.id);
      if (!sortie) return error(res, 'Sortie not found.', 404);
      if (sortie.requesterId !== req.user.id) return error(res, 'Forbidden.', 403);
      if (sortie.status !== 'pending') return error(res, 'Only pending sorties can be deleted.', 409);
      await sortie.destroy();
      return success(res, null, 'Sortie deleted successfully.');
    } catch (err) { next(err); }
  };

  return { getAllItems, getItemById, createItem, updateItem, deleteItem, getAllEntries, createEntry, getAllSorties, getSortieById, getMySorties, createSortie, updateSortie, deleteSortie, approveSortie, rejectSortie };
};

module.exports = createStockController;
