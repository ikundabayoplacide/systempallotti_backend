const express = require('express');
const router = express.Router();

const {
  getAllRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  approveRequest,
  rejectRequest,
} = require('../controllers/boutiqueStockRequest.controller');

const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/my', authorize('RECEPTIONIST', 'ADMIN'), getMyRequests);
router.get('/', authorize('STOCK', 'ADMIN'), getAllRequests);
router.get('/:id', getRequestById);
router.post('/', authorize('RECEPTIONIST', 'ADMIN'), createRequest);
router.put('/:id', authorize('RECEPTIONIST', 'ADMIN'), updateRequest);
router.delete('/:id', authorize('RECEPTIONIST', 'STOCK', 'DAF', 'ADMIN'), deleteRequest);
router.patch('/:id/approve', authorize('STOCK', 'ADMIN'), approveRequest);
router.patch('/:id/reject', authorize('STOCK', 'ADMIN'), rejectRequest);

module.exports = router;
