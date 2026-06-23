const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class BoutiqueStockEntry extends Model {}

BoutiqueStockEntry.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    stockItemId: { type: DataTypes.UUID, allowNull: false },
    receivedById: { type: DataTypes.UUID, allowNull: false },
    quantityIn: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    unitCost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    totalCost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    supplier: { type: DataTypes.STRING(255), allowNull: true },
    referenceNo: { type: DataTypes.STRING(100), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    entryDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    stockBefore: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    stockAfter: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  },
  { sequelize, modelName: 'BoutiqueStockEntry', tableName: 'boutique_stock_entries', timestamps: true }
);

module.exports = BoutiqueStockEntry;
