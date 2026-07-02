const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class DepartmentSample extends Model {
  static async generateRefNo() {
    const last = await DepartmentSample.findOne({ order: [['createdAt', 'DESC']] });
    if (!last || !last.referenceNo) return 'SMP-001';
    const num = parseInt(last.referenceNo.split('-')[1] || '0', 10) + 1;
    return `SMP-${String(num).padStart(3, '0')}`;
  }
}

DepartmentSample.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    departmentId: { type: DataTypes.UUID, allowNull: false },
    createdById: { type: DataTypes.UUID, allowNull: false },

    name: { type: DataTypes.STRING(255), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    unit: { type: DataTypes.STRING(50), allowNull: true, comment: 'e.g. pcs, sheets, copies' },
    sampleDate: { type: DataTypes.DATEONLY, allowNull: true },
    referenceNo: { type: DataTypes.STRING(100), allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    reviewedById: { type: DataTypes.UUID, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
    reviewNote: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'DepartmentSample',
    tableName: 'department_samples',
    timestamps: true,
  }
);

module.exports = DepartmentSample;
