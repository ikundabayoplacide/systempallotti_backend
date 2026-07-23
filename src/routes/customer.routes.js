const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customer.controller');
const { createCustomerValidation, updateCustomerValidation } = require('../modules/customers/customer.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), createCustomerValidation, validate, createCustomer);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST', 'SALESMANAGER'), updateCustomerValidation, validate, updateCustomer);
router.delete('/:id', authorize('ADMIN', 'DAF', 'RECEPTIONIST'), deleteCustomer);

module.exports = router;
