'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('boutique_sales', 'paymentMethod', {
      type: Sequelize.ENUM('cash', 'mobile', 'card', 'bank'),
      allowNull: false,
      defaultValue: 'cash',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('boutique_sales', 'paymentMethod');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_boutique_sales_paymentMethod";');
  },
};
