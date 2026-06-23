'use strict';

module.exports = {
  async up(queryInterface) {
    // Postgres requires adding ENUM values one at a time
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_stock_items_type" ADD VALUE IF NOT EXISTS 'general';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_stock_items_type" ADD VALUE IF NOT EXISTS 'binding';
    `);
  },

  async down() {
    // Postgres does not support removing ENUM values; manual rollback required
  },
};
