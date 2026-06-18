'use strict';

const { v4: uuidv4 } = require('uuid');
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@printinghouse.com' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!users.length) return;

    const adminId = users[0].id;
    const notifId = uuidv4();

    await queryInterface.bulkInsert('notifications', [
      {
        id: notifId,
        createdById: adminId,
        title: 'Welcome to Printing House',
        message: 'Your system is set up and ready to use.',
        type: 'GENERAL',
        relatedEntityType: null,
        relatedEntityId: null,
        targetRoles: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create a read record so the admin sees the welcome notification
    await queryInterface.bulkInsert('notification_reads', [
      {
        id: uuidv4(),
        notificationId: notifId,
        userId: adminId,
        isRead: false,
        viewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('notification_reads', null, {});
    await queryInterface.bulkDelete('notifications', null, {});
  },
};
