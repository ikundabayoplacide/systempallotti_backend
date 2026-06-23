const Payroll = require('../database/models/Payroll');
const Employee = require('../database/models/Employee');
const CasualWorker = require('../database/models/CasualWorker');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const payrollIncludes = [
  { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'phoneNumber', 'contractType', 'departmentId'] },
  { model: CasualWorker, as: 'casualWorker', attributes: ['id', 'fullName', 'phoneNumber', 'jobDone'] },
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'role'] },
];

const computeNet = (salary, overtime, deductions) =>
  parseFloat((parseFloat(salary) + parseFloat(overtime) - parseFloat(deductions)).toFixed(2));

/**
 * GET /api/payrolls
 */
const getAllPayrolls = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { workerType, status, period } = req.query;

    const where = {};
    if (workerType) where.workerType = workerType;
    if (status) where.status = status;
    if (period) where.period = period;

    const { count, rows } = await Payroll.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: payrollIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payrolls/:id
 */
const getPayrollById = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, { include: payrollIncludes });
    if (!payroll) return error(res, 'Payroll not found.', 404);
    return success(res, payroll);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payrolls
 */
const createPayroll = async (req, res, next) => {
  try {
    const { workerType, employeeId, casualWorkerId, period, salary, overtime = 0, deductions = 0, notes } = req.body;

    // Validate the referenced worker exists
    if (workerType === 'employee') {
      const emp = await Employee.findByPk(employeeId);
      if (!emp) return error(res, 'Employee not found.', 404);
    } else {
      const cw = await CasualWorker.findByPk(casualWorkerId);
      if (!cw) return error(res, 'Casual worker not found.', 404);
    }

    // Prevent duplicate payroll for same worker + same period
    const duplicate = await Payroll.findOne({
      where: {
        period,
        ...(workerType === 'employee' ? { employeeId } : { casualWorkerId }),
      },
    });
    if (duplicate) return error(res, `A payroll for this ${workerType} in period "${period}" already exists.`, 409);

    const payroll = await Payroll.create({
      workerType,
      employeeId: workerType === 'employee' ? employeeId : null,
      casualWorkerId: workerType === 'casual' ? casualWorkerId : null,
      period,
      salary: parseFloat(salary),
      overtime: parseFloat(overtime),
      deductions: parseFloat(deductions),
      netSalary: computeNet(salary, overtime, deductions),
      notes: notes || null,
      createdById: req.user.id,
    });

    const created = await Payroll.findByPk(payroll.id, { include: payrollIncludes });
    return success(res, created, 'Payroll created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/payrolls/:id
 * Only editable while status is 'draft'
 */
const updatePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return error(res, 'Payroll not found.', 404);
    if (payroll.status !== 'draft') {
      return error(res, `Cannot edit a payroll with status "${payroll.status}". Only draft payrolls can be edited.`, 400);
    }

    const { period, salary, overtime, deductions, notes } = req.body;

    const s = salary !== undefined ? parseFloat(salary) : parseFloat(payroll.salary);
    const o = overtime !== undefined ? parseFloat(overtime) : parseFloat(payroll.overtime);
    const d = deductions !== undefined ? parseFloat(deductions) : parseFloat(payroll.deductions);

    await payroll.update({
      ...(period !== undefined && { period }),
      ...(notes !== undefined && { notes }),
      salary: s,
      overtime: o,
      deductions: d,
      netSalary: computeNet(s, o, d),
    });

    const updated = await Payroll.findByPk(payroll.id, { include: payrollIncludes });
    return success(res, updated, 'Payroll updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/payrolls/:id/approve
 */
const approvePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return error(res, 'Payroll not found.', 404);
    if (payroll.status !== 'draft') {
      return error(res, `Cannot approve a payroll with status "${payroll.status}".`, 400);
    }

    await payroll.update({ status: 'approved' });
    const updated = await Payroll.findByPk(payroll.id, { include: payrollIncludes });
    return success(res, updated, 'Payroll approved.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/payrolls/:id/pay
 */
const markPayrollPaid = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return error(res, 'Payroll not found.', 404);
    if (payroll.status !== 'approved') {
      return error(res, `Cannot mark as paid — payroll must be approved first (current: "${payroll.status}").`, 400);
    }

    await payroll.update({ status: 'paid', paidAt: new Date() });
    const updated = await Payroll.findByPk(payroll.id, { include: payrollIncludes });
    return success(res, updated, 'Payroll marked as paid.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/payrolls/:id
 * Only deletable while draft
 */
const deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) return error(res, 'Payroll not found.', 404);
    if (payroll.status !== 'draft') {
      return error(res, `Cannot delete a payroll with status "${payroll.status}".`, 400);
    }

    await payroll.destroy();
    return success(res, null, 'Payroll deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPayrolls, getPayrollById, createPayroll, updatePayroll, approvePayroll, markPayrollPaid, deletePayroll };
