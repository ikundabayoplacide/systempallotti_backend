const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Report extends Model {}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'attachment_url',
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by_id',
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Report;
