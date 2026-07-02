'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stock_items', 'type', {
      type: Sequelize.ENUM('boutique', 'hobe'),
      allowNull: false,
      defaultValue: 'boutique',
      comment: 'Indicates which department this stock item belongs to',
    });

    await queryInterface.addIndex('stock_items', ['type']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('stock_items', 'type');
  },
};
