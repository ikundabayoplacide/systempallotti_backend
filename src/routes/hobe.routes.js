const express = require('express');
const router = express.Router();

const {
  getAllHobes, getHobeById, createHobe, updateHobe, deleteHobe,
  addQtyToHobe,
  sellFromHobe,
  getHobeSales, getHobeSalesSummary, updateHobeSale, deleteHobeSale,
} = require('../controllers/hobe.controller');

const { createHobeValidation, updateHobeValidation, sellFromHobeValidation, updateSaleValidation, addQtyToHobeValidation } = require('../modules/hobe/hobe.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');

router.use(authenticate);

// ── Hobes ─────────────────────────────────────────────────────────────────────
router.get('/', requirePermission('hobe.view'), getAllHobes);
router.get('/:id', requirePermission('hobe.view'), getHobeById);
router.post('/', requirePermission('hobe.create'), createHobeValidation, validate, createHobe);
router.put('/:id', requirePermission('hobe.edit'), updateHobeValidation, validate, updateHobe);
router.delete('/:id', requirePermission('hobe.delete'), deleteHobe);
router.patch('/:id/add-qty', requirePermission('hobe.edit'), addQtyToHobeValidation, validate, addQtyToHobe);

// ── Trade (sell) ──────────────────────────────────────────────────────────────
router.post('/:id/sell', requirePermission('hobe.sell'), sellFromHobeValidation, validate, sellFromHobe);

// ── Sales ─────────────────────────────────────────────────────────────────────
router.get('/sales/all', requirePermission('hobe.view'), getHobeSales);
router.get('/sales/summary', requirePermission('hobe.view'), getHobeSalesSummary);
router.put('/sales/:saleId', requirePermission('hobe.edit'), updateSaleValidation, validate, updateHobeSale);
router.delete('/sales/:saleId', requirePermission('hobe.delete'), deleteHobeSale);

module.exports = router;
