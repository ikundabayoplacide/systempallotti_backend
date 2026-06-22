const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Outstand extends Model {}

Outstand.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ref: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('purchase', 'utility', 'maintenance', 'supplier', 'other'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1,
    },
    unitCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    recipientName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    recipientPhone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    recipientRole: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'paid', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    recordedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approvedById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Outstand',
    tableName: 'outstands',
    timestamps: true,
  }
);

module.exports = Outstand;
