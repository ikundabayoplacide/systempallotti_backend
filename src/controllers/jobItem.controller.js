const JobItem = require('../database/models/JobItem');
const Job = require('../database/models/Job');
const StockItem = require('../database/models/StockItem');
const Proforma = require('../database/models/Proforma');
const { success, error } = require('../utils/apiResponse');

// Recompute job.amount from all its items and sync the draft proforma
const syncJobAmount = async (jobId) => {
  const items = await JobItem.findAll({ where: { jobId } });
  const total = items.reduce((sum, i) => sum + (parseFloat(i.totalCost) || 0), 0);

  await Job.update({ amount: total }, { where: { id: jobId } });

  const proforma = await Proforma.findOne({
    where: { jobId, status: 'draft' },
    order: [['createdAt', 'DESC']],
  });
  if (proforma) {
    const tax = parseFloat(proforma.taxRate) || 0;
    const disc = parseFloat(proforma.discount) || 0;
    const taxAmount = parseFloat(((total * tax) / 100).toFixed(2));
    const totalAmount = parseFloat((total + taxAmount - disc).toFixed(2));
    await proforma.update({ subtotal: total, taxAmount, totalAmount });
  }
};

const jobItemIncludes = [
  { model: StockItem, as: 'stockItem', attributes: ['id', 'itemName', 'category', 'unit', 'currentStock'] },
];

/**
 * GET /api/jobs/:jobId/items
 * Get all items for a job.
 */
const getJobItems = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) return error(res, 'Job not found.', 404);

    const items = await JobItem.findAll({
      where: { jobId: req.params.jobId },
      include: jobItemIncludes,
      order: [['createdAt', 'ASC']],
    });

    return success(res, items);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs/:jobId/items
 * Add a stock item to a job.
 */
const addJobItem = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) return error(res, 'Job not found.', 404);

    const { stockItemId, itemName, unit, unitCost, quantityNeeded, notes } = req.body;

    if (!stockItemId && !itemName) return error(res, 'Either stockItemId or itemName is required.', 400);

    if (stockItemId) {
      const stockItem = await StockItem.findByPk(stockItemId);
      if (!stockItem) return error(res, 'Stock item not found.', 404);
      if (!stockItem.isActive) return error(res, `Stock item "${stockItem.itemName}" is inactive.`, 422);

      const existing = await JobItem.findOne({ where: { jobId: req.params.jobId, stockItemId } });
      if (existing) return error(res, 'This stock item is already added to the job. Update it instead.', 409);

      if (parseFloat(quantityNeeded) > parseFloat(stockItem.currentStock)) {
        return error(res, `Insufficient stock for "${stockItem.itemName}". Available: ${stockItem.currentStock} ${stockItem.unit || ''}, requested: ${quantityNeeded}.`, 422);
      }
    }

    const jobItem = await JobItem.create({
      jobId: req.params.jobId,
      stockItemId: stockItemId || null,
      itemName: itemName || null,
      unit: unit || null,
      unitCost: unitCost || null,
      totalCost: unitCost && quantityNeeded ? parseFloat(unitCost) * parseFloat(quantityNeeded) : null,
      quantityNeeded,
      notes: notes || null,
    });

    await syncJobAmount(req.params.jobId);
    const created = await JobItem.findByPk(jobItem.id, { include: jobItemIncludes });
    return success(res, created, 'Item added to job successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/jobs/:jobId/items/:id
 * Update a job item (quantityNeeded, quantityUsed, notes).
 */
const updateJobItem = async (req, res, next) => {
  try {
    const jobItem = await JobItem.findOne({
      where: { id: req.params.id, jobId: req.params.jobId },
    });
    if (!jobItem) return error(res, 'Job item not found.', 404);

    const { quantityNeeded, quantityUsed, unitCost, itemName, unit, notes } = req.body;

    const updatedUnitCost = unitCost !== undefined ? unitCost : jobItem.unitCost;
    const updatedQty = quantityNeeded !== undefined ? quantityNeeded : jobItem.quantityNeeded;
    const totalCost = updatedUnitCost && updatedQty ? parseFloat(updatedUnitCost) * parseFloat(updatedQty) : null;

    await jobItem.update({
      ...(itemName !== undefined && { itemName }),
      ...(unit !== undefined && { unit }),
      ...(quantityNeeded !== undefined && { quantityNeeded }),
      ...(quantityUsed !== undefined && { quantityUsed }),
      ...(unitCost !== undefined && { unitCost }),
      ...(notes !== undefined && { notes }),
      totalCost,
    });

    await syncJobAmount(req.params.jobId);
    const updated = await JobItem.findByPk(jobItem.id, { include: jobItemIncludes });
    return success(res, updated, 'Job item updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/jobs/:jobId/items/:id
 * Remove a stock item from a job.
 */
const removeJobItem = async (req, res, next) => {
  try {
    const jobItem = await JobItem.findOne({
      where: { id: req.params.id, jobId: req.params.jobId },
    });
    if (!jobItem) return error(res, 'Job item not found.', 404);

    const jobId = jobItem.jobId;
    await jobItem.destroy();
    await syncJobAmount(jobId);
    return success(res, null, 'Item removed from job successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getJobItems, addJobItem, updateJobItem, removeJobItem };
