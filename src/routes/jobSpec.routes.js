const express = require('express');
const router = express.Router({ mergeParams: true });

const { getJobSpecs, getJobSpecById, createJobSpec, updateJobSpec, deleteJobSpec, deleteJobSpecDocument } = require('../controllers/jobSpec.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../config/multer');

router.use(authenticate);

const allowed = ['ADMIN', 'PRODUCTION_MANAGER', 'SUPERVISOR'];

router.get('/', authorize(...allowed), getJobSpecs);
router.get('/:id', authorize(...allowed), getJobSpecById);
router.post('/', authorize(...allowed), upload.array('documents', 10), createJobSpec);
router.put('/:id', authorize(...allowed), upload.array('documents', 10), updateJobSpec);
router.delete('/:id', authorize('ADMIN', 'PRODUCTION_MANAGER'), deleteJobSpec);
router.delete('/:id/documents/:docId', authorize(...allowed), deleteJobSpecDocument);

module.exports = router;
