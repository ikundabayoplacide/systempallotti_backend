const { Op } = require('sequelize');
const Product = require('../database/models/Product');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

/**
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, category } = req.query;

    const where = { isActive: true };
    if (search) {
      where[Op.or] = ['name', 'description'].map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }
    if (category) where.category = category;

    const { count, rows } = await Product.findAndCountAll({
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
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    return success(res, product);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, basePrice, unit } = req.body;

    const product = await Product.create({ name, description, category, basePrice, unit });

    return success(res, product, 'Product created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    const { name, description, category, basePrice, unit, isActive } = req.body;

    await product.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(basePrice !== undefined && { basePrice }),
      ...(unit !== undefined && { unit }),
      ...(isActive !== undefined && { isActive }),
    });

    return success(res, product, 'Product updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/products/:id  (soft delete)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    await product.update({ isActive: false });

    return success(res, null, 'Product deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
