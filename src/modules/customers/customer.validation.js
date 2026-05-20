const { body } = require('express-validator');

const createCustomerValidation = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address').optional().trim(),
  body('notes').optional().trim(),
  body('type').optional().isIn(['BUSINESS', 'VISITOR', 'BOUTIQUE']).withMessage('Type must be BUSINESS, VISITOR or BOUTIQUE'),
];

const updateCustomerValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address').optional().trim(),
  body('notes').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { createCustomerValidation, updateCustomerValidation };
