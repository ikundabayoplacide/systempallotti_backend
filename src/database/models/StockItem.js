const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class StockItem extends Model {
  get stockStatus() {
    if (this.currentStock === 0) return 'out-of-stock';
    if (this.currentStock <= this.alarmStock) return 'low-stock';
    return 'in-stock';
  }
}

StockItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Item name is required' },
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'e.g. Paper, Ink, Binding Materials, Packaging',
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g. reams, liters, rolls, pcs',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    supplier: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unitCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Cost per unit in RWF',
    },
    currentStock: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Current quantity on hand (auto-updated on entries/sorties)',
    },
    alarmStock: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 5,
      comment: 'Threshold that triggers low-stock alarm',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('boutique', 'general', 'binding'),
      allowNull: false,
      defaultValue: 'general',
      comment: 'boutique = receptionist stock | general = hobe/general use | binding = binding dept',
    },
  },
  {
    sequelize,
    modelName: 'StockItem',
    tableName: 'stock_items',
    timestamps: true,
  }
);

module.exports = StockItem;
