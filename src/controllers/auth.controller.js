const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../database/models/User');
const env = require('../config/env');
const { success, error } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Register a new user (Admin only)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already in use.', 409);

    const user = await User.create({ name, email, password, role: role || 'STAFF' });

    return success(
      res,
      { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      'User registered successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) return error(res, 'Invalid credentials.', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, 'Invalid credentials.', 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return success(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return error(res, 'User not found.', 404);

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return error(res, 'User not found.', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return error(res, 'Current password is incorrect.', 400);

    user.password = newPassword;
    await user.save();

    return success(res, null, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, changePassword };
