const { body } = require('express-validator');

const createHobeValidation = [
  body('nameOfHobe').trim().notEmpty().withMessage('Name of hobe is required'),
  body('doneAt').notEmpty().withMessage('doneAt is required').isISO8601().withMessage('doneAt must be a valid date'),
  body('expiredAt').optional().isISO8601().withMessage('expiredAt must be a valid date'),
  body('qty').notEmpty().withMessage('qty is required').isInt({ min: 1 }).withMessage('qty must be a positive integer'),
  body('pricePerItem').notEmpty().withMessage('pricePerItem is required').isFloat({ min: 0 }).withMessage('pricePerItem cannot be negative'),
  body('ob').optional().isFloat({ min: 0 }).withMessage('ob must be a non-negative number'),
  body('note').optional().trim(),
];

const updateHobeValidation = [
  body('nameOfHobe').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('doneAt').optional().isISO8601().withMessage('doneAt must be a valid date'),
  body('expiredAt').optional().isISO8601().withMessage('expiredAt must be a valid date'),
  body('pricePerItem').optional().isFloat({ min: 0 }).withMessage('pricePerItem cannot be negative'),
  body('ob').optional().isFloat({ min: 0 }).withMessage('ob must be a non-negative number'),
  body('note').optional().trim(),
  body('status').optional().isIn(['active', 'closed', 'expired']).withMessage('status must be: active, closed, or expired'),
];

const sellFromHobeValidation = [
  body('quantity').notEmpty().withMessage('quantity is required').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('amountPaid').notEmpty().withMessage('amountPaid is required').isFloat({ min: 0 }).withMessage('amountPaid cannot be negative'),
  body('paymentMethod').optional().isIn(['cash', 'mobile', 'card', 'bank']).withMessage('paymentMethod must be: cash, mobile, card, or bank'),
  body('customerId').optional().isUUID().withMessage('customerId must be a valid UUID'),
  body('note').optional().trim(),
];

const updateSaleValidation = [
  body('amountPaid').optional().isFloat({ min: 0 }).withMessage('amountPaid must be a non-negative number'),
  body('paymentMethod').optional().isIn(['cash', 'mobile', 'card', 'bank']).withMessage('paymentMethod must be: cash, mobile, card, or bank'),
  body('note').optional().trim(),
];

const addQtyToHobeValidation = [
  body('qty').notEmpty().withMessage('qty is required').isInt({ min: 1 }).withMessage('qty must be a positive integer'),
  body('note').optional().trim(),
];

module.exports = { createHobeValidation, updateHobeValidation, sellFromHobeValidation, updateSaleValidation, addQtyToHobeValidation };
