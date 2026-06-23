const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class CasualWorker extends Model {}

CasualWorker.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: 'Full name is required' } },
    },
    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    jobDone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: 'Job done is required' } },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    daysWorked: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    dailyRate: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'CasualWorker',
    tableName: 'casual_workers',
    timestamps: true,
  }
);

module.exports = CasualWorker;
