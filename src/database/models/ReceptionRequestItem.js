const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class ReceptionRequestItem extends Model {}

ReceptionRequestItem.init(
  {
    id:                 { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    receptionRequestId: { type: DataTypes.UUID, allowNull: false, field: 'reception_request_id' },
    itemName:           { type: DataTypes.STRING, allowNull: false, field: 'item_name' },
    description:        { type: DataTypes.TEXT, allowNull: true },
    quantity:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    unit:               { type: DataTypes.STRING, allowNull: false },
    unitPrice:          { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'unit_price' },
    totalAmount:        { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'total_amount' },
  },
  {
    sequelize,
    modelName: 'ReceptionRequestItem',
    tableName: 'reception_request_items',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ReceptionRequestItem;
