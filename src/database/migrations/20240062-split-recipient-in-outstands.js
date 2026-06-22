'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('outstands', 'recipient', 'recipientName');
    await queryInterface.addColumn('outstands', 'recipientPhone', {
      type: Sequelize.STRING(30),
      allowNull: true, // nullable so existing rows don't break
    });
    await queryInterface.addColumn('outstands', 'recipientRole', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('outstands', 'recipientPhone');
    await queryInterface.removeColumn('outstands', 'recipientRole');
    await queryInterface.renameColumn('outstands', 'recipientName', 'recipient');
  },
};
