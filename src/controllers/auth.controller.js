const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../database/models/User');
const env = require('../config/env');
const { success, error } = require('../utils/apiResponse');
const { sendPasswordResetEmail } = require('../utils/mailer');

/**
 * POST /api/auth/register
 * Register a new user (Admin only)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already in use.', 409);

    const user = await User.create({ name, email, password, role: role || 'PRINTEMPLOYEE' });

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
      { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role, departmentId: user.departmentId ?? null },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return success(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId ?? null },
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
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return error(res, 'User not found.', 404);

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Use withPassword scope so the hash is available for comparison
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

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return error(res, 'Email not found in the system.', 404);

    const token = crypto.randomBytes(32).toString('hex');
    user.reset_token = token;
    user.reset_token_expires_at = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendPasswordResetEmail(user.email, user.name, token);

    return success(res, null, 'Reset link sent');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!user) return error(res, 'Invalid or expired reset token.', 400);

    user.password = password;
    user.reset_token = null;
    user.reset_token_expires_at = null;
    await user.save();

    return success(res, null, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword };
