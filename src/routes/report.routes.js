const express = require('express');
const router = express.Router();
const multer = require('multer');
const env = require('../config/env');

const { createReport, getAllReports, getReportById, updateReport, deleteReport, getMyReports, getAssignedReports } = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSize },
  fileFilter: (req, file, cb) => {
    allowedMimes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid file type. Allowed: PDF, DOC, XLS, JPEG, PNG, WEBP'), false);
  },
});

router.use(authenticate);

router.get('/assigned', getAssignedReports);
router.get('/my', getMyReports);
router.get('/', getAllReports);
router.get('/:id', getReportById);
router.post('/', upload.single('attachment'), createReport);
router.put('/:id', upload.single('attachment'), updateReport);
router.delete('/:id', deleteReport);

module.exports = router;
