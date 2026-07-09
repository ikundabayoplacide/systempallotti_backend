'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sheet_sales', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      sheet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'sheets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sold_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      total_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      amount_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance_due: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      change_given: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      payment_status: { type: Sequelize.ENUM('paid', 'partial', 'overpaid'), allowNull: false, defaultValue: 'paid' },
      payment_method: { type: Sequelize.ENUM('cash', 'mobile', 'card', 'bank'), allowNull: false, defaultValue: 'cash' },
      note: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sheet_sales');
  },
};
