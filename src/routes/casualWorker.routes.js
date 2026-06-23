const express = require('express');
const router = express.Router();

const {
  getAllCasualWorkers,
  getCasualWorkerById,
  createCasualWorker,
  updateCasualWorker,
  deleteCasualWorker,
} = require('../controllers/casualWorker.controller');

const { createCasualWorkerValidation, updateCasualWorkerValidation } = require('../modules/casualWorkers/casualWorker.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), getAllCasualWorkers);
router.get('/:id', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), getCasualWorkerById);
router.post('/', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), createCasualWorkerValidation, validate, createCasualWorker);
router.put('/:id', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), updateCasualWorkerValidation, validate, updateCasualWorker);
router.delete('/:id', authorize('ADMIN', 'DAF'), deleteCasualWorker);

module.exports = router;
