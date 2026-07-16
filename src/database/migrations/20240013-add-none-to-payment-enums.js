'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentMethod ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'NONE');"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentState ENUM('FULL', 'PARTIAL', 'NONE');"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentMethod ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD');"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN paymentState ENUM('FULL', 'PARTIAL');"
    );
  },
};
