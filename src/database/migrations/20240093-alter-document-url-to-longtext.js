'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('leave_requests', 'document_url', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('leave_requests', 'document_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
