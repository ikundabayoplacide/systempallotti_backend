'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('boutique_stock_sorties', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'taken'),
      allowNull: false,
      defaultValue: 'pending',
    });

    await queryInterface.addColumn('boutique_stock_sorties', 'taken_by_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('boutique_stock_sorties', 'taken_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('boutique_stock_sorties', 'taken_by_id');
    await queryInterface.removeColumn('boutique_stock_sorties', 'taken_at');
    await queryInterface.changeColumn('boutique_stock_sorties', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },
};
