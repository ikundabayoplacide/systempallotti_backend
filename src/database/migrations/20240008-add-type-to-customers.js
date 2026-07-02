'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'type', {
      type: Sequelize.ENUM('BUSINESS', 'VISITOR'),
      defaultValue: 'VISITOR',
      allowNull: false,
    });

    await queryInterface.addIndex('customers', ['type']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('customers', 'type');
  },
};
