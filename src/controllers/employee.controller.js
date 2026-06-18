const { Op } = require('sequelize');
const Employee = require('../database/models/Employee');
const User = require('../database/models/User');
const Department = require('../database/models/Department');
const notify = require('../utils/notification.service');
const Job = require('../database/models/Job');
const Customer = require('../database/models/Customer');
const EmployeeJobAssignment = require('../database/models/EmployeeJobAssignment');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const employeeIncludes = [
  { model: Department, as: 'department', attributes: ['id', 'name'] },
  {
    model: Job,
    as: 'assignedJobs',
    attributes: ['id', 'jobNumber', 'title', 'state', 'status', 'priority'],
    through: { attributes: ['id', 'assignedAt', 'assignedById'] },
    required: false,
  },
];

/**
 * GET /api/employees
 * SUPERVISOR: automatically scoped to their own department.
 * ADMIN / others: can filter freely via ?departmentId=
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { departmentId, isActive, search } = req.query;

    const where = {};

    // Supervisors are always restricted to their own department
    if (req.user.role === 'SUPERVISOR') {
      if (!req.user.departmentId) {
        return error(res, 'Your account is not assigned to any department.', 403);
      }
      where.departmentId = req.user.departmentId;
    } else if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Employee.findAndCountAll({
      where,
      offset: skip,
      limit,
      distinct: true,
      order: [['createdAt', 'DESC']],
      include: employeeIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id, { include: employeeIncludes });
    if (!employee) return error(res, 'Employee not found.', 404);
    return success(res, employee);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/employees
 * Also creates a linked User account if password is provided.
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      fullName, phoneNumber, gender, dateOfBirth,
      nid, address, email, supportContact, bankAccount,
      contractSalary, contractType, hiredAt, departmentId, password,
    } = req.body;

    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (!dept) return error(res, 'Department not found.', 404);
    }

    // If password provided, create a linked User account first
    let userId = null;
    if (password) {
      if (!email) return error(res, 'email is required when creating a user account (password was provided).', 422);

      const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (existing) return error(res, 'A user account with this email already exists.', 409);

      const user = await User.create({
        name: fullName,
        email,
        password,
        phone: phoneNumber || null,
        gender: gender || null,
        departmentId: departmentId || null,
        role: 'WORKER',
        isActive: true,
      });
      userId = user.id;
    }

    const employee = await Employee.create({
      fullName, phoneNumber, gender, dateOfBirth,
      nid: nid || null,
      address,
      email: email || null,
      supportContact: supportContact || null,
      bankAccount: bankAccount || null,
      contractSalary,
      contractType: contractType || 'FULL_TIME',
      hiredAt: hiredAt || null,
      departmentId: departmentId || null,
      userId,
    });

    // Notify the supervisor(s) of the assigned department (if any)
    if (departmentId) {
      const supervisors = await User.findAll({
        where: { departmentId, role: 'SUPERVISOR', isActive: true },
        attributes: ['id'],
      });
      if (supervisors.length > 0) {
        await notify({
          createdById: req.user.id,
          title: 'New Employee Added to Your Department',
          message: `A new employee "${fullName}" has been registered and assigned to your department.`,
          type: 'EMPLOYEE_CREATED',
          relatedEntityType: 'employee',
          relatedEntityId: employee.id,
          targetRoles: ['ADMIN'],
          targetUserIds: supervisors.map((u) => u.id),
        });
      }
    }

    const created = await Employee.findByPk(employee.id, { include: employeeIncludes });
    return success(res, created, 'Employee created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return error(res, 'Employee not found.', 404);

    const {
      fullName, phoneNumber, gender, dateOfBirth,
      nid, address, email, supportContact, bankAccount,
      contractSalary, contractType, hiredAt, departmentId, isActive, userId,
    } = req.body;

    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (!dept) return error(res, 'Department not found.', 404);
    }

    await employee.update({
      ...(fullName !== undefined && { fullName }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(nid !== undefined && { nid }),
      ...(address !== undefined && { address }),
      ...(email !== undefined && { email }),
      ...(supportContact !== undefined && { supportContact }),
      ...(bankAccount !== undefined && { bankAccount }),
      ...(contractSalary !== undefined && { contractSalary }),
      ...(contractType !== undefined && { contractType }),
      ...(hiredAt !== undefined && { hiredAt }),
      ...(departmentId !== undefined && { departmentId }),
      ...(isActive !== undefined && { isActive }),
      ...(userId !== undefined && { userId }),
    });

    const updated = await Employee.findByPk(employee.id, { include: employeeIncludes });
    return success(res, updated, 'Employee updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/employees/:id/department
 */
const assignDepartment = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return error(res, 'Employee not found.', 404);

    const { departmentId } = req.body;

    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (!dept) return error(res, 'Department not found.', 404);
    }

    await employee.update({ departmentId: departmentId || null });
    const updated = await Employee.findByPk(employee.id, { include: employeeIncludes });
    return success(res, updated, departmentId ? 'Employee assigned to department.' : 'Employee removed from department.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/employees/:id/toggle-active
 */
const toggleEmployeeActive = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return error(res, 'Employee not found.', 404);

    await employee.update({ isActive: !employee.isActive });
    return success(res, { id: employee.id, isActive: employee.isActive },
      `Employee ${employee.isActive ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/employees/:id/assign-job
 * Adds a job to the employee's assignment list (many-to-many).
 * The same job cannot be assigned to the same employee twice.
 */
const assignJob = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return error(res, 'Employee not found.', 404);

    const { jobId } = req.body;
    if (!jobId) return error(res, 'jobId is required.', 422);

    const job = await Job.findByPk(jobId);
    if (!job) return error(res, 'Job not found.', 404);

    // Employee must belong to the department the job is assigned to
    if (job.departmentAssignedToId && employee.departmentId !== job.departmentAssignedToId) {
      const dept = await Department.findByPk(job.departmentAssignedToId, { attributes: ['name'] });
      return error(
        res,
        `Employee does not belong to the job's assigned department (${dept?.name || job.departmentAssignedToId}).`,
        422
      );
    }

    // Check for duplicate assignment
    const existing = await EmployeeJobAssignment.findOne({ where: { employeeId: employee.id, jobId } });
    if (existing) {
      return error(res, `Job ${job.jobNumber} is already assigned to ${employee.fullName}.`, 409);
    }

    await EmployeeJobAssignment.create({
      employeeId: employee.id,
      jobId,
      assignedById: req.user?.id || null,
      assignedAt: new Date(),
    });

    const updated = await Employee.findByPk(employee.id, { include: employeeIncludes });
    return success(res, updated, 'Job assigned to employee successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/employees/:id/unassign-job
 * Removes a specific job from the employee's assignment list.
 */
const unassignJob = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return error(res, 'Employee not found.', 404);

    const { jobId } = req.body;
    if (!jobId) return error(res, 'jobId is required.', 422);

    const assignment = await EmployeeJobAssignment.findOne({ where: { employeeId: employee.id, jobId } });
    if (!assignment) return error(res, 'This job is not assigned to this employee.', 404);

    await assignment.destroy();

    const updated = await Employee.findByPk(employee.id, { include: employeeIncludes });
    return success(res, updated, 'Job removed from employee successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return error(res, 'Employee not found.', 404);

    await employee.destroy();
    return success(res, null, 'Employee deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/employees/me
 * Returns the linked employee profile if it exists,
 * otherwise falls back to the authenticated user's own data.
 */
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      include: employeeIncludes,
    });

    if (employee) return success(res, employee);

    // No employee record — return user data so WORKER role users are not blocked
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'departmentId', 'isActive', 'createdAt'],
    });
    return success(res, { ...user.toJSON(), employeeProfile: null });
  } catch (err) {
    next(err);
  }
};

const assignedJobIncludes = [
  { model: Customer, as: 'customer', attributes: ['id', 'name'] },
];

/**
 * GET /api/employees/:id/jobs
 * Returns all jobs assigned to the employee.
 * Optional ?status=done&date=today filters.
 */
const getEmployeeJobs = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return error(res, 'Employee not found.', 404);

    const { status, date } = req.query;

    const jobWhere = {};
    if (status) jobWhere.inProduction = status;
    if (date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      jobWhere.updatedAt = { [Op.between]: [start, end] };
    }

    const jobs = await Job.findAll({
      include: [
        {
          model: Employee,
          as: 'assignedWorkers',
          where: { id: req.params.id },
          attributes: [],
          through: { attributes: [] },
          required: true,
        },
        ...assignedJobIncludes,
      ],
      where: jobWhere,
      order: [['dueDate', 'ASC']],
    });

    return success(res, jobs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getMyProfile,
  getEmployeeJobs,
  createEmployee,
  updateEmployee,
  toggleEmployeeActive,
  assignDepartment,
  assignJob,
  unassignJob,
  deleteEmployee,
};
