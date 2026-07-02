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
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachmentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'attachment_url',
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by_id',
    },
    visibleTo: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'visible_to',
      defaultValue: null,
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
