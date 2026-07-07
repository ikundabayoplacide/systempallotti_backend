const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { loginValidation, registerValidation, changePasswordValidation, forgotPasswordValidation, resetPasswordValidation } = require('../modules/auth/auth.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/register', authenticate, authorize('ADMIN'), registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePasswordValidation, validate, changePassword);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

module.exports = router;
