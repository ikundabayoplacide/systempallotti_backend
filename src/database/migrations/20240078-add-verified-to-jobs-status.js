'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('jobs', 'status', {
      type: Sequelize.ENUM(
        'pending', 'confirmed', 'rejected',
        'in-composition', 'in-montage', 'in-printing', 'in-binding', 'in-packaging',
        'quality-check', 'ready-for-delivery', 'partial-delivered', 'delivered', 'completed', 'verified'
      ),
      defaultValue: 'pending',
      allowNull: false,
    });

    await queryInterface.removeColumn('jobs', 'verifiedStatus').catch(() => {});
    await queryInterface.removeColumn('jobs', 'verifiedById').catch(() => {});
    await queryInterface.removeColumn('jobs', 'verifiedAt').catch(() => {});
    await queryInterface.removeColumn('jobs', 'verificationNote').catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('jobs', 'status', {
      type: Sequelize.ENUM(
        'pending', 'confirmed', 'rejected',
        'in-composition', 'in-montage', 'in-printing', 'in-binding', 'in-packaging',
        'quality-check', 'ready-for-delivery', 'partial-delivered', 'delivered', 'completed'
      ),
      defaultValue: 'pending',
      allowNull: false,
    });
  },
};
