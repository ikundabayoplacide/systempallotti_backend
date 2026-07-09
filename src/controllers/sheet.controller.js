const { Op } = require('sequelize');
const Sheet = require('../database/models/Sheet');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const getAllSheets = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = ['name', 'description'].map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }

    const { count, rows } = await Sheet.findAndCountAll({
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

const getSheetById = async (req, res, next) => {
  try {
    const sheet = await Sheet.findByPk(req.params.id);
    if (!sheet) return error(res, 'Sheet not found.', 404);
    return success(res, sheet);
  } catch (err) {
    next(err);
  }
};

const createSheet = async (req, res, next) => {
  try {
    const { name, description, qty, unitPrice, customerName, customerPhone } = req.body;
    const sheet = await Sheet.create({ name, description, qty, unitPrice, customerName: customerName ?? null, customerPhone: customerPhone ?? null });
    return success(res, sheet, 'Sheet created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateSheet = async (req, res, next) => {
  try {
    const sheet = await Sheet.findByPk(req.params.id);
    if (!sheet) return error(res, 'Sheet not found.', 404);

    const { name, description, qty, unitPrice, customerName, customerPhone } = req.body;
    await sheet.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(qty !== undefined && { qty }),
      ...(unitPrice !== undefined && { unitPrice }),
      ...(customerName !== undefined && { customerName }),
      ...(customerPhone !== undefined && { customerPhone }),
    });

    return success(res, sheet, 'Sheet updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteSheet = async (req, res, next) => {
  try {
    const sheet = await Sheet.findByPk(req.params.id);
    if (!sheet) return error(res, 'Sheet not found.', 404);
    await sheet.destroy();
    return success(res, null, 'Sheet deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllSheets, getSheetById, createSheet, updateSheet, deleteSheet };
