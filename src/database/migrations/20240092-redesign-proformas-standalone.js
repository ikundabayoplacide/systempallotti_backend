'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make jobId and customerId nullable on proformas
    await queryInterface.changeColumn('proformas', 'jobId', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn('proformas', 'customerId', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Add standalone fields to proformas
    await queryInterface.addColumn('proformas', 'jobNumber', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('proformas', 'jobName', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('proformas', 'clientName', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('proformas', 'clientPhone', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('proformas', 'jobCreatedAt', { type: Sequelize.DATE, allowNull: true });

    // Create proforma_items table
    await queryInterface.createTable('proforma_items', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      proformaId: { type: Sequelize.UUID, allowNull: false, references: { model: 'proformas', key: 'id' }, onDelete: 'CASCADE' },
      description: { type: Sequelize.STRING, allowNull: false },
      qty: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
      unitPrice: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      totalPrice: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('proforma_items');
    await queryInterface.removeColumn('proformas', 'jobNumber');
    await queryInterface.removeColumn('proformas', 'jobName');
    await queryInterface.removeColumn('proformas', 'clientName');
    await queryInterface.removeColumn('proformas', 'clientPhone');
    await queryInterface.removeColumn('proformas', 'jobCreatedAt');
    await queryInterface.changeColumn('proformas', 'jobId', { type: Sequelize.UUID, allowNull: false });
    await queryInterface.changeColumn('proformas', 'customerId', { type: Sequelize.UUID, allowNull: false });
  },
};
