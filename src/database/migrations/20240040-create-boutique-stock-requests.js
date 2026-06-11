'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('boutique_stock_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      request_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
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

    await queryInterface.createTable('boutique_stock_request_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      boutique_stock_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'boutique_stock_requests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'boutique_products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('boutique_stock_request_items');
    await queryInterface.dropTable('boutique_stock_requests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_boutique_stock_requests_status";');
  },
};
