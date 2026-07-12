const express = require('express');
const router = express.Router();

const {
  getAllExtraWorkers,
  getExtraWorkerById,
  createExtraWorker,
  updateExtraWorker,
  deleteExtraWorker,
  approveOrReject,
} = require('../controllers/extraWorker.controller');

const { createExtraWorkerValidation, updateExtraWorkerValidation, approvalValidation } = require('../modules/extraWorkers/extraWorker.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER'), getAllExtraWorkers);
router.get('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER'), getExtraWorkerById);
router.post('/', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER'), createExtraWorkerValidation, validate, createExtraWorker);
router.put('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER'), updateExtraWorkerValidation, validate, updateExtraWorker);
router.delete('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER'), deleteExtraWorker);
router.patch('/:id/approval', authorize('ADMIN', 'DAF'), approvalValidation, validate, approveOrReject);

module.exports = router;
