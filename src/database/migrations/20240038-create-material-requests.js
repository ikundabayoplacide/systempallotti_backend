'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('material_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      requestNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'request_number',
      },
      jobId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'job_id',
        references: { model: 'jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      employeeId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'employee_id',
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      responseNotes: { type: Sequelize.TEXT, allowNull: true, field: 'response_notes' },
      respondedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'responded_by',
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      respondedAt: { type: Sequelize.DATE, allowNull: true, field: 'responded_at' },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' },
    });

    await queryInterface.createTable('material_request_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      materialRequestId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'material_request_id',
        references: { model: 'material_requests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      unit: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('material_request_items');
    await queryInterface.dropTable('material_requests');
  },
};
