const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getMyProfile, updateMyProfile } = require('../controllers/user.controller');
const { createUserValidation, updateUserValidation, updateMyProfileValidation } = require('../modules/users/user.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Self-service profile routes (any authenticated role)
router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfileValidation, validate, updateMyProfile);

router.get('/', getAllUsers);
router.post('/', createUserValidation, validate, createUser);
router.get('/:id', authenticate, authorize('ADMIN'), getUserById);
router.put('/:id', authenticate, authorize('ADMIN'), updateUserValidation, validate, updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

module.exports = router;
