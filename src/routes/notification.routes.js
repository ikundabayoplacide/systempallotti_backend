const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  getStats,
  markAsRead,
  markAllAsRead,
  getViewers,
  deleteNotification,
  deleteAllNotifications,
} = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/stats', getStats);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.get('/:id/viewers', getViewers);
router.delete('/', deleteAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
