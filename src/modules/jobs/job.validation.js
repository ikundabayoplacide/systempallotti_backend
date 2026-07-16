const { body } = require('express-validator');

const JOB_STATUSES = [
  'pending',
  'confirmed',
  'rejected',
  'partial-delivered',
  'delivered',
  'completed',
];

const JOB_STATES = [
  'in-composition',
  'in-montage',
  'in-printing',
  'in-binding',
  'in-packaging',
  'quality-check',
  'composition-done',
  'montage-done',
  'printing-done',
  'binding-done',
  'packaging-done',
  'qualitycheck-done',
];

const createJobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('customerId').optional().isUUID().withMessage('Customer ID must be a valid UUID'),
  body('jobFor').optional().isIn(['hobe', 'general']).withMessage('jobFor must be one of: hobe, general'),
  body('owner.fullName').if(body('jobFor').equals('hobe')).notEmpty().withMessage('owner.fullName is required for hobe jobs'),
  body('owner.phone').if(body('jobFor').equals('hobe')).notEmpty().withMessage('owner.phone is required for hobe jobs'),
  body('owner.email').optional().isEmail().withMessage('owner.email must be a valid email'),
  body('description').optional().trim(),
  body('jobType').optional().trim(),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('size').optional().trim(),
  body('colorMode').optional().trim(),
  body('bindingType').optional().trim(),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('notes').optional().trim(),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('items.*.stockItemId').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('stockItemId must be a valid UUID'),
  body('items.*.itemName').optional({ nullable: true, checkFalsy: false }).isString().withMessage('itemName must be a string'),
  body('items.*').custom((item) => {
    const hasStockItem = item.stockItemId && typeof item.stockItemId === 'string' && item.stockItemId.trim() !== '';
    const hasItemName = item.itemName && typeof item.itemName === 'string' && item.itemName.trim() !== '';
    if (!hasStockItem && !hasItemName) {
      throw new Error('Each item must have either stockItemId or itemName');
    }
    return true;
  }),
];

const updateJobValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('jobType').optional().trim(),
  body('jobFor').optional().isIn(['hobe', 'general']).withMessage('jobFor must be one of: hobe, general'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('size').optional().trim(),
  body('colorMode').optional().trim(),
  body('bindingType').optional().trim(),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('notes').optional().trim(),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('departmentAssignedToId').optional().isUUID().withMessage('departmentAssignedToId must be a valid UUID'),
];

const updateJobStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(JOB_STATUSES)
    .withMessage(`Status must be one of: ${JOB_STATUSES.join(', ')}`),
];

const assignJobValidation = [
  body('departmentAssignedToId')
    .notEmpty()
    .withMessage('departmentAssignedToId is required')
    .isUUID()
    .withMessage('departmentAssignedToId must be a valid UUID'),
];

const rejectJobValidation = [
  body('rejectReason').optional().trim().isLength({ max: 1000 }).withMessage('Reject reason must not exceed 1000 characters'),
];

const updateJobStateValidation = [
  body('state')
    .notEmpty()
    .withMessage('state is required')
    .isIn(JOB_STATES)
    .withMessage(`state must be one of: ${JOB_STATES.join(', ')}`),
];

const deliverJobValidation = [
  body('quantityDelivered')
    .notEmpty().withMessage('quantityDelivered is required')
    .isInt({ min: 1 }).withMessage('quantityDelivered must be a positive integer'),
  body('deliveredByName').optional().trim(),
  body('deliveredByContact').optional().trim(),
];

module.exports = {
  createJobValidation,
  updateJobValidation,
  updateJobStatusValidation,
  assignJobValidation,
  rejectJobValidation,
  updateJobStateValidation,
  deliverJobValidation,
};
