'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE jobs MODIFY COLUMN paymentStatus ENUM('unpaid', 'partial', 'paid') NOT NULL DEFAULT 'unpaid';"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE jobs MODIFY COLUMN paymentStatus ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid';"
    );
  },
};
