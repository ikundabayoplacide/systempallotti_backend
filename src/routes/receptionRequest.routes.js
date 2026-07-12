const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getAllRequests, getRequestById, updateRequest, deleteRequest, approveRequest, rejectRequest } = require('../controllers/receptionRequest.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.post('/',              authorize('RECEPTIONIST'), createRequest);
router.get('/my',             authorize('RECEPTIONIST'), getMyRequests);
router.get('/',               authorize('ADMIN', 'DAF'), getAllRequests);
router.get('/:id',            authenticate, getRequestById);
router.put('/:id',            authorize('RECEPTIONIST'), updateRequest);
router.delete('/:id',         authorize('RECEPTIONIST', 'ADMIN'), deleteRequest);
router.patch('/:id/approve',  authorize('ADMIN', 'DAF'), approveRequest);
router.patch('/:id/reject',   authorize('ADMIN', 'DAF'), rejectRequest);

module.exports = router;
