const { body } = require('express-validator');

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER'])
    .withMessage('Role must be ADMIN, SUPERVISOR, STAFF, or CUSTOMER'),
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER'])
    .withMessage('Role must be ADMIN, SUPERVISOR, STAFF, or CUSTOMER'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { createUserValidation, updateUserValidation };
