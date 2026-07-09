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
} = require('../controllers/stockRequest.controller');

const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/my', authorize('STOCK', 'ADMIN'), getMyRequests);
router.get('/', authorize('DAF', 'ADMIN'), getAllRequests);
router.get('/:id', getRequestById);
router.post('/', authorize('STOCK', 'ADMIN'), createRequest);
router.put('/:id', authorize('STOCK', 'ADMIN'), updateRequest);
router.delete('/:id', authorize('STOCK', 'ADMIN'), deleteRequest);
router.patch('/:id/approve', authorize('DAF', 'ADMIN'), approveRequest);
router.patch('/:id/reject', authorize('DAF', 'ADMIN'), rejectRequest);

module.exports = router;
