const { body } = require('express-validator');
const Role = require('../../database/models/Role');

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

const roleExistsValidator = body('role').optional().custom(async (value) => {
  if (!value) return;
  const role = await Role.findOne({ where: { name: value } });
  if (!role) throw new Error(`Role "${value}" does not exist.`);
});

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isLength({ min: 7, max: 20 }).withMessage('Phone must be between 7 and 20 characters'),
  body('departmentId').optional().isUUID().withMessage('departmentId must be a valid UUID'),
  body('gender').optional().isIn(GENDERS).withMessage('Gender must be MALE, FEMALE, or OTHER'),
  roleExistsValidator,
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isLength({ min: 7, max: 20 }).withMessage('Phone must be between 7 and 20 characters'),
  body('departmentId').optional().isUUID().withMessage('departmentId must be a valid UUID'),
  body('gender').optional().isIn(GENDERS).withMessage('Gender must be MALE, FEMALE, or OTHER'),
  roleExistsValidator,
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateMyProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isLength({ min: 7, max: 20 }).withMessage('Phone must be between 7 and 20 characters'),
  body('gender').optional().isIn(GENDERS).withMessage('Gender must be MALE, FEMALE, or OTHER'),
];

module.exports = { createUserValidation, updateUserValidation, updateMyProfileValidation };
