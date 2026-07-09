const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class ProcurementLead extends Model {}

ProcurementLead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: 'Company name is required' } },
    },
    contactPerson: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: 'Contact person is required' } },
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: { notEmpty: { msg: 'Phone is required' } },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: { msg: 'Must be a valid email address' } },
      set(value) {
        if (value) this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'e.g. Education, Government, Healthcare, NGO, Private',
    },
    stage: {
      type: DataTypes.ENUM('prospect', 'contacted', 'negotiating', 'won', 'lost'),
      allowNull: false,
      defaultValue: 'prospect',
    },
    estimatedValue: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true,
      comment: 'Estimated contract value in RWF',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nextFollowUp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ProcurementLead',
    tableName: 'procurement_leads',
    timestamps: true,
  }
);

module.exports = ProcurementLead;
