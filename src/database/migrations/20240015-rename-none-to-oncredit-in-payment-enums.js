'use strict';

module.exports = {
  async up(queryInterface) {
    // Step 1: expand ENUMs to include both NONE and ONCREDIT
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentMethod ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'NONE', 'ONCREDIT');"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentState ENUM('FULL', 'PARTIAL', 'NONE', 'ONCREDIT');"
    );

    // Step 2: migrate existing NONE data to ONCREDIT
    await queryInterface.sequelize.query(
      "UPDATE payments SET paymentMethod = 'ONCREDIT' WHERE paymentMethod = 'NONE';"
    );
    await queryInterface.sequelize.query(
      "UPDATE payments SET paymentState = 'ONCREDIT' WHERE paymentState = 'NONE';"
    );

    // Step 3: remove NONE from ENUMs
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentMethod ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'ONCREDIT');"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentState ENUM('FULL', 'PARTIAL', 'ONCREDIT');"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE jobs MODIFY COLUMN paymentStatus ENUM('unpaid', 'oncredit', 'partial', 'paid') NOT NULL DEFAULT 'unpaid';"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentMethod ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'NONE');"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentState ENUM('FULL', 'PARTIAL', 'NONE');"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE jobs MODIFY COLUMN paymentStatus ENUM('unpaid', 'partial', 'paid') NOT NULL DEFAULT 'unpaid';"
    );
  },
};
