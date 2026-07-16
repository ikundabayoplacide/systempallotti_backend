const { body } = require('express-validator');

const createPaymentValidation = [
  body('jobId')
    .notEmpty().withMessage('jobId is required')
    .isUUID().withMessage('jobId must be a valid UUID'),
  body('amountPaid')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('amountPaid must be at least 0'),
  body('paymentMethod')
    .notEmpty().withMessage('paymentMethod is required')
    .isIn(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'ONCREDIT'])
    .withMessage('paymentMethod must be one of: CASH, MOBILE_MONEY, BANK_TRANSFER, CARD, ONCREDIT'),
  body('paymentState')
    .notEmpty().withMessage('paymentState is required')
    .isIn(['FULL', 'PARTIAL', 'ONCREDIT'])
    .withMessage('paymentState must be FULL, PARTIAL, or ONCREDIT'),
  body('receivedById')
    .optional()
    .isUUID().withMessage('receivedById must be a valid UUID'),
  body('verifiedById')
    .optional()
    .isUUID().withMessage('verifiedById must be a valid UUID'),
  body('paymentNote').optional().trim(),
];

module.exports = { createPaymentValidation };
