'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'verifiedStatus', {
      type: Sequelize.ENUM('unverified', 'verified', 'verification-rejected'),
      allowNull: false,
      defaultValue: 'unverified',
    });
    await queryInterface.addColumn('jobs', 'verifiedById', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('jobs', 'verifiedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('jobs', 'verificationNote', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('jobs', 'verifiedStatus');
    await queryInterface.removeColumn('jobs', 'verifiedById');
    await queryInterface.removeColumn('jobs', 'verifiedAt');
    await queryInterface.removeColumn('jobs', 'verificationNote');
  },
};
