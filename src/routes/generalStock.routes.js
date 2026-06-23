const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/generalStock.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Items — managed by STOCK/ADMIN
router.get('/items', authorize('ADMIN', 'STOCK', 'HOBE'), ctrl.getAllItems);
router.get('/items/:id', authorize('ADMIN', 'STOCK', 'HOBE'), ctrl.getItemById);
router.post('/items', authorize('ADMIN', 'STOCK'), ctrl.createItem);
router.put('/items/:id', authorize('ADMIN', 'STOCK'), ctrl.updateItem);
router.delete('/items/:id', authorize('ADMIN'), ctrl.deleteItem);

// Entries (IN)
router.get('/entries', authorize('ADMIN', 'STOCK'), ctrl.getAllEntries);
router.post('/entries', authorize('ADMIN', 'STOCK'), ctrl.createEntry);

// Sorties (OUT)
router.get('/sorties/my', authorize('HOBE'), ctrl.getMySorties);
router.get('/sorties', authorize('ADMIN', 'STOCK'), ctrl.getAllSorties);
router.get('/sorties/:id', authorize('ADMIN', 'STOCK'), ctrl.getSortieById);
router.post('/sorties', authorize('HOBE'), ctrl.createSortie);
router.patch('/sorties/:id/approve', authorize('ADMIN', 'STOCK'), ctrl.approveSortie);
router.patch('/sorties/:id/reject', authorize('ADMIN', 'STOCK'), ctrl.rejectSortie);

module.exports = router;
