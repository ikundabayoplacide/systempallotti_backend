'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type"
        ADD VALUE IF NOT EXISTS 'EMPLOYEE_CREATED';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type"
        ADD VALUE IF NOT EXISTS 'JOB_DAF_ACTION';
    `);
  },

  async down() {
    // Postgres does not support removing ENUM values; manual rollback required
  },
};
