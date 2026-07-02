const { Op } = require('sequelize');
const Machine = require('../database/models/Machine');
const User = require('../database/models/User');
const Department = require('../database/models/Department');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const machineIncludes = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'role'] },
  { model: Department, as: 'department', attributes: ['id', 'name'] },
];

/**
 * GET /api/machines
 */
const getAllMachines = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (req.query.departmentId) where.departmentId = req.query.departmentId;

    const { count, rows } = await Machine.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['name', 'ASC']],
      include: machineIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/machines/:id
 */
const getMachineById = async (req, res, next) => {
  try {
    const machine = await Machine.findByPk(req.params.id, { include: machineIncludes });
    if (!machine) return error(res, 'Machine not found.', 404);
    return success(res, machine);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/machines
 * Supervisor / Admin only
 */
const createMachine = async (req, res, next) => {
  try {
    const { name, description, note } = req.body;

    const existing = await Machine.findOne({ where: { name: { [Op.like]: name } } });
    if (existing) return error(res, 'A machine with this name already exists.', 409);

    const machine = await Machine.create({
      name: name.toUpperCase(),
      description: description || null,
      note: note || null,
      createdById: req.user.id,
      departmentId: req.body.departmentId || null,
    });

    const created = await Machine.findByPk(machine.id, { include: machineIncludes });
    return success(res, created, 'Machine created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/machines/:id
 * Supervisor / Admin only
 */
const updateMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByPk(req.params.id);
    if (!machine) return error(res, 'Machine not found.', 404);

    const { name, description, status, note, departmentId } = req.body;

    await machine.update({
      ...(name !== undefined && { name: name.toUpperCase() }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(note !== undefined && { note }),
      ...(departmentId !== undefined && { departmentId }),
    });

    const updated = await Machine.findByPk(machine.id, { include: machineIncludes });
    return success(res, updated, 'Machine updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/machines/:id
 * Admin only — soft delete by marking inactive
 */
const deleteMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByPk(req.params.id);
    if (!machine) return error(res, 'Machine not found.', 404);

    await machine.update({ status: 'inactive' });
    return success(res, null, 'Machine deactivated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMachines, getMachineById, createMachine, updateMachine, deleteMachine };
