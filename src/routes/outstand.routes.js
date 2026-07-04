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
  deleteOutstand,
} = require('../controllers/outstand.controller');

const { createOutstandValidation, rejectOutstandValidation, updateOutstandValidation } = require('../modules/outstands/outstand.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DAF', 'HR', 'ACCOUNTANT', 'RECEPTIONIST', 'CASHIER'), getAllOutstands);
router.get('/:id', authorize('ADMIN', 'DAF', 'HR', 'ACCOUNTANT', 'RECEPTIONIST', 'CASHIER'), getOutstandById);
router.post('/', authorize('RECEPTIONIST', 'CASHIER'), createOutstandValidation, validate, createOutstand);
router.put('/:id', authorize('RECEPTIONIST', 'ADMIN', 'CASHIER'), updateOutstandValidation, validate, updateOutstand);
router.patch('/:id/approve', authorize('ADMIN', 'DAF', 'HR', 'RECEPTIONIST', 'ACCOUNTANT', 'CASHIER'), approveOutstand);
router.patch('/:id/reject', authorize('ADMIN', 'DAF', 'HR', 'CASHIER'), rejectOutstandValidation, validate, rejectOutstand);
router.patch('/:id/pay', authorize('ACCOUNTANT', 'DAF', 'HR', 'CASHIER'), markAsPaid);
router.delete('/:id', authorize('ADMIN', 'DAF'), deleteOutstand);

module.exports = router;
