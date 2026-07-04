'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('job_items', 'customName', 'itemName');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('job_items', 'itemName', 'customName');
  },
};
