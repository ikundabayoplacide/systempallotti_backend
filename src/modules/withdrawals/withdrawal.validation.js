const { body } = require('express-validator');

const createWithdrawalValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('withdrawnAt').isDate().withMessage('withdrawnAt must be a valid date (YYYY-MM-DD).'),
  body('takenByName').trim().notEmpty().withMessage('takenByName is required.'),
  body('takenByContact').optional().isString(),
  body('source').optional().isString(),
  body('description').optional().isString(),
  body('notes').optional().isString(),
];

const updateWithdrawalValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('withdrawnAt').optional().isDate().withMessage('withdrawnAt must be a valid date (YYYY-MM-DD).'),
  body('takenByName').optional().trim().notEmpty().withMessage('takenByName cannot be empty.'),
];

module.exports = { createWithdrawalValidation, updateWithdrawalValidation };
