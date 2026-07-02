'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('payments', 'receivedById', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.changeColumn('payments', 'receiptNo', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('payments', 'amountPaid', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('payments', 'balance', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('payments', 'paymentMethod', {
      type: Sequelize.ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'),
      allowNull: true,
    });

    await queryInterface.changeColumn('payments', 'paymentState', {
      type: Sequelize.ENUM('FULL', 'PARTIAL'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('payments', 'receivedById', {
      type: Sequelize.UUID,
      allowNull: false,
    });

    await queryInterface.changeColumn('payments', 'receiptNo', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('payments', 'paymentMethod', {
      type: Sequelize.ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'),
      allowNull: false,
    });

    await queryInterface.changeColumn('payments', 'paymentState', {
      type: Sequelize.ENUM('FULL', 'PARTIAL'),
      allowNull: false,
    });
  },
};
