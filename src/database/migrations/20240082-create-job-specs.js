'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_specs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      jobId: { type: Sequelize.UUID, allowNull: false, references: { model: 'jobs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      addedById: { type: Sequelize.UUID, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      paperType: { type: Sequelize.STRING(100), allowNull: true },
      paperWeight: { type: Sequelize.STRING(50), allowNull: true },
      size: { type: Sequelize.STRING(50), allowNull: true },
      colors: { type: Sequelize.STRING(50), allowNull: true },
      finishType: { type: Sequelize.STRING(100), allowNull: true },
      quantity: { type: Sequelize.INTEGER, allowNull: true },
      materials: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('job_spec_documents', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      jobSpecId: { type: Sequelize.UUID, allowNull: false, references: { model: 'job_specs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      uploadedById: { type: Sequelize.UUID, allowNull: true },
      fileName: { type: Sequelize.STRING, allowNull: false },
      mimeType: { type: Sequelize.STRING, allowNull: false },
      fileUrl: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('job_specs', ['jobId']);
    await queryInterface.addIndex('job_spec_documents', ['jobSpecId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_spec_documents');
    await queryInterface.dropTable('job_specs');
  },
};
