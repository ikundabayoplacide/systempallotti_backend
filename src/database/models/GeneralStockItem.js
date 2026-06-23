const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class GeneralStockItem extends Model {
  get stockStatus() {
    if (this.currentStock === 0) return 'out-of-stock';
    if (this.currentStock <= this.alarmStock) return 'low-stock';
    return 'in-stock';
  }
}

GeneralStockItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    itemName: { type: DataTypes.STRING(255), allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: true },
    unit: { type: DataTypes.STRING(50), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    supplier: { type: DataTypes.STRING(255), allowNull: true },
    unitCost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    currentStock: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    alarmStock: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 5 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
  },
  { sequelize, modelName: 'GeneralStockItem', tableName: 'general_stock_items', timestamps: true }
);

module.exports = GeneralStockItem;
