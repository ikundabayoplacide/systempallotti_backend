const express = require('express');
const router = express.Router();

const {
  getNextJobNumber,
  getJobByNumber,
  getJobStats,
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
  verifyJob,
  getJobDepartmentHistory,
} = require('../controllers/job.controller');

const {
  createJobValidation,
  updateJobValidation,
  updateJobStatusValidation,
  updateJobStateValidation,
  assignJobValidation,
  rejectJobValidation,
  deliverJobValidation,
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

// Aggregated stats for dashboard
router.get('/stats', getJobStats);

// Find by job number (e.g. JOB-2026-001)
router.get('/number/:jobNumber', getJobByNumber);

// List & create
router.get('/completed-and-paid', getCompletedAndPaidJobs);
router.get('/', getAllJobs);
router.post('/', authorize('ADMIN', 'RECEPTIONIST', 'SALES', 'HOBE'), upload.array('documents', 10), (req, _res, next) => {
  if (req.body.items) {
    try {
      const raw = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
      const arr = Array.isArray(raw) ? raw : Object.values(raw);
      console.log('RAW ITEMS FROM MULTIPART:', JSON.stringify(arr, null, 2));
      req.body.items = arr.map((item) => {
        const parsed = typeof item === 'string' ? JSON.parse(item) : item;
        return Object.fromEntries(
          Object.entries(parsed).filter(([, v]) => v !== 'undefined' && v !== undefined && v !== null && v !== '')
        );
      });
      console.log('SANITIZED ITEMS:', JSON.stringify(req.body.items, null, 2));
    } catch { /* leave as-is */ }
  }
  next();
}, createJobValidation, validate, createJob);

// Job documents sub-routes
router.use('/:jobId/documents', jobDocumentRoutes);

// Single job CRUD
router.get('/:id/details', getJobDetails);
router.get('/:id', getJobById);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST', 'SALES', 'PRODUCTION_MANAGER'), updateJobValidation, validate, updateJob);
router.delete('/:id', authorize('ADMIN', 'SALES', 'RECEPTIONIST'), deleteJob);

// Workflow actions
router.patch('/:id/status', authorize('ADMIN', 'RECEPTIONIST', 'SALES', 'PRINTEMPLOYEE', 'SUPERVISOR'), updateJobStatusValidation, validate, updateJobStatus);
router.patch('/:id/state', authorize('ADMIN', 'SUPERVISOR'), updateJobStateValidation, validate, updateJobState);
router.patch('/:id/in-production', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), updateInProduction);
router.patch('/:id/start', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), startJob);
router.patch('/:id/pause', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), pauseJob);
router.patch('/:id/resume', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), resumeJob);
router.patch('/:id/done', authorize('ADMIN', 'SUPERVISOR', 'WORKER', 'PRINTEMPLOYEE'), markJobDone);
router.post('/:id/approve', authorize('ADMIN', 'SUPERVISOR', 'DAF', 'HR'), approveJob);
router.post('/:id/reject', authorize('ADMIN', 'SUPERVISOR', 'DAF', 'HR'), rejectJobValidation, validate, rejectJob);
router.post('/:id/assign', authorize('ADMIN', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER'), assignJobValidation, validate, assignJob);
router.patch('/:id/reassign', authorize('ADMIN', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER'), assignJobValidation, validate, reassignJob);
router.patch('/:id/deliver', authorize('ADMIN', 'RECEPTIONIST', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER'), deliverJobValidation, validate, deliverJob);
router.patch('/:id/complete', authorize('ADMIN', 'RECEPTIONIST', 'SUPERVISOR', 'SALES', 'PRODUCTION_MANAGER', 'HOBE'), completeJob);
router.patch('/:id/verify', authorize('ADMIN', 'DAF'), verifyJob);

// Department job history (jobs that previously passed through a department)
router.get('/departments/:id/jobs/history', authorize('ADMIN', 'SUPERVISOR', 'PRODUCTION_MANAGER'), getJobDepartmentHistory);

module.exports = router;
