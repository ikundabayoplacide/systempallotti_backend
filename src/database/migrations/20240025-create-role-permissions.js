'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM(
          'ADMIN',
          'RECEPTIONIST',
          'SALES',
          'DAF',
          'ACCOUNTANT',
          'PRODUCTION_MANAGER',
          'STOCK',
          'SUPERVISOR',
          'WORKER'
        ),
        allowNull: false,
      },
      permissionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'permissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex('role_permissions', ['role']);
    await queryInterface.addIndex('role_permissions', ['permissionId']);
    await queryInterface.addIndex('role_permissions', ['role', 'permissionId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('role_permissions');
  },
};
