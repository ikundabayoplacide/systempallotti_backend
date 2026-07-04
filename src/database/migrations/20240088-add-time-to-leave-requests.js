'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('leave_requests', 'start_time', {
      type: Sequelize.STRING(5),
      allowNull: true,
    });
    await queryInterface.addColumn('leave_requests', 'end_time', {
      type: Sequelize.STRING(5),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('leave_requests', 'start_time');
    await queryInterface.removeColumn('leave_requests', 'end_time');
  },
};
