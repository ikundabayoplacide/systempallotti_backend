const express = require('express');
const router = express.Router();

const {
  getAllItems, getItemById, createItem, updateItem, deleteItem,
  getAllEntries, createEntry,
  getAllSorties, getSortieById, getMySorties, createSortie, approveSortie, rejectSortie,
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
router.post('/items', authorize('ADMIN', 'STOCK', 'SUPERVISOR'), createItemValidation, validate, createItem);
router.put('/items/:id', authorize('ADMIN', 'STOCK', 'SUPERVISOR'), updateItemValidation, validate, updateItem);
router.delete('/items/:id', authorize('ADMIN'), deleteItem);

// ── Stock Entries (IN) ────────────────────────────────────────────────────────
router.get('/entries', getAllEntries);
router.post('/entries', authorize('ADMIN', 'STOCK'), createEntryValidation, validate, createEntry);

// ── Stock Sorties (OUT) ───────────────────────────────────────────────────────
router.get('/sorties/my', authorize('SUPERVISOR', 'PRODUCTION_MANAGER'), getMySorties);
router.get('/sorties', authorize('ADMIN', 'STOCK', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER'), getAllSorties);
router.get('/sorties/:id', authorize('ADMIN', 'STOCK', 'DAF', 'SUPERVISOR', 'PRODUCTION_MANAGER'), getSortieById);
router.post('/sorties', authorize('ADMIN', 'STOCK', 'SUPERVISOR', 'PRODUCTION_MANAGER'), createSortieValidation, validate, createSortie);
router.patch('/sorties/:id/approve', authorize('ADMIN', 'STOCK', 'SUPERVISOR'), approveSortie);
router.patch('/sorties/:id/reject', authorize('ADMIN', 'STOCK', 'SUPERVISOR'), rejectSortie);

module.exports = router;
