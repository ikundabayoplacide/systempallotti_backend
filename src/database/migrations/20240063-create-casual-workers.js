'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('casual_workers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      jobDone: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      workDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      daysWorked: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
      },
      dailyRate: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('casual_workers', ['workDate']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('casual_workers');
  },
};
