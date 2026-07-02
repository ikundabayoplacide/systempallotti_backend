const { Op } = require('sequelize');
const Department = require('../database/models/Department');
const Employee = require('../database/models/Employee');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

/**
 * GET /api/departments
 * List departments. By default only active ones; pass ?all=true to include inactive.
 * Supports ?search= on name/description and pagination.
 */
const getAllDepartments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, all } = req.query;

    const where = {};

    if (all !== 'true') {
      where.isActive = true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Department.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['name', 'ASC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employees', attributes: ['id', 'fullName', 'phoneNumber', 'contractType', 'isActive'] },
        { model: User, as: 'users', attributes: ['id', 'name', 'email', 'phone', 'role', 'isActive'] },
      ],
    });
    if (!department) return error(res, 'Department not found.', 404);

    return success(res, department);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/departments
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await Department.findOne({ where: { name } });
    if (existing) return error(res, 'A department with this name already exists.', 409);

    const department = await Department.create({ name, description });

    return success(res, department, 'Department created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return error(res, 'Department not found.', 404);

    const { name, description, isActive } = req.body;

    await department.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    });

    return success(res, department, 'Department updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/departments/:id  (soft delete)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return error(res, 'Department not found.', 404);

    await department.update({ isActive: false });

    return success(res, null, 'Department deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
