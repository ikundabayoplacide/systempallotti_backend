'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Boutique Stock Items
    await queryInterface.createTable('boutique_stock_items', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      itemName: { type: Sequelize.STRING(255), allowNull: false },
      category: { type: Sequelize.STRING(100), allowNull: true },
      unit: { type: Sequelize.STRING(50), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      supplier: { type: Sequelize.STRING(255), allowNull: true },
      unitCost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      currentStock: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      alarmStock: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 5 },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Boutique Stock Entries (IN)
    await queryInterface.createTable('boutique_stock_entries', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      stockItemId: { type: Sequelize.UUID, allowNull: false, references: { model: 'boutique_stock_items', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      receivedById: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      quantityIn: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      unitCost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      totalCost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      supplier: { type: Sequelize.STRING(255), allowNull: true },
      referenceNo: { type: Sequelize.STRING(100), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      entryDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      stockBefore: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      stockAfter: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Boutique Stock Sorties (OUT)
    await queryInterface.createTable('boutique_stock_sorties', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      stockItemId: { type: Sequelize.UUID, allowNull: false, references: { model: 'boutique_stock_items', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      requesterId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      approvedById: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      quantityOut: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      reason: { type: Sequelize.STRING(255), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending', allowNull: false },
      sortieDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      stockBefore: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      stockAfter: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('boutique_stock_items', ['isActive']);
    await queryInterface.addIndex('boutique_stock_entries', ['stockItemId']);
    await queryInterface.addIndex('boutique_stock_sorties', ['stockItemId']);
    await queryInterface.addIndex('boutique_stock_sorties', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('boutique_stock_sorties');
    await queryInterface.dropTable('boutique_stock_entries');
    await queryInterface.dropTable('boutique_stock_items');
  },
};
