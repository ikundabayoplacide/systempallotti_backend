'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'rejectReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'notes',
    });

    await queryInterface.changeColumn('jobs', 'status', {
      type: Sequelize.ENUM(
        'pending', 'confirmed', 'rejected',
        'in-composition', 'in-montage', 'in-printing', 'in-binding', 'in-packaging',
        'quality-check', 'ready-for-delivery', 'delivered', 'completed'
      ),
      defaultValue: 'pending',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'rejectReason');
    await queryInterface.changeColumn('jobs', 'status', {
      type: Sequelize.ENUM(
        'pending', 'confirmed',
        'in-composition', 'in-montage', 'in-printing', 'in-binding', 'in-packaging',
        'quality-check', 'ready-for-delivery', 'delivered', 'completed'
      ),
      defaultValue: 'pending',
      allowNull: false,
    });
  },
};
