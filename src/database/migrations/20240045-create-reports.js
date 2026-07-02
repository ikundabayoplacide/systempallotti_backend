'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      purpose: { type: Sequelize.TEXT, allowNull: false },
      items: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      notes: { type: Sequelize.TEXT, allowNull: true },
      attachmentUrl: { type: Sequelize.STRING, allowNull: true, field: 'attachment_url' },
      createdById: { type: Sequelize.UUID, allowNull: false, field: 'created_by_id' },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reports');
  },
};
