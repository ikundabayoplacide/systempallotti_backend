'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('jobs');

    if (!tableDesc.amount) {
      await queryInterface.addColumn('jobs', 'amount', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      });
    }

    if (!tableDesc.paymentStatus) {
      await queryInterface.addColumn('jobs', 'paymentStatus', {
        type: Sequelize.ENUM('unpaid', 'paid'),
        defaultValue: 'unpaid',
        allowNull: false,
      });
    }

    if (!tableDesc.receiptNo) {
      await queryInterface.addColumn('jobs', 'receiptNo', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }

    if (!tableDesc.paymentMethod) {
      await queryInterface.addColumn('jobs', 'paymentMethod', {
        type: Sequelize.ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'),
        allowNull: true,
      });
    }

    if (!tableDesc.paymentNote) {
      await queryInterface.addColumn('jobs', 'paymentNote', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!tableDesc.paidAt) {
      await queryInterface.addColumn('jobs', 'paidAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('jobs', 'amount');
    await queryInterface.removeColumn('jobs', 'paymentStatus');
    await queryInterface.removeColumn('jobs', 'receiptNo');
    await queryInterface.removeColumn('jobs', 'paymentMethod');
    await queryInterface.removeColumn('jobs', 'paymentNote');
    await queryInterface.removeColumn('jobs', 'paidAt');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_jobs_paymentStatus";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_jobs_paymentMethod";');
  },
};
