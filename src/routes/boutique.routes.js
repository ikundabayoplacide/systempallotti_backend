const express = require('express');
const router = express.Router();

const {
  getAllCategories, createCategory, updateCategory, deleteCategory,
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  markAsSold, updateStock, getStockMovements,
  getSalesAudit, getSalesSummary, updateSale, deleteSale,
} = require('../controllers/boutique.controller');

const {
  createCategoryValidation, updateCategoryValidation,
  createProductValidation, updateProductValidation,
  updateStockValidation, markAsSoldValidation, updateSaleValidation,
} = require('../modules/boutique/boutique.validation');

const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories', getAllCategories);
router.post('/categories', authorize('ADMIN'), createCategoryValidation, validate, createCategory);
router.put('/categories/:id', authorize('ADMIN'), updateCategoryValidation, validate, updateCategory);
router.delete('/categories/:id', authorize('ADMIN'), deleteCategory);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', authorize('ADMIN', 'STOCK','RECEPTIONIST'), createProductValidation, validate, createProduct);
router.put('/products/:id', authorize('ADMIN', 'STOCK'), updateProductValidation, validate, updateProduct);
router.delete('/products/:id', authorize('ADMIN'), deleteProduct);

router.patch('/products/:id/sale-status', authorize('ADMIN', 'STOCK', 'RECEPTIONIST'), markAsSoldValidation, validate, markAsSold);
// ── Stock Management ──────────────────────────────────────────────────────────
router.patch('/products/:id/stock', authorize('ADMIN', 'STOCK', 'RECEPTIONIST'), updateStockValidation, validate, updateStock);
router.get('/products/:id/stock-movements', getStockMovements);

// ── Sales Audit ───────────────────────────────────────────────────────────────
router.get('/sales', authorize('ADMIN', 'STOCK', 'RECEPTIONIST', 'ACCOUNTANT'), getSalesAudit);
router.get('/sales/summary', authorize('ADMIN', 'ACCOUNTANT'), getSalesSummary);
router.put('/sales/:id', authorize('ADMIN', 'RECEPTIONIST'), updateSaleValidation, validate, updateSale);
router.delete('/sales/:id', authorize('ADMIN'), deleteSale);

module.exports = router;
