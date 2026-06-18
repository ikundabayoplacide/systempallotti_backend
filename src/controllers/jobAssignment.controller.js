const User = require('../database/models/User');
const Job = require('../database/models/Job');
const Department = require('../database/models/Department');
const { success, error } = require('../utils/apiResponse');
const notify = require('../utils/notification.service');

// Attributes to return for an employee
const employeeAttrs = ['id', 'name', 'email', 'role', 'phone', 'departmentId', 'currentJobId', 'isActive'];

/**
 * POST /api/job-assignments/assign
 * Supervisor assigns a job to an employee.
 * The employee must be in the same department the job is assigned to.
 *
 * Body: { jobId, employeeId }
 */
const assignJobToEmployee = async (req, res, next) => {
  try {
    const { jobId, employeeId } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job) return error(res, 'Job not found.', 404);

    if (!job.departmentAssignedToId) {
      return error(res, 'Job has not been assigned to a department yet.', 422);
    }

    const employee = await User.findOne({
      where: { id: employeeId, isActive: true },
      attributes: employeeAttrs,
    });
    if (!employee) return error(res, 'Employee not found or inactive.', 404);

    // Employee must belong to the same department as the job
    if (employee.departmentId !== job.departmentAssignedToId) {
      const dept = await Department.findByPk(job.departmentAssignedToId, { attributes: ['name'] });
      return error(
        res,
        `Employee does not belong to the job's assigned department (${dept?.name || job.departmentAssignedToId}).`,
        422
      );
    }

    // Warn if employee already has a job (still allow override by supervisor)
    const hadPreviousJob = employee.currentJobId;

    await employee.update({ currentJobId: jobId });

    // Notify the employee that a job was assigned to them
    await notify({
      createdById: req.user.id,
      title: 'Job Assigned to You',
      message: `Job ${job.jobNumber} ("${job.title}") has been assigned to you by your supervisor.`,
      type: 'JOB_ASSIGNED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetUserIds: [employee.id],
    });

    const updated = await User.findByPk(employee.id, {
      attributes: employeeAttrs,
      include: [{ model: Job, as: 'currentJob', attributes: ['id', 'jobNumber', 'title', 'state', 'status'] }],
    });

    return success(
      res,
      { employee: updated, replacedJobId: hadPreviousJob || null },
      hadPreviousJob
        ? `Job assigned. Note: employee was previously assigned to job ${hadPreviousJob}.`
        : 'Job assigned to employee successfully.',
      200
    );
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/job-assignments/unassign/:employeeId
 * Supervisor removes the current job assignment from an employee.
 */
const unassignJobFromEmployee = async (req, res, next) => {
  try {
    const employee = await User.findOne({
      where: { id: req.params.employeeId, isActive: true },
      attributes: employeeAttrs,
    });
    if (!employee) return error(res, 'Employee not found or inactive.', 404);

    if (!employee.currentJobId) {
      return error(res, 'Employee has no job currently assigned.', 409);
    }

    const previousJobId = employee.currentJobId;
    await employee.update({ currentJobId: null });

    return success(res, { employeeId: employee.id, unassignedJobId: previousJobId }, 'Job unassigned from employee successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/job-assignments/employees/:departmentId
 * Get all employees in a department with their current job assignment.
 */
const getEmployeesByDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByPk(req.params.departmentId);
    if (!dept) return error(res, 'Department not found.', 404);

    const employees = await User.findAll({
      where: { departmentId: req.params.departmentId, isActive: true },
      attributes: employeeAttrs,
      include: [
        {
          model: Job,
          as: 'currentJob',
          attributes: ['id', 'jobNumber', 'title', 'state', 'status', 'priority'],
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });

    return success(res, { department: { id: dept.id, name: dept.name }, employees });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/job-assignments/job/:jobId/employees
 * Get all employees currently assigned to a specific job.
 */
const getEmployeesAssignedToJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.jobId, {
      attributes: ['id', 'jobNumber', 'title', 'state', 'status'],
    });
    if (!job) return error(res, 'Job not found.', 404);

    const employees = await User.findAll({
      where: { currentJobId: req.params.jobId, isActive: true },
      attributes: employeeAttrs,
      order: [['name', 'ASC']],
    });

    return success(res, { job, employees });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  assignJobToEmployee,
  unassignJobFromEmployee,
  getEmployeesByDepartment,
  getEmployeesAssignedToJob,
};
