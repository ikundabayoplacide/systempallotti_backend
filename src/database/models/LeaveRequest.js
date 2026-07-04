const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class LeaveRequest extends Model {}

LeaveRequest.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    type: {
      type: DataTypes.ENUM('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'EMERGENCY', 'UNPAID', 'OTHER'),
      allowNull: false,
    },
    startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
    startTime: { type: DataTypes.STRING(5), allowNull: true, field: 'start_time' },
    endDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'end_date' },
    endTime: { type: DataTypes.STRING(5), allowNull: true, field: 'end_time' },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'DONE'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true, field: 'rejection_reason' },
    documentUrl: { type: DataTypes.TEXT, allowNull: true, field: 'document_url' },
    reviewedById: { type: DataTypes.UUID, allowNull: true, field: 'reviewed_by_id' },
    reviewedAt: { type: DataTypes.DATE, allowNull: true, field: 'reviewed_at' },
  },
  {
    sequelize,
    modelName: 'LeaveRequest',
    tableName: 'leave_requests',
    timestamps: true,
    underscored: true,
  }
);

module.exports = LeaveRequest;
