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
      get() {
        const val = this.getDataValue('items');
        if (!val) return [];
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return []; }
        }
        return Array.isArray(val) ? val : [];
      },
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
      get() {
        let val = this.getDataValue('visibleTo');
        if (!val) return null;
        // parse until we get an actual array (handles double-encoded strings)
        while (typeof val === 'string') {
          try { val = JSON.parse(val); } catch { return null; }
        }
        return Array.isArray(val) ? val : null;
      },
    },
    supervisorId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      field: 'supervisor_id',
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
