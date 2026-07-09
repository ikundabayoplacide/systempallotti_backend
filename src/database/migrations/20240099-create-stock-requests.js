'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_requests', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      request_number: { type: Sequelize.STRING, allowNull: false, unique: true },
      requested_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      response_notes: { type: Sequelize.TEXT, allowNull: true },
      responded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      responded_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('stock_request_items', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      stock_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'stock_requests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      item_name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      quantity: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      unit: { type: Sequelize.STRING, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      total_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stock_request_items');
    await queryInterface.dropTable('stock_requests');
  },
};
