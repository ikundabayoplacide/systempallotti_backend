const { Op } = require('sequelize');
const Withdrawal = require('../database/models/Withdrawal');
const FundConfig = require('../database/models/FundConfig');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const { adjustBalance, recalculateBalance } = require('../utils/fundBalance');
const notify = require('../utils/notification.service');

const userAttrs = ['id', 'name', 'email', 'role'];
const withdrawalIncludes = [{ model: User, as: 'recordedBy', attributes: userAttrs }];

const getConfig = async (req, res, next) => {
  try {
    const config = await FundConfig.findOne({ where: { id: 1 } });
    return success(res, {
      initialAmount: config ? parseFloat(config.initialAmount) : 0,
      totalBalance: config ? parseFloat(config.totalBalance) : 0,
    }, 'Fund config retrieved.');
  } catch (err) {
    next(err);
  }
};

const setConfig = async (req, res, next) => {
  try {
    const { initialAmount } = req.body;
    if (initialAmount === undefined || isNaN(parseFloat(initialAmount)) || parseFloat(initialAmount) < 0) {
      return error(res, 'initialAmount must be a non-negative number.', 400);
    }
    await FundConfig.upsert({ id: 1, initialAmount: parseFloat(initialAmount), updatedById: req.user.id });
    const { totalBalance } = await recalculateBalance();
    return success(res, { initialAmount: parseFloat(initialAmount), totalBalance }, 'Initial amount updated.');
  } catch (err) {
    next(err);
  }
};

const getBalance = async (req, res, next) => {
  try {
    const { sequelize } = require('../config/database');
    const config = await FundConfig.findOne({ where: { id: 1 } });

    const [[paymentSum]] = await sequelize.query(`SELECT COALESCE(SUM(amountPaid), 0) AS total FROM payments`);
    const [[withdrawalSum]] = await sequelize.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM withdrawals`);
    const [[expenseSum]] = await sequelize.query(`SELECT COALESCE(SUM(totalAmount), 0) AS total FROM outstands WHERE status = 'paid'`);

    return success(res, {
      initialAmount: config ? parseFloat(config.initialAmount) : 0,
      totalPaymentsIn: parseFloat(paymentSum.total),
      totalWithdrawalsIn: parseFloat(withdrawalSum.total),
      totalExpensesOut: parseFloat(expenseSum.total),
      totalBalance: config ? parseFloat(config.totalBalance) : 0,
    }, 'Balance retrieved.');
  } catch (err) {
    next(err);
  }
};

const getAllWithdrawals = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { from, to, search } = req.query;

    const where = {};
    if (from || to) {
      where.withdrawnAt = {};
      if (from) where.withdrawnAt[Op.gte] = from;
      if (to) where.withdrawnAt[Op.lte] = to;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { takenByName: { [Op.like]: `%${search}%` } },
        { ref: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Withdrawal.findAndCountAll({
      where, offset: skip, limit,
      order: [['withdrawnAt', 'DESC']],
      include: withdrawalIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getWithdrawalById = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id, { include: withdrawalIncludes });
    if (!withdrawal) return error(res, 'Withdrawal not found.', 404);
    return success(res, withdrawal);
  } catch (err) {
    next(err);
  }
};

const createWithdrawal = async (req, res, next) => {
  try {
    const { title, description, amount, withdrawnAt, takenByName, takenByContact, source, notes } = req.body;
    const ref = await Withdrawal.generateRef();

    const withdrawal = await Withdrawal.create({
      ref, title,
      description: description || null,
      amount: parseFloat(amount),
      withdrawnAt, takenByName,
      takenByContact: takenByContact || null,
      source: source || null,
      notes: notes || null,
      recordedById: req.user.id,
    });

    // Withdrawal brings money IN → add to balance
    const newBalance = await adjustBalance('add', parseFloat(amount));

    await notify({
      createdById: req.user.id,
      title: 'New Withdrawal Recorded',
      message: `Withdrawal "${title}" (${ref}) of ${parseFloat(amount)} recorded. New balance: ${newBalance}.`,
      type: 'OUTSTAND_CREATED',
      relatedEntityType: 'withdrawal',
      relatedEntityId: withdrawal.id,
      targetRoles: ['ADMIN', 'DAF', 'ACCOUNTANT'],
    });

    const created = await Withdrawal.findByPk(withdrawal.id, { include: withdrawalIncludes });
    return success(res, { withdrawal: created, totalBalance: newBalance }, 'Withdrawal recorded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id);
    if (!withdrawal) return error(res, 'Withdrawal not found.', 404);

    const oldAmount = parseFloat(withdrawal.amount);
    const { title, description, amount, withdrawnAt, takenByName, takenByContact, source, notes } = req.body;
    const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;

    await withdrawal.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(amount !== undefined && { amount: newAmount }),
      ...(withdrawnAt !== undefined && { withdrawnAt }),
      ...(takenByName !== undefined && { takenByName }),
      ...(takenByContact !== undefined && { takenByContact }),
      ...(source !== undefined && { source }),
      ...(notes !== undefined && { notes }),
    });

    // Adjust balance by the difference
    const diff = newAmount - oldAmount;
    if (diff !== 0) await adjustBalance(diff > 0 ? 'add' : 'deduct', Math.abs(diff));

    const config = await FundConfig.findOne({ where: { id: 1 } });
    const updated = await Withdrawal.findByPk(withdrawal.id, { include: withdrawalIncludes });
    return success(res, { withdrawal: updated, totalBalance: parseFloat(config.totalBalance) }, 'Withdrawal updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id);
    if (!withdrawal) return error(res, 'Withdrawal not found.', 404);

    const amount = parseFloat(withdrawal.amount);
    await withdrawal.destroy();

    // Removing a withdrawal → deduct from balance
    const newBalance = await adjustBalance('deduct', amount);
    return success(res, { totalBalance: newBalance }, 'Withdrawal deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getConfig, setConfig, getBalance, getAllWithdrawals, getWithdrawalById, createWithdrawal, updateWithdrawal, deleteWithdrawal };
