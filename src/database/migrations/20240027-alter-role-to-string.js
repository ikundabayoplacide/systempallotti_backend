'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
    `);

    // 2. Change users.role from ENUM to VARCHAR
    await queryInterface.sequelize.query(`
      ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::VARCHAR(50);
    `);

    // 3. Re-add the default as a plain string
    await queryInterface.sequelize.query(`
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'WORKER';
    `);

    // 4. Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_role";
    `);

    // 5. Change role_permissions.role from ENUM to VARCHAR
    await queryInterface.sequelize.query(`
      ALTER TABLE role_permissions ALTER COLUMN role TYPE VARCHAR(50) USING role::VARCHAR(50);
    `);

    // 6. Drop the role_permissions ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_role_permissions_role";
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM (
        'ADMIN','RECEPTIONIST','SALES','DAF','ACCOUNTANT',
        'PRODUCTION_MANAGER','STOCK','SUPERVISOR','WORKER'
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE users ALTER COLUMN role TYPE "enum_users_role"
      USING role::"enum_users_role";
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'WORKER'::"enum_users_role";
    `);

    // Revert role_permissions.role back to ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_role_permissions_role" AS ENUM (
        'ADMIN','RECEPTIONIST','SALES','DAF','ACCOUNTANT',
        'PRODUCTION_MANAGER','STOCK','SUPERVISOR','WORKER'
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE role_permissions ALTER COLUMN role TYPE "enum_role_permissions_role"
      USING role::"enum_role_permissions_role";
    `);
  },
};
