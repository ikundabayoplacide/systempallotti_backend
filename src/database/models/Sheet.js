const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Sheet extends Model {}

Sheet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Sheet name is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Quantity cannot be negative' },
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Unit price cannot be negative' },
        notNull: { msg: 'Unit price is required' },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Sheet',
    tableName: 'sheets',
    timestamps: true,
    hooks: {
      beforeSave(sheet) {
        sheet.totalAmount = sheet.qty * sheet.unitPrice;
      },
    },
  }
);

module.exports = Sheet;
