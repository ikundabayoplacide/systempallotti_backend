'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('department_samples', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      departmentId: { type: Sequelize.UUID, allowNull: false, references: { model: 'departments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      createdById: { type: Sequelize.UUID, allowNull: true },
      name: { type: Sequelize.STRING(255), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      quantity: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      unit: { type: Sequelize.STRING(50), allowNull: true },
      sampleDate: { type: Sequelize.DATEONLY, allowNull: true },
      referenceNo: { type: Sequelize.STRING(100), allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'reviewed', 'approved', 'rejected'), defaultValue: 'pending', allowNull: false },
      reviewedById: { type: Sequelize.UUID, allowNull: true },
      reviewedAt: { type: Sequelize.DATE, allowNull: true },
      reviewNote: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('department_sample_documents', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      sampleId: { type: Sequelize.UUID, allowNull: false, references: { model: 'department_samples', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      uploadedById: { type: Sequelize.UUID, allowNull: true },
      fileName: { type: Sequelize.STRING, allowNull: false },
      mimeType: { type: Sequelize.STRING, allowNull: false },
      fileUrl: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('department_samples', ['departmentId']);
    await queryInterface.addIndex('department_samples', ['status']);
    await queryInterface.addIndex('department_sample_documents', ['sampleId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('department_sample_documents');
    await queryInterface.dropTable('department_samples');
  },
};
