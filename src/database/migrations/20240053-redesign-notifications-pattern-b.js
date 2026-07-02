'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS notification_reads;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS notifications;');

    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      createdById: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      type: {
        type: Sequelize.ENUM(
          'CUSTOMER_CREATED', 'CUSTOMER_CHECKIN', 'PAYMENT_COLLECTED',
          'JOB_DELIVERED', 'BOUTIQUE_STOCK_REQUEST', 'BOUTIQUE_PRODUCT_ADDED',
          'REPORT_GENERATED', 'JOB_CREATED', 'JOB_ASSIGNED', 'JOB_STATUS_CHANGED',
          'DEPARTMENT_ASSIGNED', 'PAYMENT_RECEIVED', 'GENERAL'
        ),
        defaultValue: 'GENERAL',
        allowNull: false,
      },
      relatedEntityType: { type: Sequelize.STRING, allowNull: true },
      relatedEntityId: { type: Sequelize.UUID, allowNull: true },
      targetRoles: { type: Sequelize.TEXT, allowNull: true, defaultValue: null, comment: 'JSON array of role strings' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('notifications', ['createdById']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['createdAt']);

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
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isRead: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      viewedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('notification_reads', ['notificationId']);
    await queryInterface.addIndex('notification_reads', ['userId']);
    await queryInterface.addIndex('notification_reads', ['isRead']);
    await queryInterface.addIndex('notification_reads', ['notificationId', 'userId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notification_reads');
    await queryInterface.dropTable('notifications');
  },
};
