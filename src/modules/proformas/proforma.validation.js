const { body } = require('express-validator');

const createProformaValidation = [
  body('jobId').notEmpty().withMessage('jobId is required').isUUID().withMessage('jobId must be a valid UUID'),
  body('subtotal').optional().isFloat({ min: 0 }).withMessage('subtotal must be a positive number'),
  body('validUntil').optional().isISO8601().withMessage('validUntil must be a valid ISO 8601 date'),
  body('notes').optional().trim(),
  body('terms').optional().trim(),
];

const updateProformaValidation = [
  body('subtotal').optional().isFloat({ min: 0 }).withMessage('subtotal must be a positive number'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('taxRate must be between 0 and 100'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('discount must be a positive number'),
  body('validUntil').optional().isISO8601().withMessage('validUntil must be a valid ISO 8601 date'),
  body('notes').optional().trim(),
  body('terms').optional().trim(),
];

const updateProformaStatusValidation = [
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['draft', 'sent', 'accepted', 'rejected', 'expired'])
    .withMessage('status must be one of: draft, sent, accepted, rejected, expired'),
];

module.exports = { createProformaValidation, updateProformaValidation, updateProformaStatusValidation };
