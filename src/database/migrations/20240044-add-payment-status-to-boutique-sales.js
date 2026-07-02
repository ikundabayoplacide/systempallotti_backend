'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('boutique_sales', 'totalPrice', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'quantity × unitPrice at time of sale',
    });
    await queryInterface.addColumn('boutique_sales', 'balanceDue', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount customer still owes (0 if fully paid or overpaid)',
    });
    await queryInterface.addColumn('boutique_sales', 'changeGiven', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount to give back to customer (0 if exact or underpaid)',
    });
    await queryInterface.addColumn('boutique_sales', 'paymentStatus', {
      type: Sequelize.ENUM('paid', 'partial', 'overpaid'),
      allowNull: false,
      defaultValue: 'paid',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('boutique_sales', 'totalPrice');
    await queryInterface.removeColumn('boutique_sales', 'balanceDue');
    await queryInterface.removeColumn('boutique_sales', 'changeGiven');
    await queryInterface.removeColumn('boutique_sales', 'paymentStatus');
  },
};
