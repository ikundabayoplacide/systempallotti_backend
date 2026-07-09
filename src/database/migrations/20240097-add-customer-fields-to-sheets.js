'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sheets', 'customerName', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'totalAmount',
    });

    await queryInterface.addColumn('sheets', 'customerPhone', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'customerName',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sheets', 'customerPhone');
    await queryInterface.removeColumn('sheets', 'customerName');
  },
};
