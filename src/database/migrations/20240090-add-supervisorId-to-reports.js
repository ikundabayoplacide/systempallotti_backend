'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reports', 'supervisor_id', {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: null,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('reports', 'supervisor_id');
  },
};
