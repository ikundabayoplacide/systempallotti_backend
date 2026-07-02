'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'WORKER',
    });

    await queryInterface.changeColumn('role_permissions', 'role', {
      type: Sequelize.STRING(50),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'WORKER',
    });
  },
};
