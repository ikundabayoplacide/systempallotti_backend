const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/auth.controller');
const { loginValidation, registerValidation, changePasswordValidation } = require('../modules/auth/auth.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/register', authenticate, authorize('ADMIN'), registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePasswordValidation, validate, changePassword);

module.exports = router;
