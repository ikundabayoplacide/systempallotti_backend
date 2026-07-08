const express = require('express');
const router = express.Router();

const { getAllProformas, getProformaById, createProforma, updateProforma, updateProformaStatus, deleteProforma } = require('../controllers/proforma.controller');
const { createProformaValidation, updateProformaValidation, updateProformaStatusValidation } = require('../modules/proformas/proforma.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', getAllProformas);
router.get('/:id', getProformaById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST', 'SALES'), createProformaValidation, validate, createProforma);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST', 'SALES'), updateProformaValidation, validate, updateProforma);
router.patch('/:id/status', authorize('ADMIN', 'RECEPTIONIST', 'SALES'), updateProformaStatusValidation, validate, updateProformaStatus);
router.delete('/:id', authorize('ADMIN', 'RECEPTIONIST'), deleteProforma);

module.exports = router;
