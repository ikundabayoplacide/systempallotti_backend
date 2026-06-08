'use strict';

module.exports = {
  async up(queryInterface) {
    // PostgreSQL requires each ADD VALUE in a separate statement
    const doneValues = [
      'composition-done',
      'montage-done',
      'printing-done',
      'binding-done',
      'packaging-done',
      'qualitycheck-done',
    ];

    for (const value of doneValues) {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_jobs_state" ADD VALUE IF NOT EXISTS '${value}';`
      );
    }
  },

  async down(_queryInterface) {
    // To roll back you would need to recreate the type — skip for safety.
    console.warn('Down migration: removing enum values from enum_jobs_state is not supported by PostgreSQL. Skipping.');
  },
};
