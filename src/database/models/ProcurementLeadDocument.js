const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class ProcurementLeadDocument extends Model {}

ProcurementLeadDocument.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    procurementLeadId: {
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
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Base64 encoded file with data URI prefix',
    },
  },
  {
    sequelize,
    modelName: 'ProcurementLeadDocument',
    tableName: 'procurement_lead_documents',
    timestamps: true,
  }
);

module.exports = ProcurementLeadDocument;
