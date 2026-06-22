const express = require('express');
const router = express.Router();

const {
  getAllOutstands,
  getOutstandById,
  createOutstand,
  updateOutstand,
  approveOutstand,
  rejectOutstand,
  markAsPaid,
} = require('../controllers/outstand.controller');

const { createOutstandValidation, rejectOutstandValidation, updateOutstandValidation } = require('../modules/outstands/outstand.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'RECEPTIONIST'), getAllOutstands);
router.get('/:id', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'RECEPTIONIST'), getOutstandById);
router.post('/', authorize('RECEPTIONIST'), createOutstandValidation, validate, createOutstand);
router.put('/:id', authorize('RECEPTIONIST', 'ADMIN'), updateOutstandValidation, validate, updateOutstand);
router.patch('/:id/approve', authorize('ADMIN', 'DAF', 'RECEPTIONIST', 'ACCOUNTANT'), approveOutstand);
router.patch('/:id/reject', authorize('ADMIN', 'DAF'), rejectOutstandValidation, validate, rejectOutstand);
router.patch('/:id/pay', authorize('ACCOUNTANT', 'DAF'), markAsPaid);

module.exports = router;
