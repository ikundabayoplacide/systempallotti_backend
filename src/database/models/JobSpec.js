const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class JobSpec extends Model {}

JobSpec.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    jobId: { type: DataTypes.UUID, allowNull: false },
    addedById: { type: DataTypes.UUID, allowNull: false },

    // Core spec fields
    description: { type: DataTypes.TEXT, allowNull: true },
    paperType: { type: DataTypes.STRING(100), allowNull: true },
    paperWeight: { type: DataTypes.STRING(50), allowNull: true, comment: 'e.g. 80gsm, 120gsm' },
    size: { type: DataTypes.STRING(50), allowNull: true, comment: 'e.g. A4, A3, 21x29.7cm' },
    colors: { type: DataTypes.STRING(50), allowNull: true, comment: 'e.g. 4/4, 1/0, CMYK' },
    finishType: { type: DataTypes.STRING(100), allowNull: true, comment: 'e.g. matte lamination, UV varnish' },
    quantity: { type: DataTypes.INTEGER, allowNull: true },
    materials: { type: DataTypes.TEXT, allowNull: true, comment: 'Free-text list of materials needed' },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'JobSpec',
    tableName: 'job_specs',
    timestamps: true,
  }
);

module.exports = JobSpec;
