const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Withdrawal extends Model {
  static async generateRef() {
    const last = await Withdrawal.findOne({ order: [['createdAt', 'DESC']] });
    if (!last) return 'WDR-001';
    const num = parseInt(last.ref.split('-')[1] || '0', 10) + 1;
    return `WDR-${String(num).padStart(3, '0')}`;
  }
}

Withdrawal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ref: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: { args: [0.01], msg: 'Amount must be greater than 0' },
      },
    },
    withdrawnAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    takenByName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    takenByContact: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'e.g. Bank name, cash box, etc.',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recordedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Withdrawal',
    tableName: 'withdrawals',
    timestamps: true,
  }
);

module.exports = Withdrawal;
