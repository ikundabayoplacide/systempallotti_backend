const { body } = require('express-validator');

const createOvertimeValidation = [
  body('employeeId').optional().isUUID().withMessage('Valid employee ID is required'),
  body('date').isISO8601().withMessage('date must be a valid date'),
  body('startTime').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('startTime must be in HH:MM format'),
  body('endTime').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('endTime must be in HH:MM format'),
  body('reason').optional().trim(),
];

const updateOvertimeValidation = [
  body('date').optional().isISO8601().withMessage('date must be a valid date'),
  body('startTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('startTime must be in HH:MM format'),
  body('endTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('endTime must be in HH:MM format'),
  body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty'),
];

const approvalValidation = [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
  body('approvalComment').optional().trim(),
];

module.exports = { createOvertimeValidation, updateOvertimeValidation, approvalValidation };
