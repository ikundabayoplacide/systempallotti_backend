'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('extra_workers', 'status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    });
    await queryInterface.addColumn('extra_workers', 'approvalComment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('extra_workers', 'approvedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('extra_workers', 'status');
    await queryInterface.removeColumn('extra_workers', 'approvalComment');
    await queryInterface.removeColumn('extra_workers', 'approvedBy');
  },
};
