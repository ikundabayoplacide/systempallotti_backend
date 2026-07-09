const express = require('express');
const router = express.Router();
const { getAllSheets, getSheetById, createSheet, updateSheet, deleteSheet } = require('../controllers/sheet.controller');
const { createSheetValidation, updateSheetValidation } = require('../modules/sheets/sheet.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', getAllSheets);
router.get('/:id', getSheetById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST', 'SALES', 'STOCK', 'DAF'), createSheetValidation, validate, createSheet);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST', 'SALES', 'STOCK', 'DAF'), updateSheetValidation, validate, updateSheet);
router.delete('/:id', authorize('ADMIN', 'DAF', 'RECEPTIONIST'), deleteSheet);

module.exports = router;
