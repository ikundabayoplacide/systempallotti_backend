const { body } = require('express-validator');

const createSheetValidation = [
  body('name').trim().notEmpty().withMessage('Sheet name is required'),
  body('qty').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('description').optional().trim(),
  body('customerName').optional().trim(),
  body('customerPhone').optional().trim(),
];

const updateSheetValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('qty').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('description').optional().trim(),
  body('customerName').optional().trim(),
  body('customerPhone').optional().trim(),
];

module.exports = { createSheetValidation, updateSheetValidation };
