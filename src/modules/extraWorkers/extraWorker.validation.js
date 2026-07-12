const { body } = require('express-validator');

const createExtraWorkerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('gender').isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
  body('date').isISO8601().withMessage('date must be a valid date'),
  body('startTime').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('startTime must be in HH:MM format'),
  body('endTime').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('endTime must be in HH:MM format'),
  body('task').trim().notEmpty().withMessage('Task is required'),
  body('description').optional().trim(),
];

const updateExtraWorkerValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('gender').optional().isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
  body('date').optional().isISO8601().withMessage('date must be a valid date'),
  body('startTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('startTime must be in HH:MM format'),
  body('endTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('endTime must be in HH:MM format'),
  body('task').optional().trim().notEmpty().withMessage('Task cannot be empty'),
  body('description').optional().trim(),
];

module.exports = { createExtraWorkerValidation, updateExtraWorkerValidation };
