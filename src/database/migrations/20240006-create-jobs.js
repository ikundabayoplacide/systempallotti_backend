'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      jobNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Job type: flyer, brochure, banner, business-card, etc.
      jobType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Quantity to print
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      // Paper/material size (e.g. A4, A3, custom)
      size: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Color mode: full-color, black-white
      colorMode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Binding type: none, spiral, perfect, saddle-stitch
      bindingType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'confirmed',
          'in-composition',
          'in-montage',
          'in-printing',
          'in-binding',
          'in-packaging',
          'quality-check',
          'ready-for-delivery',
          'delivered',
          'completed'
        ),
        defaultValue: 'pending',
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal',
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'paid'),
        defaultValue: 'unpaid',
        allowNull: false,
      },
      receiptNo: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      paymentMethod: {
        type: Sequelize.ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'),
        allowNull: true,
      },
      paymentNote: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // The department this job is assigned to
      departmentAssignedToId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'departments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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

    await queryInterface.addIndex('jobs', ['jobNumber'], { unique: true });
    await queryInterface.addIndex('jobs', ['status']);
    await queryInterface.addIndex('jobs', ['customerId']);
    await queryInterface.addIndex('jobs', ['createdById']);
    await queryInterface.addIndex('jobs', ['dueDate']);
    await queryInterface.addIndex('jobs', ['departmentAssignedToId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('jobs');
  },
};
