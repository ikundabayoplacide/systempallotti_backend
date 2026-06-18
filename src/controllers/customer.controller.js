const { Op } = require('sequelize');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

/**
 * GET /api/customers
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, type } = req.query;

    const where = { isActive: true };
    if (type) where.type = type;

    if (search) {
      where[Op.or] = ['name', 'email', 'company', 'phone'].map((field) => ({
        [field]: { [Op.iLike]: `%${search}%` },
      }));
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/customers/:id
 */
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return error(res, 'Customer not found.', 404);
    return success(res, customer);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/customers
 * If type is BUSINESS, notify all SALESMANAGER users.
 */
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, tin, companyType, groupeSize, address, notes, type } = req.body;

    // Only check email uniqueness if email is provided
    if (email) {
      const existing = await Customer.findOne({ where: { email } });
      if (existing) return error(res, 'A customer with this email already exists.', 409);
    }

    const customer = await Customer.create({
      name, email: email || null, phone, company, tin, companyType: companyType || null,
      groupeSize: groupeSize || null, address, notes,
      type: type || 'VISITOR',
    });

    // Notify all SALESMANAGER users when a BUSINESS or BOUTIQUE customer registers
    if (customer.type === 'BUSINESS' || customer.type === 'BOUTIQUE' || customer.type === 'HOBE') {
      await notify({
        createdById: req.user.id,
        title: 'New Customer Registered',
        message: `A new customer "${name}"${company ? ` from ${company}` : ''} has been registered.`,
        type: 'CUSTOMER_CREATED',
        relatedEntityType: 'customer',
        relatedEntityId: customer.id,
        targetRoles: ['ADMIN', 'SALES'],
      });
    }

    return success(res, customer, 'Customer created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/customers/:id
 */
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return error(res, 'Customer not found.', 404);

    const { name, email, phone, company, tin, companyType, groupeSize, address, notes, isActive, type } = req.body;

    await customer.update({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(company !== undefined && { company }),
      ...(tin !== undefined && { tin }),
      ...(companyType !== undefined && { companyType }),
      ...(groupeSize !== undefined && { groupeSize }),
      ...(address !== undefined && { address }),
      ...(notes !== undefined && { notes }),
      ...(isActive !== undefined && { isActive }),
      ...(type !== undefined && { type }),
    });

    return success(res, customer, 'Customer updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/customers/:id  (soft delete)
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return error(res, 'Customer not found.', 404);

    await customer.update({ isActive: false });
    return success(res, null, 'Customer deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
