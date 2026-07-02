const express = require('express');
const router = express.Router();

const {
  getAllSamples,
  getSampleById,
  createSample,
  updateSample,
  reviewSample,
  deleteSample,
  deleteSampleDocument,
} = require('../controllers/departmentSample.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../config/multer');

router.use(authenticate);

const viewers = ['ADMIN', 'PRODUCTION_MANAGER', 'SUPERVISOR'];
const creators = ['ADMIN', 'PRODUCTION_MANAGER', 'SUPERVISOR'];
const reviewers = ['ADMIN', 'PRODUCTION_MANAGER'];

router.get('/', authorize(...viewers), getAllSamples);
router.get('/:id', authorize(...viewers), getSampleById);
router.post('/', authorize(...creators), upload.array('documents', 10), createSample);
router.put('/:id', authorize(...creators), upload.array('documents', 10), updateSample);
router.patch('/:id/review', authorize(...reviewers), reviewSample);
router.delete('/:id', authorize('ADMIN', 'PRODUCTION_MANAGER', 'SUPERVISOR'), deleteSample);
router.delete('/:id/documents/:docId', authorize(...creators), deleteSampleDocument);

module.exports = router;
