'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('boutique_sales', 'productId', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn('boutique_sales', 'stockItemId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'boutique_stock_items', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      after: 'productId',
    });

    await queryInterface.addIndex('boutique_sales', ['stockItemId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('boutique_sales', ['stockItemId']);
    await queryInterface.removeColumn('boutique_sales', 'stockItemId');
    await queryInterface.changeColumn('boutique_sales', 'productId', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
