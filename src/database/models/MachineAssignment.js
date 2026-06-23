const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class MachineAssignment extends Model {}

MachineAssignment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    machineId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'machine_id',
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'employee_id',
    },
    assignedById: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'assigned_by_id',
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'assigned_at',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'MachineAssignment',
    tableName: 'machine_assignments',
    timestamps: true,
    indexes: [{ unique: true, fields: ['machine_id', 'employee_id'] }],
  }
);

module.exports = MachineAssignment;
