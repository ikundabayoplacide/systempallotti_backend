'use strict';

module.exports = {
  async up(queryInterface) {
    // Migrate any existing ready-for-delivery jobs to confirmed
    await queryInterface.sequelize.query(
      "UPDATE jobs SET status = 'confirmed' WHERE status = 'ready-for-delivery';"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE jobs MODIFY COLUMN status ENUM('pending','confirmed','rejected','partial-delivered','delivered','completed','verified') NOT NULL DEFAULT 'pending';"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE jobs MODIFY COLUMN status ENUM('pending','confirmed','rejected','ready-for-delivery','partial-delivered','delivered','completed','verified') NOT NULL DEFAULT 'pending';"
    );
  },
};
