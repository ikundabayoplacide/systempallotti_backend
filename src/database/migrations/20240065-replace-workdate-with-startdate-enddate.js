'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('casual_workers', 'workDate');
    await queryInterface.addColumn('casual_workers', 'startDate', {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: '2025-01-01', // safe default for existing rows
    });
    await queryInterface.addColumn('casual_workers', 'endDate', {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: '2025-01-01',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('casual_workers', 'startDate');
    await queryInterface.removeColumn('casual_workers', 'endDate');
    await queryInterface.addColumn('casual_workers', 'workDate', {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: '2025-01-01',
    });
  },
};
