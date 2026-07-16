'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('boutique_sales', 'paymentMethod', {
      type: Sequelize.ENUM('cash', 'mobile', 'card', 'bank', 'oncredit'),
      allowNull: false,
      defaultValue: 'cash',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('boutique_sales', 'paymentMethod', {
      type: Sequelize.ENUM('cash', 'mobile', 'card', 'bank'),
      allowNull: false,
      defaultValue: 'cash',
    });
  },
};
