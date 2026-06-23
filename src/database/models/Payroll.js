const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Payroll extends Model {}

Payroll.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    casualWorkerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    workerType: {
      type: DataTypes.ENUM('employee', 'casual'),
      allowNull: false,
    },
    period: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    overtime: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    deductions: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    netSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'approved', 'paid'),
      allowNull: false,
      defaultValue: 'draft',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Payroll',
    tableName: 'payrolls',
    timestamps: true,
  }
);

module.exports = Payroll;
