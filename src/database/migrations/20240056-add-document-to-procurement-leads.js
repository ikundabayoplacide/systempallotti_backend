'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('procurement_lead_documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      procurementLeadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'procurement_leads', key: 'id' },
        onDelete: 'CASCADE',
      },
      uploadedById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      fileUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Base64 encoded file with data URI prefix',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('procurement_lead_documents');
  },
};
