'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename table
    await queryInterface.renameTable('quotations', 'proformas');

    // Rename column quotationNo -> proformaNo
    await queryInterface.renameColumn('proformas', 'quotationNo', 'proformaNo');

    // Rename the ENUM type for status
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_quotations_status" RENAME TO "enum_proformas_status";'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_proformas_status" RENAME TO "enum_quotations_status";'
    );
    await queryInterface.renameColumn('proformas', 'proformaNo', 'quotationNo');
    await queryInterface.renameTable('proformas', 'quotations');
  },
};
