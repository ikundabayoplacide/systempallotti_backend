'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'jobFor', {
      type: Sequelize.ENUM('hobe', 'general'),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('jobs', 'jobFor');
  },
};
