const { body } = require('express-validator');

const createCasualWorkerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phoneNumber').optional().trim(),
  body('jobDone').trim().notEmpty().withMessage('Job done is required'),
  body('startDate').isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').isISO8601().withMessage('endDate must be a valid date'),
  body('daysWorked').optional().isFloat({ min: 0.01 }).withMessage('Days worked must be a positive number'),
  body('dailyRate').isFloat({ min: 0 }).withMessage('Daily rate must be a non-negative number'),
  body('notes').optional().trim(),
];

const updateCasualWorkerValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phoneNumber').optional().trim(),
  body('jobDone').optional().trim().notEmpty().withMessage('Job done cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  body('daysWorked').optional().isFloat({ min: 0.01 }).withMessage('Days worked must be a positive number'),
  body('dailyRate').optional().isFloat({ min: 0 }).withMessage('Daily rate must be a non-negative number'),
  body('notes').optional().trim(),
];

module.exports = { createCasualWorkerValidation, updateCasualWorkerValidation };
