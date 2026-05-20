const express = require('express');
const router = express.Router();

const { createPayment, getAllPayments, getPaymentById, getPaymentsByJob } = require('../controllers/payment.controller');
const { createPaymentValidation } = require('../modules/payments/payment.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', getAllPayments);
router.get('/job/:jobId', getPaymentsByJob);
router.get('/:id', getPaymentById);
router.post('/', authorize('ADMIN', 'DAF', 'ACCOUNTANT', 'RECEPTIONIST', 'SALES'), createPaymentValidation, validate, createPayment);

module.exports = router;
