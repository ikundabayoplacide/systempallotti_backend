const express = require('express');
const router = express.Router();

const {
  getAllPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  approvePayroll,
  markPayrollPaid,
  deletePayroll,
} = require('../controllers/payroll.controller');

const { createPayrollValidation, updatePayrollValidation } = require('../modules/payroll/payroll.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), getAllPayrolls);
router.get('/:id', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), getPayrollById);
router.post('/', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), createPayrollValidation, validate, createPayroll);
router.put('/:id', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), updatePayrollValidation, validate, updatePayroll);
router.patch('/:id/approve', authorize('ADMIN', 'DAF', 'HR'), approvePayroll);
router.patch('/:id/pay', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'HR'), markPayrollPaid);
router.delete('/:id', authorize('ADMIN', 'DAF'), deletePayroll);

module.exports = router;
