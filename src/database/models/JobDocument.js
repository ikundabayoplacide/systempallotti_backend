const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class JobDocument extends Model {}

JobDocument.init(
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
    uploadedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'Base64 encoded file content with data URI prefix',
    },
  },
  {
    sequelize,
    modelName: 'JobDocument',
    tableName: 'job_documents',
    timestamps: true,
  }
);

module.exports = JobDocument;
