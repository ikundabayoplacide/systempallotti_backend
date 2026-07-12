const express = require('express');
const router = express.Router();

const {
  getAllOvertimeRequests,
  getOvertimeRequestById,
  createOvertimeRequest,
  updateOvertimeRequest,
  deleteOvertimeRequest,
  approveOrReject,
} = require('../controllers/overtime.controller');

const { createOvertimeValidation, updateOvertimeValidation, approvalValidation } = require('../modules/overtime/overtime.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'WORKER'), getAllOvertimeRequests);
router.get('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'WORKER'), getOvertimeRequestById);
router.post('/', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'WORKER'), createOvertimeValidation, validate, createOvertimeRequest);
router.put('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'WORKER'), updateOvertimeValidation, validate, updateOvertimeRequest);
router.delete('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'WORKER'), deleteOvertimeRequest);
router.patch('/:id/approval', authorize('ADMIN', 'DAF'), approvalValidation, validate, approveOrReject);

module.exports = router;
