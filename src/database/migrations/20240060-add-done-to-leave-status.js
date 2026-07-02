'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('leave_requests', 'status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'DONE'),
      defaultValue: 'PENDING',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('leave_requests', 'status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
      allowNull: false,
    });
  },
};
