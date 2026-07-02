'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'state', {
      type: Sequelize.ENUM(
        'in-composition',
        'in-montage',
        'in-printing',
        'in-binding',
        'in-packaging',
        'quality-check'
      ),
      allowNull: true,
      defaultValue: null,
      after: 'rejectReason',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('jobs', 'state');
  },
};
