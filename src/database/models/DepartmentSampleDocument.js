const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class DepartmentSampleDocument extends Model {}

DepartmentSampleDocument.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sampleId: { type: DataTypes.UUID, allowNull: false },
    uploadedById: { type: DataTypes.UUID, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    fileUrl: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: 'DepartmentSampleDocument',
    tableName: 'department_sample_documents',
    timestamps: true,
  }
);

module.exports = DepartmentSampleDocument;
