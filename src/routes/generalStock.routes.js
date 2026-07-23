const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/generalStock.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Items — managed by STOCK/ADMIN
router.get('/items', authorize('ADMIN', 'STOCK', 'DAF', 'HOBE', 'PRODUCTION_MANAGER', 'WORKER', 'SUPERVISOR', 'RECEPTIONIST', 'SALES'), ctrl.getAllItems);
router.get('/items/:id', authorize('ADMIN', 'STOCK', 'DAF', 'HOBE', 'PRODUCTION_MANAGER', 'WORKER', 'SUPERVISOR', 'RECEPTIONIST', 'SALES'), ctrl.getItemById);
router.post('/items', authorize('ADMIN', 'STOCK'), ctrl.createItem);
router.put('/items/:id', authorize('ADMIN', 'STOCK'), ctrl.updateItem);
router.delete('/items/:id', authorize('ADMIN', 'STOCK'), ctrl.deleteItem);

// Entries (IN)
router.get('/entries', authorize('ADMIN', 'STOCK', 'DAF', 'PRODUCTION_MANAGER'), ctrl.getAllEntries);
router.post('/entries', authorize('ADMIN', 'STOCK'), ctrl.createEntry);

// Sorties (OUT)
router.get('/sorties/my', authorize('HOBE', 'WORKER', 'SUPERVISOR', 'RECEPTIONIST', 'SALES'), ctrl.getMySorties);
router.get('/sorties', authorize('ADMIN', 'STOCK', 'DAF', 'PRODUCTION_MANAGER', 'SUPERVISOR'), ctrl.getAllSorties);
router.get('/sorties/:id', authorize('ADMIN', 'STOCK', 'DAF', 'PRODUCTION_MANAGER', 'SUPERVISOR'), ctrl.getSortieById);
router.post('/sorties', authorize('HOBE', 'WORKER', 'SUPERVISOR', 'RECEPTIONIST', 'SALES'), ctrl.createSortie);
router.patch('/sorties/:id', authorize('WORKER', 'SUPERVISOR'), ctrl.updateSortie);
router.patch('/sorties/:id/approve', authorize('ADMIN', 'STOCK'), ctrl.approveSortie);
router.patch('/sorties/:id/reject', authorize('ADMIN', 'STOCK'), ctrl.rejectSortie);

module.exports = router;
