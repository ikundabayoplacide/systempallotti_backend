const express = require('express');
const router = express.Router();

const {
  getAllItems, getItemById, createItem, updateItem, deleteItem,
  getAllEntries, createEntry,
  getAllSorties, getMySorties, createSortie, approveSortie, rejectSortie,
} = require('../controllers/stock.controller');

const {
  createItemValidation, updateItemValidation,
  createEntryValidation, createSortieValidation,
} = require('../modules/stock/stock.validation');

const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// ── Stock Items ───────────────────────────────────────────────────────────────
router.get('/items', getAllItems);
router.get('/items/:id', getItemById);
router.post('/items', authorize('ADMIN', 'STOCK'), createItemValidation, validate, createItem);
router.put('/items/:id', authorize('ADMIN', 'STOCK'), updateItemValidation, validate, updateItem);
router.delete('/items/:id', authorize('ADMIN'), deleteItem);

// ── Stock Entries (IN) ────────────────────────────────────────────────────────
router.get('/entries', getAllEntries);
router.post('/entries', authorize('ADMIN', 'STOCK'), createEntryValidation, validate, createEntry);

// ── Stock Sorties (OUT) ───────────────────────────────────────────────────────
router.get('/sorties/my', authorize('RECEPTIONIST', 'HOBE', 'SUPERVISOR', 'PRODUCTION_MANAGER'), getMySorties);
router.get('/sorties', authorize('ADMIN', 'STOCK'), getAllSorties);
router.post('/sorties', authorize('ADMIN', 'STOCK', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'RECEPTIONIST', 'HOBE'), createSortieValidation, validate, createSortie);
router.patch('/sorties/:id/approve', authorize('ADMIN', 'STOCK'), approveSortie);
router.patch('/sorties/:id/reject', authorize('ADMIN', 'STOCK'), rejectSortie);

module.exports = router;
