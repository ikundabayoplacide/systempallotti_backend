'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('job_items', 'stockItemId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'stock_items', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('job_items', 'stockItemId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'stock_items', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
};
