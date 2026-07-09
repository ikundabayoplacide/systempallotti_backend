/**
 * Notification Service — Pattern B
 *
 * One Notification row per event.
 * One NotificationRead row per recipient user (fan-out on write).
 *
 * Usage:
 *   const notify = require('../utils/notification.service');
 *   await notify({
 *     createdById: req.user.id,
 *     title: 'New Customer',
 *     message: 'Customer "John" has been registered.',
 *     type: 'CUSTOMER_CREATED',
 *     relatedEntityType: 'customer',
 *     relatedEntityId: customer.id,
 *     targetRoles: ['ADMIN', 'SALESMANAGER'],
 *   });
 */

const Notification = require('../database/models/Notification');
const NotificationRead = require('../database/models/NotificationRead');
const User = require('../database/models/User');
const logger = require('./logger');

/**
 * @param {object} opts
 * @param {string|null}   opts.createdById        - User who triggered the event
 * @param {string}        opts.title
 * @param {string}        opts.message
 * @param {string}        opts.type               - ENUM value
 * @param {string|null}   opts.relatedEntityType  - e.g. 'customer', 'job'
 * @param {string|null}   opts.relatedEntityId    - UUID of related record
 * @param {string[]}      opts.targetRoles        - Roles to fan-out to
 * @param {string[]}      [opts.targetUserIds]    - Extra specific user IDs (optional)
 */
const notify = async ({
  createdById = null,
  title,
  message,
  type = 'GENERAL',
  relatedEntityType = null,
  relatedEntityId = null,
  targetRoles = [],
  targetUserIds = [],
}) => {
  try {
    const notification = await Notification.create({
      createdById,
      title,
      message,
      type,
      relatedEntityType,
      relatedEntityId,
      targetRoles: targetRoles.length ? JSON.stringify(targetRoles) : null,
    });

    const recipientsByRole = targetRoles.length
      ? await User.findAll({
          where: { role: targetRoles, isActive: true },
          attributes: ['id', 'role'],
        })
      : [];

    const roleIds = recipientsByRole.map((u) => u.id);
    const allIds = [...new Set([...roleIds, ...targetUserIds])];

    const recipientIds = createdById
      ? allIds.filter((id) => id !== createdById)
      : allIds;

    if (recipientIds.length === 0) return;

    await NotificationRead.bulkCreate(
      recipientIds.map((userId) => ({
        notificationId: notification.id,
        userId,
        isRead: false,
        viewedAt: null,
      })),
      { ignoreDuplicates: true }
    );
  } catch (err) {
    logger.error(`[NotificationService] Failed: ${err.message}`, { stack: err.stack });
  }
};

module.exports = notify;
