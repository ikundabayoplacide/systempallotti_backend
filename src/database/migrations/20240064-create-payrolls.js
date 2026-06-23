'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payrolls', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // Either employeeId OR casualWorkerId must be set — not both
      employeeId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      casualWorkerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'casual_workers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      workerType: {
        type: Sequelize.ENUM('employee', 'casual'),
        allowNull: false,
      },
      period: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'e.g. 2025-06 for monthly, or 2025-W23 for weekly',
      },
      salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      overtime: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deductions: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      netSalary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'salary + overtime - deductions (computed server-side)',
      },
      status: {
        type: Sequelize.ENUM('draft', 'approved', 'paid'),
        allowNull: false,
        defaultValue: 'draft',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('payrolls', ['employeeId']);
    await queryInterface.addIndex('payrolls', ['casualWorkerId']);
    await queryInterface.addIndex('payrolls', ['period']);
    await queryInterface.addIndex('payrolls', ['status']);
    await queryInterface.addIndex('payrolls', ['workerType']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payrolls');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payrolls_workerType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payrolls_status";');
  },
};
