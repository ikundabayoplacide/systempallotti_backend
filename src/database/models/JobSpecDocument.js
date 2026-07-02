const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class JobSpecDocument extends Model {}

JobSpecDocument.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    jobSpecId: { type: DataTypes.UUID, allowNull: false },
    uploadedById: { type: DataTypes.UUID, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    fileUrl: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: 'JobSpecDocument',
    tableName: 'job_spec_documents',
    timestamps: true,
  }
);

module.exports = JobSpecDocument;
