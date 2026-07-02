'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameTable('quotations', 'proformas');
    await queryInterface.renameColumn('proformas', 'quotationNo', 'proformaNo');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('proformas', 'proformaNo', 'quotationNo');
    await queryInterface.renameTable('proformas', 'quotations');
  },
};
