const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class FundConfig extends Model {
  static async getInitialAmount() {
    const config = await FundConfig.findOne({ where: { id: 1 } });
    return config ? parseFloat(config.initialAmount) : 0;
  }

  static async setInitialAmount(amount, updatedById) {
    await FundConfig.upsert({ id: 1, initialAmount: amount, updatedById });
  }
}

FundConfig.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    initialAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    totalBalance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    updatedById: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    modelName: 'FundConfig',
    tableName: 'fund_config',
    timestamps: true,
  }
);

module.exports = FundConfig;
