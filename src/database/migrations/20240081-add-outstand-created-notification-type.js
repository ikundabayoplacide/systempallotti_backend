'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type"
        ADD VALUE IF NOT EXISTS 'OUTSTAND_CREATED';
    `);
  },
  async down() {},
};
