const { Op, fn, col, literal } = require('sequelize');
const BoutiqueStockItem = require('../database/models/BoutiqueStockItem');
const BoutiqueStockSortie = require('../database/models/BoutiqueStockSortie');

const BoutiqueProduct = require('../database/models/BoutiqueProduct');
const BoutiqueCategory = require('../database/models/BoutiqueCategory');
const BoutiqueStockMovement = require('../database/models/BoutiqueStockMovement');
const BoutiqueSale = require('../database/models/BoutiqueSale');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const productIncludes = [
  { model: BoutiqueCategory, as: 'category', attributes: ['id', 'name', 'skuPrefix', 'colorClass'] },
];

const calcPayment = (totalPrice, amountPaid) => {
  const diff = parseFloat(amountPaid) - parseFloat(totalPrice);
  return {
    totalPrice: parseFloat(totalPrice),
    balanceDue: diff < 0 ? Math.abs(diff) : 0,
    changeGiven: diff > 0 ? diff : 0,
    paymentStatus: diff < 0 ? 'partial' : diff > 0 ? 'overpaid' : 'paid',
  };
};

// ── Categories ────────────────────────────────────────────────────────────────

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await BoutiqueCategory.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
    return success(res, categories);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, skuPrefix, colorClass } = req.body;
    const existing = await BoutiqueCategory.findOne({ where: { name } });
    if (existing) return error(res, 'Category with this name already exists.', 409);

    const category = await BoutiqueCategory.create({ name, skuPrefix: skuPrefix.toUpperCase(), colorClass });
    return success(res, category, 'Category created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await BoutiqueCategory.findByPk(req.params.id);
    if (!category) return error(res, 'Category not found.', 404);

    const { name, skuPrefix, colorClass, isActive } = req.body;
    await category.update({
      ...(name !== undefined && { name }),
      ...(skuPrefix !== undefined && { skuPrefix: skuPrefix.toUpperCase() }),
      ...(colorClass !== undefined && { colorClass }),
      ...(isActive !== undefined && { isActive }),
    });
    return success(res, category, 'Category updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await BoutiqueCategory.findByPk(req.params.id);
    if (!category) return error(res, 'Category not found.', 404);
    await category.update({ isActive: false });
    return success(res, null, 'Category deleted successfully.');
  } catch (err) {
    next(err);
  }
};

// ── Products ──────────────────────────────────────────────────────────────────

const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { categoryId, status, search } = req.query;

    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await BoutiqueProduct.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['name', 'ASC']],
      include: productIncludes,
    });

    // Attach computed status
    const data = rows.map((p) => ({
      ...p.toJSON(),
      status: p.status,
    }));

    // Filter by computed status if requested
    const filtered = status ? data.filter((p) => p.status === status) : data;

    return paginated(res, filtered, status ? filtered.length : count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await BoutiqueProduct.findByPk(req.params.id, { include: productIncludes });
    if (!product) return error(res, 'Product not found.', 404);
    return success(res, { ...product.toJSON(), status: product.status });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, categoryId, unit, price, stock, minStock } = req.body;

    const category = await BoutiqueCategory.findByPk(categoryId);
    if (!category) return error(res, 'Category not found.', 404);

    const sku = await BoutiqueProduct.generateSku(category.skuPrefix);

    const product = await BoutiqueProduct.create({
      sku, name, description, categoryId, unit, price,
      stock: stock || 0,
      minStock: minStock || 5,
    });

    // Record initial stock movement if stock > 0
    if (stock && stock > 0) {
      await BoutiqueStockMovement.create({
        productId: product.id,
        changedById: req.user.id,
        change: stock,
        reason: 'Initial stock',
        stockBefore: 0,
        stockAfter: stock,
      });
    }

    await notify({
      createdById: req.user.id,
      title: 'New Boutique Product Added',
      message: `A new product "${name}" (SKU: ${sku}) has been added to the boutique.`,
      type: 'BOUTIQUE_PRODUCT_ADDED',
      relatedEntityType: 'boutiqueProduct',
      relatedEntityId: product.id,
      targetRoles: ['ADMIN', 'SALESMANAGER'],
    });

    const created = await BoutiqueProduct.findByPk(product.id, { include: productIncludes });
    return success(res, { ...created.toJSON(), status: created.status }, 'Product created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await BoutiqueProduct.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    const { name, description, unit, price, minStock, isActive } = req.body;

    await product.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(unit !== undefined && { unit }),
      ...(price !== undefined && { price }),
      ...(minStock !== undefined && { minStock }),
      ...(isActive !== undefined && { isActive }),
    });

    const updated = await BoutiqueProduct.findByPk(product.id, { include: productIncludes });
    return success(res, { ...updated.toJSON(), status: updated.status }, 'Product updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await BoutiqueProduct.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);
    await product.update({ isActive: false });
    return success(res, null, 'Product deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const markAsSold = async (req, res, next) => {
  try {
    const product = await BoutiqueProduct.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    const { quantity = 1, amountPaid, customerId, note, paymentMethod = 'cash' } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1)
      return error(res, 'quantity must be a positive integer.', 422);
    if (amountPaid === undefined || amountPaid === null)
      return error(res, 'amountPaid is required.', 422);
    if (amountPaid < 0)
      return error(res, 'amountPaid cannot be negative.', 422);

    const stockBefore = product.stock;
    if (stockBefore < quantity)
      return error(res, `Insufficient stock. Available: ${stockBefore}, requested: ${quantity}.`, 422);

    const stockAfter = stockBefore - quantity;
    const saleStatus = stockAfter === 0 ? 'sold' : 'pending';

    await product.update({ stock: stockAfter, saleStatus });

    await BoutiqueStockMovement.create({
      productId: product.id,
      changedById: req.user.id,
      change: -quantity,
      reason: 'sale',
      stockBefore,
      stockAfter,
    });

    await BoutiqueSale.create({
      productId: product.id,
      soldById: req.user.id,
      customerId: customerId || null,
      quantity,
      unitPrice: product.price,
      amountPaid,
      ...calcPayment(quantity * parseFloat(product.price), amountPaid),
      paymentMethod,
      note: note || null,
    });

    const updated = await BoutiqueProduct.findByPk(product.id, { include: productIncludes });
    return success(res, { ...updated.toJSON(), status: updated.status }, 'Sale recorded successfully.');
  } catch (err) {
    next(err);
  }
};

const getSalesAudit = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { productId, soldById, customerId, from, to, paymentStatus } = req.query;

    const where = {};
    if (productId) where.productId = productId;
    if (soldById) where.soldById = soldById;
    if (customerId) where.customerId = customerId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const { count, rows } = await BoutiqueSale.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: BoutiqueProduct, as: 'product', attributes: ['id', 'sku', 'name', 'unit'], include: productIncludes },
        { model: User, as: 'soldBy', attributes: ['id', 'name', 'email', 'role'] },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'], required: false },
      ],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getSalesSummary = async (req, res, next) => {
  try {
    const { from, to, productId } = req.query;

    const where = {};
    if (productId) where.productId = productId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const [totals] = await BoutiqueSale.findAll({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalTransactions'],
        [fn('SUM', col('quantity')), 'totalQuantitySold'],
        [fn('SUM', col('amountPaid')), 'totalAmountPaid'],
        [fn('SUM', literal('quantity * "unitPrice"')), 'totalExpectedRevenue'],
      ],
      raw: true,
    });

    const byProduct = await BoutiqueSale.findAll({
      where,
      attributes: [
        'productId',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('amountPaid')), 'totalAmountPaid'],
        [fn('SUM', literal('quantity * "unitPrice"')), 'totalExpectedRevenue'],
        [fn('COUNT', col('BoutiqueSale.id')), 'transactions'],
      ],
      include: [{ model: BoutiqueProduct, as: 'product', attributes: ['sku', 'name', 'unit'] }],
      group: ['productId', 'product.id', 'product.sku', 'product.name', 'product.unit'],
      order: [[fn('SUM', col('amountPaid')), 'DESC']],
      raw: false,
    });

    const byPaymentMethod = await BoutiqueSale.findAll({
      where,
      attributes: [
        'paymentMethod',
        [fn('COUNT', col('id')), 'transactions'],
        [fn('SUM', col('amountPaid')), 'totalAmountPaid'],
      ],
      group: ['paymentMethod'],
      order: [[fn('SUM', col('amountPaid')), 'DESC']],
      raw: true,
    });

    return success(res, { totals, byProduct, byPaymentMethod });
  } catch (err) {
    next(err);
  }
};


const updateSale = async (req, res, next) => {
  try {
    const sale = await BoutiqueSale.findByPk(req.params.id);
    if (!sale) return error(res, 'Sale not found.', 404);

    const { amountPaid, paymentMethod, note } = req.body;

    const paymentFields = amountPaid !== undefined
      ? calcPayment(sale.totalPrice, amountPaid)
      : {};

    await sale.update({
      ...(amountPaid !== undefined && { amountPaid }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(note !== undefined && { note }),
      ...paymentFields,
    });

    return success(res, sale, 'Sale updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteSale = async (req, res, next) => {
  try {
    const sale = await BoutiqueSale.findByPk(req.params.id);
    if (!sale) return error(res, 'Sale not found.', 404);

    const product = await BoutiqueProduct.findByPk(sale.productId);
    if (!product) return error(res, 'Associated product not found.', 404);

    const stockBefore = product.stock;
    const stockAfter = stockBefore + sale.quantity;
    const saleStatus = 'pending';

    await product.update({ stock: stockAfter, saleStatus });

    await BoutiqueStockMovement.create({
      productId: product.id,
      changedById: req.user.id,
      change: sale.quantity,
      reason: 'sale cancelled',
      stockBefore,
      stockAfter,
    });

    await sale.destroy();

    return success(res, null, 'Sale deleted and stock restored successfully.');
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const product = await BoutiqueProduct.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    const { change, reason, boutiqueStockItemId } = req.body;

    const stockBefore = product.stock;
    const stockAfter = stockBefore + change;

    if (boutiqueStockItemId) {
      const stockItem = await BoutiqueStockItem.findByPk(boutiqueStockItemId);
      if (!stockItem) return error(res, 'Boutique stock item not found.', 404);

      const rawStock = parseFloat(stockItem.currentStock);
      if (change > rawStock) return error(res, `Insufficient stock item quantity. Available: ${rawStock}, requested: ${change}.`, 422);

      const rawStockAfter = rawStock - change;
      await stockItem.update({ currentStock: rawStockAfter });

      await BoutiqueStockSortie.create({
        stockItemId: boutiqueStockItemId,
        requesterId: req.user.id,
        approvedById: req.user.id,
        quantityOut: change,
        reason: reason || `Transferred to product: ${product.name}`,
        status: 'approved',
        sortieDate: new Date(),
        stockBefore: rawStock,
        stockAfter: rawStockAfter,
      });
    }

    await product.update({ stock: stockAfter });

    await BoutiqueStockMovement.create({
      productId: product.id,
      changedById: req.user.id,
      change,
      reason: reason || 'restock',
      stockBefore,
      stockAfter,
    });

    const updated = await BoutiqueProduct.findByPk(product.id, { include: productIncludes });
    return success(res, { ...updated.toJSON(), status: updated.status }, 'Stock updated successfully.');
  } catch (err) { next(err); }
};

const getStockMovements = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const product = await BoutiqueProduct.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    const { count, rows } = await BoutiqueStockMovement.findAndCountAll({
      where: { productId: req.params.id },
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'changedBy', attributes: ['id', 'name', 'email', 'role'] }],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories, createCategory, updateCategory, deleteCategory,
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  markAsSold, updateStock, getStockMovements,
  getSalesAudit, getSalesSummary, updateSale, deleteSale,
};
