const { Op } = require('sequelize');
const OvertimeRequest = require('../database/models/OvertimeRequest');
const Employee = require('../database/models/Employee');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const include = [
  { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'phoneNumber', 'departmentId'] },
  { model: User, as: 'registeredByUser', attributes: ['id', 'name'] },
  { model: User, as: 'approvedByUser', attributes: ['id', 'name'] },
];

const getAllOvertimeRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, date, employeeId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (date) where.date = date;
    if (employeeId) where.employeeId = employeeId;

    // WORKER can only see their own overtime
    if (req.user.role === 'WORKER') {
      const self = await Employee.findOne({ where: { userId: req.user.id } });
      if (!self) return paginated(res, [], 0, 1, limit);
      where.employeeId = self.id;
    }
    const { count, rows } = await OvertimeRequest.findAndCountAll({
      where,
      include,
      offset: skip,
      limit,
      order: [['date', 'DESC'], ['startTime', 'ASC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getOvertimeRequestById = async (req, res, next) => {
  try {
    const record = await OvertimeRequest.findByPk(req.params.id, { include });
    if (!record) return error(res, 'Overtime request not found.', 404);
    return success(res, record);
  } catch (err) {
    next(err);
  }
};

const createOvertimeRequest = async (req, res, next) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    let { employeeId } = req.body;

    // If no employeeId provided (worker registering themselves), resolve from their user account
    if (!employeeId) {
      const self = await Employee.findOne({ where: { userId: req.user.id } });
      if (!self) return error(res, 'No employee record linked to your account.', 404);
      employeeId = self.id;
    }

    // Support passing userId instead of employeeId
    let employee = await Employee.findByPk(employeeId);
    if (!employee) employee = await Employee.findOne({ where: { userId: employeeId } });
    if (!employee) return error(res, 'Employee not found.', 404);

    const record = await OvertimeRequest.create({
      employeeId: employee.id,
      date,
      startTime,
      endTime,
      reason,
      registeredBy: req.user.id,
    });

    const created = await OvertimeRequest.findByPk(record.id, { include });
    return success(res, created, 'Overtime request created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateOvertimeRequest = async (req, res, next) => {
  try {
    const record = await OvertimeRequest.findByPk(req.params.id);
    if (!record) return error(res, 'Overtime request not found.', 404);
    if (record.status !== 'PENDING') {
      return error(res, 'Only pending overtime requests can be edited.', 400);
    }

    const { date, startTime, endTime, reason } = req.body;

    await record.update({
      ...(date !== undefined && { date }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(reason !== undefined && { reason }),
    });

    const updated = await OvertimeRequest.findByPk(record.id, { include });
    return success(res, updated, 'Overtime request updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteOvertimeRequest = async (req, res, next) => {
  try {
    const record = await OvertimeRequest.findByPk(req.params.id);
    if (!record) return error(res, 'Overtime request not found.', 404);
    if (record.status !== 'PENDING') {
      return error(res, 'Only pending overtime requests can be deleted.', 400);
    }

    await record.destroy();
    return success(res, null, 'Overtime request deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const approveOrReject = async (req, res, next) => {
  try {
    const record = await OvertimeRequest.findByPk(req.params.id);
    if (!record) return error(res, 'Overtime request not found.', 404);
    if (record.status !== 'PENDING') {
      return error(res, 'This overtime request has already been reviewed.', 400);
    }

    const { status, approvalComment } = req.body;

    await record.update({
      status,
      approvalComment: approvalComment || null,
      approvedBy: req.user.id,
    });

    const updated = await OvertimeRequest.findByPk(record.id, { include });
    return success(res, updated, `Overtime request ${status.toLowerCase()} successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOvertimeRequests,
  getOvertimeRequestById,
  createOvertimeRequest,
  updateOvertimeRequest,
  deleteOvertimeRequest,
  approveOrReject,
};
