const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class BoutiqueStockSortie extends Model {}

BoutiqueStockSortie.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    stockItemId: { type: DataTypes.UUID, allowNull: false },
    requesterId: { type: DataTypes.UUID, allowNull: false },
    approvedById: { type: DataTypes.UUID, allowNull: true },
    quantityOut: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    reason: { type: DataTypes.STRING(255), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending', allowNull: false },
    sortieDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    stockBefore: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    stockAfter: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  },
  { sequelize, modelName: 'BoutiqueStockSortie', tableName: 'boutique_stock_sorties', timestamps: true }
);

module.exports = BoutiqueStockSortie;
