'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recovery_records', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      jobId: { type: Sequelize.UUID, allowNull: false, field: 'job_id' },
      customerId: { type: Sequelize.UUID, allowNull: false, field: 'customer_id' },
      recordedById: { type: Sequelize.UUID, allowNull: false, field: 'recorded_by_id' },
      amountRecovered: { type: Sequelize.DECIMAL(12, 2), allowNull: false, field: 'amount_recovered' },
      balanceAfter: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'balance_after' },
      paymentMethod: { type: Sequelize.ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'), allowNull: true, field: 'payment_method' },
      status: { type: Sequelize.ENUM('pending', 'recovered', 'partial', 'written_off'), allowNull: false, defaultValue: 'pending' },
      note: { type: Sequelize.TEXT, allowNull: true },
      contactedAt: { type: Sequelize.DATE, allowNull: true, field: 'contacted_at' },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('recovery_records');
  },
};
