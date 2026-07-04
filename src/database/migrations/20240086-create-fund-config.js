'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fund_config', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      initialAmount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      updatedById: { type: Sequelize.UUID, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Insert the single config row
    await queryInterface.bulkInsert('fund_config', [{
      id: 1,
      initialAmount: 0,
      updatedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fund_config');
  },
};
