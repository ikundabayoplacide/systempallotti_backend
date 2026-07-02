'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('machine_assignments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      machineId: { type: Sequelize.UUID, allowNull: false, field: 'machine_id', references: { model: 'machines', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      employeeId: { type: Sequelize.UUID, allowNull: false, field: 'employee_id', references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      assignedById: { type: Sequelize.UUID, allowNull: true, field: 'assigned_by_id' },
      assignedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW, field: 'assigned_at' },
      note: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('machine_assignments', ['machine_id']);
    await queryInterface.addIndex('machine_assignments', ['employee_id']);
    await queryInterface.addIndex('machine_assignments', ['machine_id', 'employee_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('machine_assignments');
  },
};
