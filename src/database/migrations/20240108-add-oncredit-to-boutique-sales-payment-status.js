'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('boutique_sales', 'paymentStatus', {
      type: Sequelize.ENUM('paid', 'partial', 'overpaid', 'oncredit'),
      allowNull: false,
      defaultValue: 'paid',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('boutique_sales', 'paymentStatus', {
      type: Sequelize.ENUM('paid', 'partial', 'overpaid'),
      allowNull: false,
      defaultValue: 'paid',
    });
  },
};
