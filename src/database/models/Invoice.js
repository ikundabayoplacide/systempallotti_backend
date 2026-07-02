const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

class Invoice extends Model {
  /**
   * Auto-generate the next invoice number in format INV-YYYY-NNN
   */
  static async generateInvoiceNo() {
    const year = new Date().getFullYear();
    const last = await Invoice.findOne({
      where: { invoiceNo: { [Op.like]: `INV-${year}-%` } },
      order: [['createdAt', 'DESC']],
    });

    let nextNumber = 1;
    if (last) {
      const parts = last.invoiceNo.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) nextNumber = lastSeq + 1;
    }

    return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
  }
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Auto-generated e.g. INV-2026-001',
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
    // --- Line items snapshot (JSON array) ---
    // Each element: { name, description, quantity, unitPrice, totalPrice }
    lineItems: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Snapshot of items/services billed on this invoice',
    },
    // --- Financials ---
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Sum of all line item totals before tax and discount',
    },
    discountType: {
      type: DataTypes.ENUM('FIXED', 'PERCENTAGE'),
      allowNull: true,
      defaultValue: null,
      comment: 'Whether discount is a fixed amount or a percentage',
    },
    discountValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Discount value (amount or percentage depending on discountType)',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Computed discount in currency',
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
      comment: 'Computed: (subtotal - discountAmount) * taxRate / 100',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Final amount: subtotal - discountAmount + taxAmount',
    },
    // --- Status ---
    status: {
      type: DataTypes.ENUM('draft', 'issued', 'paid', 'cancelled'),
      defaultValue: 'paid',
      allowNull: false,
    },
    // --- Dates ---
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date the invoice was paid',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Payment due date',
    },
    // --- Extra ---
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal or client-facing notes',
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Payment terms and conditions',
    },
  },
  {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true,
  }
);

module.exports = Invoice;
