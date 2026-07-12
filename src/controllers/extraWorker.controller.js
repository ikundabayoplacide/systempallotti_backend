const { Op } = require('sequelize');
const ExtraWorker = require('../database/models/ExtraWorker');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const include = [
  { model: User, as: 'doneByUser', attributes: ['id', 'name'] },
  { model: User, as: 'approvedByUser', attributes: ['id', 'name'] },
];

const getAllExtraWorkers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, date } = req.query;

    const where = {};
    if (date) where.date = date;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { task: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await ExtraWorker.findAndCountAll({
      where,
      include,
      offset: skip,
      limit,
      order: [['date', 'DESC'], ['startTime', 'ASC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getExtraWorkerById = async (req, res, next) => {
  try {
    const worker = await ExtraWorker.findByPk(req.params.id, { include });
    if (!worker) return error(res, 'Extra worker record not found.', 404);
    return success(res, worker);
  } catch (err) {
    next(err);
  }
};

const createExtraWorker = async (req, res, next) => {
  try {
    const { fullName, gender, date, startTime, endTime, task, description } = req.body;

    const worker = await ExtraWorker.create({
      fullName,
      gender,
      date,
      startTime,
      endTime,
      task,
      description: description || null,
      doneBy: req.user.id,
    });

    return success(res, worker, 'Extra worker recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateExtraWorker = async (req, res, next) => {
  try {
    const worker = await ExtraWorker.findByPk(req.params.id);
    if (!worker) return error(res, 'Extra worker record not found.', 404);

    const { fullName, gender, date, startTime, endTime, task, description } = req.body;

    await worker.update({
      ...(fullName !== undefined && { fullName }),
      ...(gender !== undefined && { gender }),
      ...(date !== undefined && { date }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(task !== undefined && { task }),
      ...(description !== undefined && { description }),
    });

    return success(res, worker, 'Extra worker updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteExtraWorker = async (req, res, next) => {
  try {
    const worker = await ExtraWorker.findByPk(req.params.id);
    if (!worker) return error(res, 'Extra worker record not found.', 404);

    await worker.destroy();
    return success(res, null, 'Extra worker deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const approveOrReject = async (req, res, next) => {
  try {
    const worker = await ExtraWorker.findByPk(req.params.id);
    if (!worker) return error(res, 'Extra worker record not found.', 404);

    const { status, approvalComment } = req.body;

    await worker.update({
      status,
      approvalComment: approvalComment || null,
      approvedBy: req.user.id,
    });

    return success(res, worker, `Extra worker record ${status.toLowerCase()} successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllExtraWorkers, getExtraWorkerById, createExtraWorker, updateExtraWorker, deleteExtraWorker, approveOrReject };
