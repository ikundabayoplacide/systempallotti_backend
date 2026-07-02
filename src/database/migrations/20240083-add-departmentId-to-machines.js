'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('machines', 'departmentId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'departments', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('machines', ['departmentId']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('machines', 'departmentId');
  },
};
