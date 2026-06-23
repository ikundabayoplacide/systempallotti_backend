'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type"
        ADD VALUE IF NOT EXISTS 'HOBE_CREATED';
    `);
  },

  async down() {
    // Postgres does not support removing ENUM values; manual rollback required
  },
};
