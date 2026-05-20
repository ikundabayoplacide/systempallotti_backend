const { body } = require('express-validator');

const createPaymentValidation = [
  body('jobId')
    .notEmpty().withMessage('jobId is required')
    .isUUID().withMessage('jobId must be a valid UUID'),
  body('amountPaid')
    .notEmpty().withMessage('amountPaid is required')
    .isFloat({ min: 0.01 }).withMessage('amountPaid must be greater than 0'),
  body('paymentMethod')
    .notEmpty().withMessage('paymentMethod is required')
    .isIn(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'])
    .withMessage('paymentMethod must be one of: CASH, MOBILE_MONEY, BANK_TRANSFER, CARD'),
  body('paymentState')
    .notEmpty().withMessage('paymentState is required')
    .isIn(['FULL', 'PARTIAL'])
    .withMessage('paymentState must be FULL or PARTIAL'),
  body('receivedById')
    .notEmpty().withMessage('receivedById is required')
    .isUUID().withMessage('receivedById must be a valid UUID'),
  body('verifiedById')
    .optional()
    .isUUID().withMessage('verifiedById must be a valid UUID'),
  body('paymentNote').optional().trim(),
];

module.exports = { createPaymentValidation };
