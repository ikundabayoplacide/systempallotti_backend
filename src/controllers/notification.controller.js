const { Op } = require('sequelize');
const Notification = require('../database/models/Notification');
const NotificationRead = require('../database/models/NotificationRead');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const notifInclude = {
  model: Notification,
  as: 'notification',
  attributes: ['id', 'createdById', 'title', 'message', 'type', 'relatedEntityType', 'relatedEntityId', 'createdAt'],
  include: [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'role'] }],
};

/**
 * GET /api/notifications
 * My notifications (paginated). ?unreadOnly=true filters unread only.
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { userId: req.user.id };
    if (req.query.unreadOnly === 'true') where.isRead = false;

    const { count, rows } = await NotificationRead.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: [notifInclude],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await NotificationRead.count({
      where: { userId: req.user.id, isRead: false },
    });
    return success(res, { unreadCount: count });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/stats
 * Bell icon data: unread count + latest 5 unread notifications.
 */
const getStats = async (req, res, next) => {
  try {
    const unreadCount = await NotificationRead.count({
      where: { userId: req.user.id, isRead: false },
    });

    const latest = await NotificationRead.findAll({
      where: { userId: req.user.id, isRead: false },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [notifInclude],
    });

    return success(res, { unreadCount, latest });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read for the current user.
 */
const markAsRead = async (req, res, next) => {
  try {
    const read = await NotificationRead.findOne({
      where: { notificationId: req.params.id, userId: req.user.id },
    });

    if (!read) return error(res, 'Notification not found.', 404);

    await read.update({ isRead: true, viewedAt: new Date() });

    return success(res, read, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the current user.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await NotificationRead.update(
      { isRead: true, viewedAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );
    return success(res, null, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/:id/viewers
 * Who viewed this notification and when. (ADMIN only in routes)
 */
const getViewers = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return error(res, 'Notification not found.', 404);

    const reads = await NotificationRead.findAll({
      where: { notificationId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['viewedAt', 'DESC']],
    });

    return success(res, reads);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 * Remove this notification from my inbox (deletes my read record only).
 */
const deleteNotification = async (req, res, next) => {
  try {
    const read = await NotificationRead.findOne({
      where: { notificationId: req.params.id, userId: req.user.id },
    });

    if (!read) return error(res, 'Notification not found.', 404);

    await read.destroy();
    return success(res, null, 'Notification removed from your inbox.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications
 * Remove all notifications from my inbox.
 */
const deleteAllNotifications = async (req, res, next) => {
  try {
    await NotificationRead.destroy({ where: { userId: req.user.id } });
    return success(res, null, 'All notifications removed from your inbox.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  getStats,
  markAsRead,
  markAllAsRead,
  getViewers,
  deleteNotification,
  deleteAllNotifications,
};
