const express = require('express');
const router = express.Router();

const {
  getStats,
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStage,
  deleteLead,
} = require('../controllers/procurement.controller');

const { createLeadValidation, updateLeadValidation, updateLeadStageValidation } = require('../modules/procurement/procurement.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../config/multer');

router.use(authenticate);

// KPI + pipeline overview (must be before /:id)
router.get('/stats', authorize('ADMIN', 'SALES', 'SUPERVISOR', 'DAF'), getStats);

// CRUD
router.get('/', authorize('ADMIN', 'SALES', 'SUPERVISOR', 'DAF'), getAllLeads);
router.get('/:id', authorize('ADMIN', 'SALES', 'SUPERVISOR', 'DAF'), getLeadById);
router.post('/', authorize('ADMIN', 'SALES', 'DAF'), upload.array('documents', 10), createLeadValidation, validate, createLead);
router.put('/:id', authorize('ADMIN', 'SALES', 'DAF'), upload.array('documents', 10), updateLeadValidation, validate, updateLead);
router.patch('/:id/stage', authorize('ADMIN', 'SALES', 'SUPERVISOR', 'DAF'), updateLeadStageValidation, validate, updateLeadStage);
router.delete('/:id', authorize('ADMIN', 'SALES', 'DAF'), deleteLead);

module.exports = router;
