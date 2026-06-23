const { body } = require('express-validator');

const createPayrollValidation = [
  body('workerType').isIn(['employee', 'casual']).withMessage('workerType must be employee or casual'),
  body('employeeId').if(body('workerType').equals('employee')).notEmpty().withMessage('employeeId is required for employee payroll'),
  body('casualWorkerId').if(body('workerType').equals('casual')).notEmpty().withMessage('casualWorkerId is required for casual payroll'),
  body('period').trim().notEmpty().withMessage('Period is required (e.g. 2025-06)'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a non-negative number'),
  body('overtime').optional().isFloat({ min: 0 }).withMessage('Overtime must be a non-negative number'),
  body('deductions').optional().isFloat({ min: 0 }).withMessage('Deductions must be a non-negative number'),
  body('notes').optional().trim(),
];

const updatePayrollValidation = [
  body('period').optional().trim().notEmpty().withMessage('Period cannot be empty'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a non-negative number'),
  body('overtime').optional().isFloat({ min: 0 }).withMessage('Overtime must be a non-negative number'),
  body('deductions').optional().isFloat({ min: 0 }).withMessage('Deductions must be a non-negative number'),
  body('notes').optional().trim(),
];

module.exports = { createPayrollValidation, updatePayrollValidation };
