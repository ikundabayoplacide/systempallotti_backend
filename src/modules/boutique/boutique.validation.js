const { body } = require('express-validator');

const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('skuPrefix').trim().notEmpty().withMessage('SKU prefix is required')
    .isLength({ max: 10 }).withMessage('SKU prefix must be 10 characters or less'),
  body('colorClass').optional().trim(),
];

const updateCategoryValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('skuPrefix').optional().trim().isLength({ max: 10 }).withMessage('SKU prefix must be 10 characters or less'),
  body('colorClass').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('categoryId').notEmpty().withMessage('categoryId is required').isUUID().withMessage('categoryId must be a valid UUID'),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('description').optional().trim(),
  body('unit').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
];

const updateProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim(),
  body('unit').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateStockValidation = [
  body('change').notEmpty().withMessage('change is required')
    .isInt({ min: 1 }).withMessage('change must be a positive integer'),
  body('boutiqueStockItemId').optional().isUUID().withMessage('boutiqueStockItemId must be a valid UUID'),
  body('reason').optional().trim(),
];

const markAsSoldValidation = [
  // accept both `quantity` and `qty`
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('qty').optional().isInt({ min: 1 }).withMessage('qty must be a positive integer'),
  body('amountPaid').notEmpty().withMessage('amountPaid is required')
    .isFloat({ min: 0 }).withMessage('amountPaid must be a non-negative number'),
  body('unitPrice').optional().isFloat({ min: 0 }).withMessage('unitPrice must be a non-negative number'),
  body('paymentMethod').optional().isIn(['cash', 'mobile', 'card', 'bank', 'oncredit'])
    .withMessage('paymentMethod must be one of: cash, mobile, card, bank, oncredit'),
  body('customerName').optional().trim(),
  body('customerPhone').optional().trim(),
  // accept both `note` and `notes`
  body('note').optional().trim(),
  body('notes').optional().trim(),
];

const updateSaleValidation = [
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('amountPaid').optional().isFloat({ min: 0 }).withMessage('amountPaid must be a non-negative number'),
  body('paymentMethod').optional().isIn(['cash', 'mobile', 'card', 'bank', 'oncredit'])
    .withMessage('paymentMethod must be one of: cash, mobile, card, bank, oncredit'),
  body('note').optional().trim(),
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  createProductValidation,
  updateProductValidation,
  updateStockValidation,
  markAsSoldValidation,
  updateSaleValidation,
};
