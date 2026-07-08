const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class ProformaItem extends Model {}

ProformaItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    proformaId: { type: DataTypes.UUID, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    qty: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
    unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    totalPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'ProformaItem',
    tableName: 'proforma_items',
    timestamps: true,
  }
);

module.exports = ProformaItem;
