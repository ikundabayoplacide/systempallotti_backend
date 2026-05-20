'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      jobId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      recordedById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      receivedById: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Receptionist who accepted the payment',
      },
      verifiedById: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Accountant who verified/approved the payment',
      },
      receiptNo: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      amountPaid: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      paymentMethod: {
        type: Sequelize.ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'),
        allowNull: true,
      },
      paymentState: {
        type: Sequelize.ENUM('FULL', 'PARTIAL'),
        allowNull: true,
      },
      paymentNote: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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

    await queryInterface.addIndex('payments', ['jobId']);
    await queryInterface.addIndex('payments', ['recordedById']);
    await queryInterface.addIndex('payments', ['receiptNo'], { unique: true });
    await queryInterface.addIndex('payments', ['paidAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_paymentMethod";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_paymentState";');
  },
};
