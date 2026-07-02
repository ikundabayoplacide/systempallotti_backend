'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('stock_items', 'type', {
      type: Sequelize.ENUM('printing', 'general', 'binding'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('stock_items', 'type', {
      type: Sequelize.ENUM('printing'),
      allowNull: true,
    });
  },
};
