const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

/**
 * POST /api/users
 * Create a new user (Admin only) — similar to register but managed from user admin panel
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already in use.', 409);

    const user = await User.create({ name, email, password, role: role });

    return success(
      res,
      { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt },
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
    const { search, role } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = ['name', 'email'].map((field) => ({
        [field]: { [Op.iLike]: `%${search}%` },
      }));
    }
    if (role) where.role = role;

    const { count, rows } = await User.findAndCountAll({
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
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
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

    const { name, email, role, isActive } = req.body;

    await user.update({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    });

    return success(res, user, 'User updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id  (soft delete)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found.', 404);

    await user.update({ isActive: false });

    return success(res, null, 'User deactivated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
