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
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    proformaNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Auto-generated e.g. PF-2026-001',
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount before tax and discount',
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Tax percentage e.g. 18 for 18%',
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Computed: subtotal * taxRate / 100',
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Discount amount in RWF',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Computed: subtotal + taxAmount - discount',
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired'),
      defaultValue: 'draft',
      allowNull: false,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiry date of the proforma',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Terms and conditions for this proforma',
    },
  },
  {
    sequelize,
    modelName: 'Proforma',
    tableName: 'proformas',
    timestamps: true,
  }
);

module.exports = Proforma;
