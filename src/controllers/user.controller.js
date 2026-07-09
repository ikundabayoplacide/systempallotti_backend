const { Op } = require('sequelize');
const User = require('../database/models/User');
const Employee = require('../database/models/Employee');
const Department = require('../database/models/Department');
const Job = require('../database/models/Job');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

/**
 * POST /api/users
 * Create a new user (Admin only) — similar to register but managed from user admin panel
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, departmentId, gender } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already in use.', 409);

    const user = await User.create({ name, email, password, role, phone, departmentId, gender });

    if (role === 'WORKER') {
      await Employee.create({
        fullName: name,
        phoneNumber: phone || 'N/A',
        gender: gender || 'MALE',
        dateOfBirth: '2000-01-01',
        address: 'N/A',
        email: email || null,
        departmentId: departmentId || null,
        userId: user.id,
      });
    }

    return success(
      res,
      { id: user.id, name: user.name, email: user.email, phone: user.phone, gender: user.gender, role: user.role, departmentId: user.departmentId, isActive: user.isActive, createdAt: user.createdAt },
      'User created successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, role, departmentId, isActive } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = ['name', 'email'].map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }
    if (role) where.role = role;
    if (departmentId) where.departmentId = departmentId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'], required: false },
        { model: Job, as: 'currentJob', attributes: ['id', 'jobNumber', 'title', 'state', 'status', 'priority'], required: false },
      ],
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
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'], required: false },
        { model: Job, as: 'currentJob', attributes: ['id', 'jobNumber', 'title', 'state', 'status', 'priority'], required: false },
      ],
    });
    if (!user) return error(res, 'User not found.', 404);

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found.', 404);

    const { name, email, role, isActive, phone, departmentId, gender, password } = req.body;

    const updateData = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(phone !== undefined && { phone }),
      ...(departmentId !== undefined && { departmentId }),
      ...(gender !== undefined && { gender }),
    };

    if (password) updateData.password = password;

    await user.update(updateData);

    if (departmentId !== undefined) {
      await Employee.update({ departmentId }, { where: { userId: user.id } });
    }

    return success(res, user, 'User updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found.', 404);

    await user.destroy();

    return success(res, null, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/me
 */
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'gender', 'role', 'departmentId', 'isActive', 'createdAt'],
    });
    if (!user) return error(res, 'User not found.', 404);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/me
 * Only name, phone, gender are updatable by the user themselves.
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return error(res, 'User not found.', 404);

    const { name, phone, gender } = req.body;

    await user.update({
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(gender !== undefined && { gender }),
    });

    return success(
      res,
      { id: user.id, name: user.name, email: user.email, phone: user.phone, gender: user.gender, role: user.role, departmentId: user.departmentId, isActive: user.isActive, createdAt: user.createdAt },
      'Profile updated successfully.'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, getMyProfile, updateMyProfile };
