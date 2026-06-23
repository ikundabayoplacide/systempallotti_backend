const { Op } = require('sequelize');
const CasualWorker = require('../database/models/CasualWorker');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

/**
 * Compute days worked from startDate to endDate (inclusive).
 * Falls back to the provided daysWorked value if given.
 */
const resolveDays = (startDate, endDate, daysWorked) => {
  if (daysWorked !== undefined && daysWorked !== null) return parseFloat(daysWorked);
  const ms = new Date(endDate) - new Date(startDate);
  return Math.max(1, Math.round(ms / 86400000) + 1);
};

/**
 * GET /api/casual-workers
 */
const getAllCasualWorkers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { jobDone: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await CasualWorker.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/casual-workers/:id
 */
const getCasualWorkerById = async (req, res, next) => {
  try {
    const worker = await CasualWorker.findByPk(req.params.id);
    if (!worker) return error(res, 'Casual worker not found.', 404);
    return success(res, worker);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/casual-workers
 */
const createCasualWorker = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, jobDone, startDate, endDate, daysWorked, dailyRate, notes } = req.body;

    const days = resolveDays(startDate, endDate, daysWorked);
    const rate = parseFloat(dailyRate);

    const worker = await CasualWorker.create({
      fullName,
      phoneNumber: phoneNumber || null,
      jobDone,
      startDate,
      endDate,
      daysWorked: days,
      dailyRate: rate,
      totalAmount: parseFloat((days * rate).toFixed(2)),
      notes: notes || null,
    });

    return success(res, worker, 'Casual worker recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/casual-workers/:id
 */
const updateCasualWorker = async (req, res, next) => {
  try {
    const worker = await CasualWorker.findByPk(req.params.id);
    if (!worker) return error(res, 'Casual worker not found.', 404);

    const { fullName, phoneNumber, jobDone, startDate, endDate, daysWorked, dailyRate, notes } = req.body;

    const resolvedStart = startDate !== undefined ? startDate : worker.startDate;
    const resolvedEnd = endDate !== undefined ? endDate : worker.endDate;
    const days = resolveDays(resolvedStart, resolvedEnd, daysWorked !== undefined ? daysWorked : undefined);
    const rate = dailyRate !== undefined ? parseFloat(dailyRate) : parseFloat(worker.dailyRate);

    await worker.update({
      ...(fullName !== undefined && { fullName }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(jobDone !== undefined && { jobDone }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(notes !== undefined && { notes }),
      daysWorked: days,
      dailyRate: rate,
      totalAmount: parseFloat((days * rate).toFixed(2)),
    });

    return success(res, worker, 'Casual worker updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/casual-workers/:id
 */
const deleteCasualWorker = async (req, res, next) => {
  try {
    const worker = await CasualWorker.findByPk(req.params.id);
    if (!worker) return error(res, 'Casual worker not found.', 404);

    await worker.destroy();
    return success(res, null, 'Casual worker deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCasualWorkers, getCasualWorkerById, createCasualWorker, updateCasualWorker, deleteCasualWorker };
