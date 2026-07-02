'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // Who receives this notification
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // Notification type for frontend icon/color handling
      type: {
        type: Sequelize.ENUM(
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
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      // Optional link back to the related entity
      relatedEntityType: {
        type: Sequelize.STRING, // 'job', 'department', etc.
        allowNull: true,
      },
      relatedEntityId: {
        type: Sequelize.UUID,
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

    await queryInterface.addIndex('notifications', ['userId']);
    await queryInterface.addIndex('notifications', ['isRead']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  },
};
