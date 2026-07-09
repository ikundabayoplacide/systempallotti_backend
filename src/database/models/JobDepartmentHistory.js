const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class JobDepartmentHistory extends Model {}

JobDepartmentHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'JobDepartmentHistory',
    tableName: 'job_department_history',
    timestamps: true,
  }
);

module.exports = JobDepartmentHistory;
