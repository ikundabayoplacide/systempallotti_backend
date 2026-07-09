const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class StockRequestItem extends Model {}

StockRequestItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    stockRequestId: { type: DataTypes.UUID, allowNull: false, field: 'stock_request_id' },
    itemName: { type: DataTypes.STRING, allowNull: false, field: 'item_name' },
    description: { type: DataTypes.TEXT, allowNull: true },
    quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price' },
    totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'total_amount' },
  },
  { sequelize, modelName: 'StockRequestItem', tableName: 'stock_request_items', timestamps: true, underscored: true }
);

module.exports = StockRequestItem;
