'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('withdrawals', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      ref: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      withdrawnAt: { type: Sequelize.DATEONLY, allowNull: false },
      takenByName: { type: Sequelize.STRING(255), allowNull: false },
      takenByContact: { type: Sequelize.STRING(50), allowNull: true },
      source: { type: Sequelize.STRING(255), allowNull: true, comment: 'e.g. Bank name, cash box, etc.' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      recordedById: { type: Sequelize.UUID, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('withdrawals', ['withdrawnAt']);
    await queryInterface.addIndex('withdrawals', ['recordedById']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('withdrawals');
  },
};
