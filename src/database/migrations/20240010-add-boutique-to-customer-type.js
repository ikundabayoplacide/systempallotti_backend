'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Add BOUTIQUE to the existing enum type for customers.type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_customers_type" ADD VALUE IF NOT EXISTS 'BOUTIQUE';
    `);
  },

  async down(queryInterface) {
    // PostgreSQL does not support removing enum values directly.
    // To rollback, recreate the enum without BOUTIQUE and update the column.
    await queryInterface.sequelize.query(`
      ALTER TABLE customers ALTER COLUMN type TYPE VARCHAR(50);
    `);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_customers_type";`);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_customers_type" AS ENUM ('BUSINESS', 'VISITOR');
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE customers ALTER COLUMN type TYPE "enum_customers_type" USING type::"enum_customers_type";
    `);
  },
};
