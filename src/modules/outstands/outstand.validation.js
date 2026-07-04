const { body } = require('express-validator');

const CATEGORIES = ['purchase', 'utility', 'maintenance', 'supplier', 'other'];

const createOutstandValidation = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('recipientName').trim().notEmpty().withMessage('Recipient name is required'),
  body('recipientPhone').optional().trim(),
  body('recipientRole').optional().trim(),
  body('purpose').trim().notEmpty().withMessage('Purpose is required'),
  body('notes').optional().trim(),
];

const rejectOutstandValidation = [
  body('rejectionNote').trim().notEmpty().withMessage('Rejection note is required'),
];

const updateOutstandValidation = [
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('recipientName').optional().trim().notEmpty().withMessage('Recipient name cannot be empty'),
  body('recipientPhone').optional().trim(),
  body('recipientRole').optional().trim(),
  body('purpose').optional().trim().notEmpty().withMessage('Purpose cannot be empty'),
  body('notes').optional().trim(),
];

module.exports = { createOutstandValidation, rejectOutstandValidation, updateOutstandValidation };
