const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/boutiqueStock.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Items — managed by STOCK/ADMIN
router.get('/items', authorize('ADMIN', 'STOCK', 'DAF', 'RECEPTIONIST'), ctrl.getAllItems);
router.get('/items/:id', authorize('ADMIN', 'STOCK', 'DAF', 'RECEPTIONIST'), ctrl.getItemById);
router.post('/items', authorize('ADMIN', 'STOCK'), ctrl.createItem);
router.put('/items/:id', authorize('ADMIN', 'STOCK'), ctrl.updateItem);
router.delete('/items/:id', authorize('ADMIN', 'STOCK'), ctrl.deleteItem);

// Entries (IN)
router.get('/entries', authorize('ADMIN', 'STOCK', 'DAF', 'RECEPTIONIST'), ctrl.getAllEntries);
router.post('/entries', authorize('ADMIN', 'STOCK', 'RECEPTIONIST'), ctrl.createEntry);

// Sorties (OUT)
router.get('/sorties/my', authorize('RECEPTIONIST'), ctrl.getMySorties);
router.get('/sorties', authorize('ADMIN', 'STOCK', 'DAF'), ctrl.getAllSorties);
router.get('/sorties/:id', authorize('ADMIN', 'STOCK', 'DAF'), ctrl.getSortieById);
router.post('/sorties', authorize('RECEPTIONIST'), ctrl.createSortie);
router.put('/sorties/:id', authorize('RECEPTIONIST'), ctrl.updateSortie);
router.delete('/sorties/:id', authorize('RECEPTIONIST', 'STOCK', 'DAF', 'ADMIN'), ctrl.deleteSortie);
router.patch('/sorties/:id/approve', authorize('ADMIN', 'DAF'), ctrl.approveSortie);
router.patch('/sorties/:id/reject', authorize('ADMIN', 'DAF'), ctrl.rejectSortie);
router.patch('/sorties/:id/take', authorize('ADMIN', 'STOCK'), ctrl.takeSortie);

module.exports = router;
