const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');
const { getJobsByDepartment } = require('../controllers/job.controller');
const { createDepartmentValidation, updateDepartmentValidation } = require('../modules/departments/department.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.get('/:id/jobs', getJobsByDepartment);
router.post('/', authorize('ADMIN', 'DAF'), createDepartmentValidation, validate, createDepartment);
router.put('/:id', authorize('ADMIN', 'DAF'), updateDepartmentValidation, validate, updateDepartment);
router.delete('/:id', authorize('ADMIN', 'DAF'), deleteDepartment);

module.exports = router;
