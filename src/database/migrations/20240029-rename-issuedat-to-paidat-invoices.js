'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('invoices', 'issuedAt', 'paidAt');
    await queryInterface.changeColumn('invoices', 'status', {
      type: Sequelize.ENUM('draft', 'issued', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'paid',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('invoices', 'paidAt', 'issuedAt');
    await queryInterface.changeColumn('invoices', 'status', {
      type: Sequelize.ENUM('draft', 'issued', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    });
  },
};
