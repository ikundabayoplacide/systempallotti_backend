'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop old notification indexes and table
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS notifications CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_type";');

    // Create new notifications table (one row per event)
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // Who triggered this notification (receptionist, system, etc.)
      createdById: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          'CUSTOMER_CREATED',
          'CUSTOMER_CHECKIN',
          'PAYMENT_COLLECTED',
          'JOB_DELIVERED',
          'BOUTIQUE_STOCK_REQUEST',
          'BOUTIQUE_PRODUCT_ADDED',
          'REPORT_GENERATED',
          'JOB_CREATED',
          'JOB_ASSIGNED',
          'JOB_STATUS_CHANGED',
          'DEPARTMENT_ASSIGNED',
          'PAYMENT_RECEIVED',
          'GENERAL'
        ),
        defaultValue: 'GENERAL',
        allowNull: false,
      },
      relatedEntityType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      relatedEntityId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      // Which roles this notification targets (for fan-out on creation)
      targetRoles: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('notifications', ['createdById']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['createdAt']);

    // Create notification_reads junction table (one row per user who views a notification)
    await queryInterface.createTable('notification_reads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      notificationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'notifications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // The user who is supposed to receive / has viewed this notification
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      viewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('notification_reads', ['notificationId']);
    await queryInterface.addIndex('notification_reads', ['userId']);
    await queryInterface.addIndex('notification_reads', ['isRead']);
    // Unique: one read-record per user per notification
    await queryInterface.addIndex('notification_reads', ['notificationId', 'userId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notification_reads');
    await queryInterface.dropTable('notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_type";');
  },
};
