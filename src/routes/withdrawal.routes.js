const express = require('express');
const router = express.Router();

const {
  getConfig,
  setConfig,
  getBalance,
  getAllWithdrawals,
  getWithdrawalById,
  createWithdrawal,
  updateWithdrawal,
  deleteWithdrawal,
} = require('../controllers/withdrawal.controller');
const { createWithdrawalValidation, updateWithdrawalValidation } = require('../modules/withdrawals/withdrawal.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/config', getConfig);
router.put('/config', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'CASHIER'), setConfig);
router.get('/balance', getBalance);
router.get('/', getAllWithdrawals);
router.get('/:id', getWithdrawalById);
router.post('/', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'CASHIER'), createWithdrawalValidation, validate, createWithdrawal);
router.put('/:id', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'CASHIER'), updateWithdrawalValidation, validate, updateWithdrawal);
router.delete('/:id', authorize('ADMIN', 'DAF'), deleteWithdrawal);

module.exports = router;
