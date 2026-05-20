'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('payments', 'receivedById', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.changeColumn('payments', 'receiptNo', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn('payments', 'amountPaid', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('payments', 'balance', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

    // For ENUM columns, we need to use raw SQL to allow null
    await queryInterface.sequelize.query(`
      ALTER TABLE payments ALTER COLUMN "paymentMethod" DROP NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE payments ALTER COLUMN "paymentState" DROP NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('payments', 'receivedById', {
      type: Sequelize.UUID,
      allowNull: false,
    });

    await queryInterface.changeColumn('payments', 'receiptNo', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE payments ALTER COLUMN "paymentMethod" SET NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE payments ALTER COLUMN "paymentState" SET NOT NULL;
    `);
  },
};
