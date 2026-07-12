const express = require('express');
const router = express.Router();

const {
  getAllExtraWorkers,
  getExtraWorkerById,
  createExtraWorker,
  updateExtraWorker,
  deleteExtraWorker,
} = require('../controllers/extraWorker.controller');

const { createExtraWorkerValidation, updateExtraWorkerValidation } = require('../modules/extraWorkers/extraWorker.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PM'), getAllExtraWorkers);
router.get('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PM'), getExtraWorkerById);
router.post('/', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PM'), createExtraWorkerValidation, validate, createExtraWorker);
router.put('/:id', authorize('ADMIN', 'DAF', 'SUPERVISOR', 'PM'), updateExtraWorkerValidation, validate, updateExtraWorker);
router.delete('/:id', authorize('ADMIN', 'DAF'), deleteExtraWorker);

module.exports = router;
