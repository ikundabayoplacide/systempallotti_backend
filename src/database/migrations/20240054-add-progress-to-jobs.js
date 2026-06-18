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
    const tableDesc = await queryInterface.describeTable('jobs');
    if (tableDesc.progress) await queryInterface.removeColumn('jobs', 'progress');
    if (tableDesc.resumedAt) await queryInterface.removeColumn('jobs', 'resumedAt');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_jobs_progress";');
  },
};
