'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('fund_config', 'totalBalance', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'initialAmount',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('fund_config', 'totalBalance');
  },
};
