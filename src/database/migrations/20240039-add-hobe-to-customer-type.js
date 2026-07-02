'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('customers', 'type', {
      type: Sequelize.ENUM('BUSINESS', 'VISITOR', 'BOUTIQUE', 'HOBE'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('customers', 'type', {
      type: Sequelize.ENUM('BUSINESS', 'VISITOR', 'BOUTIQUE'),
      allowNull: true,
    });
  },
};
