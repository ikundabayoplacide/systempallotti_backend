const { Op } = require('sequelize');
const Invoice = require('../database/models/Invoice');
const Job = require('../database/models/Job');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute discount amount from subtotal + discountType + discountValue.
 */
const computeDiscount = (subtotal, discountType, discountValue) => {
  if (!discountType || !discountValue) return 0;
  if (discountType === 'PERCENTAGE') {
    return parseFloat(((subtotal * discountValue) / 100).toFixed(2));
  }
  return parseFloat(discountValue);
};

/**
 * Derive all financial totals from raw inputs.
 * Returns { subtotal, discountAmount, taxAmount, totalAmount }
 */
const computeFinancials = (lineItems, discountType, discountValue, taxRate) => {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + parseFloat(item.quantity) * parseFloat(item.unitPrice);
  }, 0);

  const discountAmount = computeDiscount(subtotal, discountType, discountValue || 0);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = parseFloat(((taxableAmount * (taxRate || 0)) / 100).toFixed(2));
  const totalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount,
    taxAmount,
    totalAmount,
  };
};

// Common includes for invoice queries
const invoiceIncludes = [
  { model: Job, as: 'job', attributes: ['id', 'jobNumber', 'title', 'status', 'paymentStatus'] },
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'company'] },
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] },
];

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/invoices/next-number
 */
const getNextInvoiceNo = async (req, res, next) => {
  try {
    const invoiceNo = await Invoice.generateInvoiceNo();
    return success(res, { invoiceNo });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invoices
 */
const getAllInvoices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, customerId, jobId, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (jobId) where.jobId = jobId;

    if (search) {
      where[Op.or] = [
        { invoiceNo: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: invoiceIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invoices/:id
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, { include: invoiceIncludes });
    if (!invoice) return error(res, 'Invoice not found.', 404);
    return success(res, invoice);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invoices/number/:invoiceNo
 */
const getInvoiceByNumber = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      where: { invoiceNo: req.params.invoiceNo.toUpperCase() },
      include: invoiceIncludes,
    });
    if (!invoice) return error(res, `Invoice '${req.params.invoiceNo}' not found.`, 404);
    return success(res, invoice);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/invoices
 * Create a new invoice (starts as draft).
 *
 * Body:
 *   jobId, customerId, lineItems[], discountType?, discountValue?, taxRate?, dueDate?, notes?, terms?
 *
 * lineItems[]: [{ name, description?, quantity, unitPrice }]
 */
const createInvoice = async (req, res, next) => {
  try {
    const {
      jobId,
      customerId,
      lineItems,
      discountType,
      discountValue,
      taxRate,
      dueDate,
      notes,
      terms,
    } = req.body;

    // Validate job exists
    const job = await Job.findByPk(jobId);
    if (!job) return error(res, 'Job not found.', 404);

    // Validate customer exists
    const customer = await Customer.findOne({ where: { id: customerId, isActive: true } });
    if (!customer) return error(res, 'Customer not found or inactive.', 404);

    // Enrich line items with computed totalPrice
    const enrichedItems = lineItems.map((item) => ({
      name: item.name,
      description: item.description || null,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      totalPrice: parseFloat((parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)),
    }));

    const { subtotal, discountAmount, taxAmount, totalAmount } = computeFinancials(
      enrichedItems,
      discountType,
      discountValue,
      taxRate
    );

    const invoiceNo = await Invoice.generateInvoiceNo();

    const invoice = await Invoice.create({
      invoiceNo,
      jobId,
      customerId,
      createdById: req.user.id,
      lineItems: enrichedItems,
      subtotal,
      discountType: discountType || null,
      discountValue: discountValue || 0,
      discountAmount,
      taxRate: taxRate || 0,
      taxAmount,
      totalAmount,
      status: 'paid',
      paidAt: new Date(),
      dueDate: dueDate || null,
      notes: notes || null,
      terms: terms || null,
    });

    const created = await Invoice.findByPk(invoice.id, { include: invoiceIncludes });
    return success(res, created, 'Invoice created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/invoices/:id
 * Update a draft invoice. Cannot edit issued, paid, or cancelled invoices.
 */
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return error(res, 'Invoice not found.', 404);

    if (invoice.status !== 'draft') {
      return error(res, `Only draft invoices can be edited. Current status: '${invoice.status}'.`, 422);
    }

    const {
      lineItems,
      discountType,
      discountValue,
      taxRate,
      dueDate,
      notes,
      terms,
    } = req.body;

    // Use incoming values or fall back to existing ones
    const newLineItems = lineItems
      ? lineItems.map((item) => ({
          name: item.name,
          description: item.description || null,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat((parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)),
        }))
      : invoice.lineItems;

    const newDiscountType = discountType !== undefined ? discountType : invoice.discountType;
    const newDiscountValue = discountValue !== undefined ? discountValue : invoice.discountValue;
    const newTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;

    const { subtotal, discountAmount, taxAmount, totalAmount } = computeFinancials(
      newLineItems,
      newDiscountType,
      newDiscountValue,
      newTaxRate
    );

    await invoice.update({
      lineItems: newLineItems,
      subtotal,
      discountType: newDiscountType,
      discountValue: newDiscountValue,
      discountAmount,
      taxRate: newTaxRate,
      taxAmount,
      totalAmount,
      ...(dueDate !== undefined && { dueDate }),
      ...(notes !== undefined && { notes }),
      ...(terms !== undefined && { terms }),
    });

    const updated = await Invoice.findByPk(invoice.id, { include: invoiceIncludes });
    return success(res, updated, 'Invoice updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/invoices/:id/cancel
 * Cancel a draft or issued invoice.
 */
const cancelInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return error(res, 'Invoice not found.', 404);

    if (!['draft', 'issued'].includes(invoice.status)) {
      return error(res, `Cannot cancel an invoice with status '${invoice.status}'.`, 422);
    }

    await invoice.update({ status: 'cancelled' });

    return success(res, {
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      status: 'cancelled',
    }, 'Invoice cancelled.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/invoices/:id
 * Hard-delete only draft invoices.
 */
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return error(res, 'Invoice not found.', 404);

    if (invoice.status !== 'draft') {
      return error(res, 'Only draft invoices can be deleted.', 422);
    }

    await invoice.destroy();
    return success(res, null, 'Invoice deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNextInvoiceNo,
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNumber,
  createInvoice,
  updateInvoice,
  cancelInvoice,
  deleteInvoice,
};
