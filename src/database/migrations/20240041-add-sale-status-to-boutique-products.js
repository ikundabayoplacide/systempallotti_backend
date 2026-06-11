'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('boutique_products', 'saleStatus', {
      type: Sequelize.ENUM('pending', 'sold'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('boutique_products', 'saleStatus');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_boutique_products_saleStatus";');
  },
};
