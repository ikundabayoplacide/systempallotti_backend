'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'progress', {
      type: Sequelize.ENUM('started', 'paused', 'resumed', 'completed'),
      allowNull: true,
      defaultValue: null,
      comment: 'Worker-driven progress state: started, paused, resumed, or completed',
    });
    await queryInterface.addColumn('jobs', 'resumedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('jobs', 'progress');
    await queryInterface.removeColumn('jobs', 'resumedAt');
  },
};
