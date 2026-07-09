'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('procurement_lead_documents', 'fileUrl', {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('procurement_lead_documents', 'fileUrl', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
