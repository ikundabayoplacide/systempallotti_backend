const express = require('express');
const router = express.Router();

const {
  getNextJobNumber,
  getJobByNumber,
  getAllJobs,
  getJobById,
  getJobDetails,
  createJob,
  updateJob,
  updateJobStatus,
  updateJobState,
  updateInProduction,
  startJob,
  pauseJob,
  resumeJob,
  markJobDone,
  approveJob,
  rejectJob,
  assignJob,
  reassignJob,
  completeJob,
  deliverJob,
  getCompletedAndPaidJobs,
  deleteJob,
} = require('../controllers/job.controller');

const {
  createJobValidation,
  updateJobValidation,
  updateJobStatusValidation,
  updateJobStateValidation,
  assignJobValidation,
  rejectJobValidation,
} = require('../modules/jobs/job.validation');

const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../config/multer');
const jobDocumentRoutes = require('./jobDocument.routes');

// All job routes require authentication
router.use(authenticate);

// Preview next job number (no body mutation)
router.get('/next-number', getNextJobNumber);

// Find by job number (e.g. JOB-2026-001)
router.get('/number/:jobNumber', getJobByNumber);

// List & create
router.get('/completed-and-paid', getCompletedAndPaidJobs);
router.get('/', getAllJobs);
router.post('/', authorize('ADMIN', 'RECEPTIONIST', 'SALES'), upload.array('documents', 10), createJobValidation, validate, createJob);

// Job documents sub-routes
router.use('/:jobId/documents', jobDocumentRoutes);

// Single job CRUD
router.get('/:id/details', getJobDetails);
router.get('/:id', getJobById);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST', 'SALES', 'PRODUCTION_MANAGER'), updateJobValidation, validate, updateJob);
router.delete('/:id', authorize('ADMIN'), deleteJob);

// Workflow actions
router.patch('/:id/status', authorize('ADMIN', 'RECEPTIONIST', 'SALES', 'PRINTEMPLOYEE', 'SUPERVISOR'), updateJobStatusValidation, validate, updateJobStatus);
router.patch('/:id/state', authorize('ADMIN', 'SUPERVISOR'), updateJobStateValidation, validate, updateJobState);
router.patch('/:id/in-production', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), updateInProduction);
router.patch('/:id/start', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), startJob);
router.patch('/:id/pause', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), pauseJob);
router.patch('/:id/resume', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), resumeJob);
router.patch('/:id/done', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), markJobDone);
router.post('/:id/approve', authorize('ADMIN', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'DAF'), approveJob);
router.post('/:id/reject', authorize('ADMIN', 'SUPERVISOR', 'PRODUCTION_MANAGER', 'DAF'), rejectJobValidation, validate, rejectJob);
router.post('/:id/assign', authorize('ADMIN', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER'), assignJobValidation, validate, assignJob);
router.patch('/:id/reassign', authorize('ADMIN', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER'), assignJobValidation, validate, reassignJob);
router.patch('/:id/deliver', authorize('ADMIN', 'RECEPTIONIST', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER'), deliverJob);
router.patch('/:id/complete', authorize('ADMIN', 'RECEPTIONIST', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER'), completeJob);

module.exports = router;
