const { body } = require('express-validator');

const itemValidation = [
  body('items').optional().isArray().withMessage('items must be an array'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.qty').isFloat({ min: 0.01 }).withMessage('Item qty must be a positive number'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Item unitPrice must be a positive number'),
];

const createProformaValidation = [
  body('jobNumber').optional().trim(),
  body('jobName').optional().trim(),
  body('clientName').optional().trim(),
  body('clientPhone').optional().trim(),
  body('jobCreatedAt').optional().isISO8601().withMessage('jobCreatedAt must be a valid date'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('taxRate must be between 0 and 100'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('discount must be a positive number'),
  body('validUntil').optional().isISO8601().withMessage('validUntil must be a valid date'),
  body('notes').optional().trim(),
  body('terms').optional().trim(),
  ...itemValidation,
];

const updateProformaValidation = [
  body('jobNumber').optional().trim(),
  body('jobName').optional().trim(),
  body('clientName').optional().trim(),
  body('clientPhone').optional().trim(),
  body('jobCreatedAt').optional().isISO8601().withMessage('jobCreatedAt must be a valid date'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('taxRate must be between 0 and 100'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('discount must be a positive number'),
  body('validUntil').optional().isISO8601().withMessage('validUntil must be a valid date'),
  body('notes').optional().trim(),
  body('terms').optional().trim(),
  ...itemValidation,
];

const updateProformaStatusValidation = [
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['draft', 'sent', 'accepted', 'rejected', 'expired'])
    .withMessage('status must be one of: draft, sent, accepted, rejected, expired'),
];

module.exports = { createProformaValidation, updateProformaValidation, updateProformaStatusValidation };
