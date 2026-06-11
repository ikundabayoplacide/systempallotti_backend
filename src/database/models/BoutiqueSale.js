const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class BoutiqueSale extends Model {}

BoutiqueSale.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    soldById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'Quantity must be at least 1' } },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Price per unit at time of sale',
    },
    amountPaid: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: { args: [0], msg: 'Amount paid cannot be negative' } },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'quantity × unitPrice at time of sale',
    },
    balanceDue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount customer still owes',
    },
    changeGiven: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount to give back to customer',
    },
    paymentStatus: {
      type: DataTypes.ENUM('paid', 'partial', 'overpaid'),
      allowNull: false,
      defaultValue: 'paid',
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'mobile', 'card', 'bank'),
      allowNull: false,
      defaultValue: 'cash',
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BoutiqueSale',
    tableName: 'boutique_sales',
    timestamps: true,
  }
);

module.exports = BoutiqueSale;
