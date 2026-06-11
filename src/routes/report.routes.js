const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const env = require('../config/env');

const { createReport, getAllReports, getReportById, updateReport, deleteReport } = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(env.uploadPath, 'reports'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `report-${unique}${path.extname(file.originalname)}`);
  },
});

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
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (req, file, cb) => {
    allowedMimes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid file type. Allowed: PDF, DOC, XLS, JPEG, PNG, WEBP'), false);
  },
});

router.use(authenticate);

router.get('/', getAllReports);
router.get('/:id', getReportById);
router.post('/', upload.single('attachment'), createReport);
router.put('/:id', upload.single('attachment'), updateReport);
router.delete('/:id', deleteReport);

module.exports = router;
