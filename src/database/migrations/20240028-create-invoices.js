'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      invoiceNo: { type: Sequelize.STRING, allowNull: false, unique: true },
      jobId: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'jobs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      customerId: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'customers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      createdById: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      lineItems: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discountType: { type: Sequelize.ENUM('FIXED', 'PERCENTAGE'), allowNull: true, defaultValue: null },
      discountValue: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discountAmount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      taxRate: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      taxAmount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      totalAmount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.ENUM('draft', 'issued', 'paid', 'cancelled'), allowNull: false, defaultValue: 'draft' },
      issuedAt: { type: Sequelize.DATE, allowNull: true },
      dueDate: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      terms: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('invoices', ['jobId']);
    await queryInterface.addIndex('invoices', ['customerId']);
    await queryInterface.addIndex('invoices', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('invoices');
  },
};
