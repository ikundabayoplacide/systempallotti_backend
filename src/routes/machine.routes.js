const express = require('express');
const router = express.Router();
const {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} = require('../controllers/machine.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', getAllMachines);
router.get('/:id', getMachineById);
router.post('/', authorize('ADMIN', 'SUPERVISOR'), createMachine);
router.put('/:id', authorize('ADMIN', 'SUPERVISOR'), updateMachine);
router.delete('/:id', authorize('ADMIN'), deleteMachine);

module.exports = router;
