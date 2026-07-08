const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

class Proforma extends Model {
  static async generateProformaNo() {
    const year = new Date().getFullYear();
    const last = await Proforma.findOne({
      where: { proformaNo: { [Op.like]: `PF-${year}-%` } },
      order: [['createdAt', 'DESC']],
    });

    let nextNumber = 1;
    if (last) {
      const parts = last.proformaNo.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) nextNumber = lastSeq + 1;
    }

    return `PF-${year}-${String(nextNumber).padStart(3, '0')}`;
  }
}

Proforma.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    proformaNo: { type: DataTypes.STRING, allowNull: false, unique: true },
    // Optional link to a job
    jobId: { type: DataTypes.UUID, allowNull: true },
    customerId: { type: DataTypes.UUID, allowNull: true },
    // Standalone info fields
    jobNumber: { type: DataTypes.STRING, allowNull: true },
    jobName: { type: DataTypes.STRING, allowNull: true },
    clientName: { type: DataTypes.STRING, allowNull: true },
    clientPhone: { type: DataTypes.STRING, allowNull: true },
    jobCreatedAt: { type: DataTypes.DATE, allowNull: true },
    // Financials
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    taxRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 18 },
    taxAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired'),
      defaultValue: 'draft',
      allowNull: false,
    },
    validUntil: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    terms: { type: DataTypes.TEXT, allowNull: true },
    createdById: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Proforma',
    tableName: 'proformas',
    timestamps: true,
  }
);

module.exports = Proforma;
