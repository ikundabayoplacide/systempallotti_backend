const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

class Payment extends Model {
  /**
   * Auto-generate the next receipt number in format RCP-YYYY-NNN
   */
  static async generateReceiptNo() {
    const year = new Date().getFullYear();
    const rows = await Payment.findAll({
      where: { receiptNo: { [Op.like]: `RCP-${year}-%` } },
      attributes: ['receiptNo'],
    });

    let maxSeq = 0;
    for (const row of rows) {
      const parts = row.receiptNo.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }

    return `RCP-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
  }
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recordedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receivedById: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Receptionist who accepted the payment',
    },
    verifiedById: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Accountant who verified/approved the payment',
    },
    receiptNo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    amountPaid: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Amount paid cannot be negative' },
      },
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Remaining balance after this payment',
    },
    paymentMethod: {
      type: DataTypes.ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'ONCREDIT'),
      allowNull: true,
    },
    paymentState: {
      type: DataTypes.ENUM('FULL', 'PARTIAL', 'ONCREDIT'),
      allowNull: true,
    },
    paymentNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
  }
);

module.exports = Payment;
