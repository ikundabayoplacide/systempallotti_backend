'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('jobs', 'state', {
      type: Sequelize.ENUM(
        'in-composition', 'in-montage', 'in-printing', 'in-binding', 'in-packaging', 'quality-check',
        'composition-done', 'montage-done', 'printing-done', 'binding-done', 'packaging-done', 'qualitycheck-done'
      ),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('jobs', 'state', {
      type: Sequelize.ENUM(
        'in-composition', 'in-montage', 'in-printing', 'in-binding', 'in-packaging', 'quality-check'
      ),
      allowNull: true,
      defaultValue: null,
    });
  },
};
