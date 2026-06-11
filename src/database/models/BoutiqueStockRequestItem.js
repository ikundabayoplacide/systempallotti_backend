const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class BoutiqueStockRequestItem extends Model {}

BoutiqueStockRequestItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    boutiqueStockRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'boutique_stock_request_id',
    },
    productId: { type: DataTypes.UUID, allowNull: false, field: 'product_id' },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'BoutiqueStockRequestItem',
    tableName: 'boutique_stock_request_items',
    timestamps: true,
    underscored: true,
  }
);

module.exports = BoutiqueStockRequestItem;
