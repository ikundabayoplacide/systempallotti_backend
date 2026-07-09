const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bindingStock.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Items — managed by SUPERVISOR (binding dept) and ADMIN
router.get('/items', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRODUCTION_MANAGER', 'RECEPTIONIST'), ctrl.getAllItems);
router.get('/items/:id', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRODUCTION_MANAGER', 'RECEPTIONIST'), ctrl.getItemById);
router.post('/items', authorize('ADMIN', 'SUPERVISOR'), ctrl.createItem);
router.put('/items/:id', authorize('ADMIN', 'SUPERVISOR'), ctrl.updateItem);
router.delete('/items/:id', authorize('ADMIN', 'SUPERVISOR'), ctrl.deleteItem);

// Entries (IN)
router.get('/entries', authorize('ADMIN', 'SUPERVISOR', 'PRODUCTION_MANAGER'), ctrl.getAllEntries);
router.post('/entries', authorize('ADMIN', 'SUPERVISOR'), ctrl.createEntry);

// Sorties (OUT)
router.get('/sorties/my', authorize('SUPERVISOR', 'WORKER', 'RECEPTIONIST'), ctrl.getMySorties);
router.get('/sorties', authorize('ADMIN', 'SUPERVISOR', 'PRODUCTION_MANAGER'), ctrl.getAllSorties);
router.get('/sorties/:id', authorize('ADMIN', 'SUPERVISOR', 'PRODUCTION_MANAGER'), ctrl.getSortieById);
router.post('/sorties', authorize('SUPERVISOR', 'WORKER', 'RECEPTIONIST'), ctrl.createSortie);
router.patch('/sorties/:id/approve', authorize('ADMIN', 'SUPERVISOR'), ctrl.approveSortie);
router.patch('/sorties/:id/reject', authorize('ADMIN', 'SUPERVISOR'), ctrl.rejectSortie);

module.exports = router;
