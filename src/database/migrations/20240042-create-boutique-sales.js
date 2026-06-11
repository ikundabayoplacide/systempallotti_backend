'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('boutique_sales', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'boutique_products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      soldById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Price per unit at time of sale',
      },
      amountPaid: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      note: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addIndex('boutique_sales', ['productId']);
    await queryInterface.addIndex('boutique_sales', ['soldById']);
    await queryInterface.addIndex('boutique_sales', ['customerId']);
    await queryInterface.addIndex('boutique_sales', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('boutique_sales');
  },
};
