const { Op } = require('sequelize');
const Job = require('../database/models/Job');
const Customer = require('../database/models/Customer');
const User = require('../database/models/User');
const Department = require('../database/models/Department');
const Payment = require('../database/models/Payment');
const JobItem = require('../database/models/JobItem');
const StockItem = require('../database/models/StockItem');
const Proforma = require('../database/models/Proforma');
const JobDocument = require('../database/models/JobDocument');
const Employee = require('../database/models/Employee');
const EmployeeJobAssignment = require('../database/models/EmployeeJobAssignment');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

// Common includes for job queries
const jobIncludes = [
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'company'] },
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] },
  { model: Department, as: 'departmentAssignedTo', attributes: ['id', 'name'] },
  { model: Payment, as: 'payments', attributes: ['id', 'paymentMethod', 'paymentState', 'amountPaid', 'balance', 'receiptNo', 'paidAt'] },
  { model: JobItem, as: 'jobItems', include: [{ model: StockItem, as: 'stockItem', attributes: ['id', 'itemName', 'category', 'unit', 'currentStock'] }] },
  { model: JobDocument, as: 'documents', attributes: ['id', 'fileName', 'mimeType', 'fileUrl', 'uploadedById', 'createdAt'] },
];

/**
 * GET /api/jobs/number/:jobNumber
 */
const getJobByNumber = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { jobNumber: req.params.jobNumber.toUpperCase() },
      include: jobIncludes,
    });
    if (!job) return error(res, `Job '${req.params.jobNumber}' not found.`, 404);
    return success(res, job);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/next-number
 */
const getNextJobNumber = async (req, res, next) => {
  try {
    const jobNumber = await Job.generateJobNumber();
    return success(res, { jobNumber });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs
 */
const getAllJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, priority, customerId, departmentAssignedToId, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (customerId) where.customerId = customerId;
    if (departmentAssignedToId) where.departmentAssignedToId = departmentAssignedToId;

    if (search) {
      where[Op.or] = [
        { jobNumber: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: jobIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, { include: jobIncludes });
    if (!job) return error(res, 'Job not found.', 404);
    return success(res, job);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id/details
 * Full job details: department position, assigned workers, supervisor(s), progress state.
 */
const getJobDetails = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        ...jobIncludes,
        {
          model: Employee,
          as: 'assignedWorkers',
          attributes: ['id', 'fullName', 'phoneNumber', 'contractType'],
          through: { model: EmployeeJobAssignment, attributes: ['assignedAt'] },
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
      ],
    });
    if (!job) return error(res, 'Job not found.', 404);

    // Fetch supervisors of the assigned department
    let supervisors = [];
    if (job.departmentAssignedToId) {
      supervisors = await User.findAll({
        where: { departmentId: job.departmentAssignedToId, role: 'SUPERVISOR', isActive: true },
        attributes: ['id', 'name', 'phone', 'email'],
      });
    }

    return success(res, {
      ...job.toJSON(),
      departmentPosition: {
        department: job.departmentAssignedTo || null,
        supervisors,
        state: job.state,
        inProduction: job.inProduction,
        progress: job.progress,
        startedAt: job.startedAt,
        pausedAt: job.pausedAt,
        resumedAt: job.resumedAt,
        completedAt: job.completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs
 * Notify all SUPERVISOR users when a new job is created.
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title, description, jobType, quantity, size,
      colorMode, bindingType, priority, dueDate, notes,
      customerId, amount, items,
    } = req.body;

    const customer = await Customer.findOne({ where: { id: customerId, isActive: true } });
    if (!customer) return error(res, 'Customer not found or inactive.', 404);

    // Validate items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        const stockItem = await StockItem.findByPk(item.stockItemId);
        if (!stockItem) return error(res, `Stock item ${item.stockItemId} not found.`, 404);
        if (!stockItem.isActive) return error(res, `Stock item "${stockItem.itemName}" is inactive.`, 422);
        if (parseFloat(item.quantityNeeded) > parseFloat(stockItem.currentStock)) {
          return error(res, `Insufficient stock for "${stockItem.itemName}". Available: ${stockItem.currentStock} ${stockItem.unit || ''}, requested: ${item.quantityNeeded}.`, 422);
        }
      }
    }

    const jobNumber = await Job.generateJobNumber();

    const job = await Job.create({
      jobNumber, title, description, jobType, quantity, size,
      colorMode, bindingType, priority: priority || 'normal',
      dueDate, notes, customerId, amount,
      createdById: req.user.id,
    });

    // Create job items if provided
    if (items && items.length > 0) {
      await Promise.all(
        items.map((item) =>
          JobItem.create({
            jobId: job.id,
            stockItemId: item.stockItemId,
            quantityNeeded: item.quantityNeeded,
            notes: item.notes || null,
          })
        )
      );
    }

    // Notify all SUPERVISOR users (production managers)
    await notify({
      createdById: req.user.id,
      title: 'New Job Created',
      message: `A new job "${title}" (${jobNumber}) has been registered for customer "${customer.name}".`,
      type: 'JOB_CREATED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN', 'SUPERVISOR'],
    });

    // Auto-create a pending payment record if job has an amount
    if (amount) {
      await Payment.create({
        jobId: job.id,
        recordedById: req.user.id,
        receivedById: null,
        verifiedById: null,
        receiptNo: null,
        amountPaid: 0,
        balance: parseFloat(amount),
        paymentMethod: null,
        paymentState: null,
        paymentNote: null,
        paidAt: new Date(),
      });
    }

    // Save uploaded documents if any
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          JobDocument.create({
            jobId: job.id,
            uploadedById: req.user.id,
            fileName: file.originalname,
            mimeType: file.mimetype,
            fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          })
        )
      );
    }

    // Auto-create a draft proforma
    const proformaNo = await Proforma.generateProformaNo();
    const sub = parseFloat(amount || 0);
    await Proforma.create({
      proformaNo,
      jobId: job.id,
      customerId: job.customerId,
      createdById: req.user.id,
      subtotal: sub,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      totalAmount: sub,
      status: 'draft',
    });

    const created = await Job.findByPk(job.id, { include: jobIncludes });
    return success(res, created, 'Job registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/jobs/:id
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);

    const {
      title, description, jobType, quantity, size,
      colorMode, bindingType, priority, dueDate, notes,
      departmentAssignedToId, amount,
    } = req.body;

    if (departmentAssignedToId) {
      const dept = await Department.findOne({ where: { id: departmentAssignedToId, isActive: true } });
      if (!dept) return error(res, 'Department not found or inactive.', 404);
    }

    await job.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(jobType !== undefined && { jobType }),
      ...(quantity !== undefined && { quantity }),
      ...(size !== undefined && { size }),
      ...(colorMode !== undefined && { colorMode }),
      ...(bindingType !== undefined && { bindingType }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate }),
      ...(notes !== undefined && { notes }),
      ...(amount !== undefined && { amount }),
      ...(departmentAssignedToId !== undefined && { departmentAssignedToId }),
    });

    const updated = await Job.findByPk(job.id, { include: jobIncludes });
    return success(res, updated, 'Job updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:id/state
 * Supervisor marks the current department's work as done.
 * Only valid transitions: in-X → X-done (as defined in Job.validStateTransitions)
 */
const updateJobState = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);

    const { state } = req.body;

    // The incoming state must be the "done" version of the current state
    const expectedDone = Job.validStateTransitions[job.state];
    if (!expectedDone || expectedDone !== state) {
      return error(
        res,
        `Cannot set state to '${state}'. Job is currently '${job.state ?? 'unassigned'}'. Expected next state: '${expectedDone ?? 'none'}'.`,
        422
      );
    }

    await job.update({ state });

    await notify({
      createdById: req.user.id,
      title: 'Department Work Completed',
      message: `Job ${job.jobNumber} department stage "${state}" has been marked done by a supervisor.`,
      type: 'JOB_STATUS_CHANGED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN', 'PRODUCTION_MANAGER'],
    });

    return success(res, { id: job.id, jobNumber: job.jobNumber, state: job.state }, 'Job state updated.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:id/status
 * Notify all SUPERVISOR users when job status changes.
 */
const updateJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);

    const { status } = req.body;

    if (!Job.canTransition(job.status, status)) {
      return error(res, `Invalid status transition from '${job.status}' to '${status}'.`, 422);
    }

    const previousStatus = job.status;
    await job.update({ status });

    // Notify all SUPERVISOR users of the status change
    await notify({
      createdById: req.user.id,
      title: 'Job Status Changed',
      message: `Job ${job.jobNumber} status changed from "${previousStatus}" to "${status}".`,
      type: 'JOB_STATUS_CHANGED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN', 'SUPERVISOR'],
    });

    return success(res, { id: job.id, jobNumber: job.jobNumber, status: job.status }, 'Job status updated.');
  } catch (err) {
    next(err);
  }
};

/**
 * Map a department name to a job state.
 * Returns null if the department name doesn't match any known production state.
 */
const departmentToState = (deptName) => {
  const name = deptName.toLowerCase();
  if (name.includes('composition')) return 'in-composition';
  if (name.includes('montage'))     return 'in-montage';
  if (name.includes('printing'))    return 'in-printing';
  if (name.includes('binding'))     return 'in-binding';
  if (name.includes('packaging'))   return 'in-packaging';
  if (name.includes('quality'))     return 'quality-check';
  return null;
};

/**
 * POST /api/jobs/:id/assign
 * Assign job to a department and notify all users in that department.
 * Also notify SUPERVISOR users that the assignment was made.
 */
const assignJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);

    const { departmentAssignedToId } = req.body;

    const dept = await Department.findOne({ where: { id: departmentAssignedToId, isActive: true } });
    if (!dept) return error(res, 'Department not found or inactive.', 404);

    await job.update({ departmentAssignedToId, state: departmentToState(dept.name) });

    // Notify the supervisor(s) of the target department specifically
    const deptSupervisors = await User.findAll({
      where: { departmentId: dept.id, role: 'SUPERVISOR', isActive: true },
      attributes: ['id'],
    });
    await notify({
      createdById: req.user.id,
      title: 'New Job Assigned to Your Department',
      message: `Job ${job.jobNumber} ("${job.title}") has been assigned to the "${dept.name}" department.`,
      type: 'JOB_ASSIGNED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN'],
      targetUserIds: deptSupervisors.map((u) => u.id),
    });

    return success(
      res,
      { id: job.id, jobNumber: job.jobNumber, departmentAssignedTo: { id: dept.id, name: dept.name } },
      'Job assigned to department successfully.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:id/reassign
 * Reassign a job from its current department to a new one.
 */
const reassignJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, { include: jobIncludes });
    if (!job) return error(res, 'Job not found.', 404);

    if (!job.departmentAssignedToId) {
      return error(res, 'Job has not been assigned to any department yet. Use the assign endpoint instead.', 422);
    }

    const { departmentAssignedToId, reason } = req.body;

    if (departmentAssignedToId === job.departmentAssignedToId) {
      return error(res, 'Job is already assigned to this department.', 409);
    }

    const newDept = await Department.findOne({ where: { id: departmentAssignedToId, isActive: true } });
    if (!newDept) return error(res, 'Department not found or inactive.', 404);

    const previousDept = job.departmentAssignedTo;

    await job.update({ departmentAssignedToId, state: departmentToState(newDept.name) });

    const newDeptSupervisors = await User.findAll({
      where: { departmentId: newDept.id, role: 'SUPERVISOR', isActive: true },
      attributes: ['id'],
    });
    await notify({
      createdById: req.user.id,
      title: 'Job Reassigned to Your Department',
      message: `Job ${job.jobNumber} has been reassigned from "${previousDept?.name || 'N/A'}" to "${newDept.name}".${reason ? ` Reason: ${reason}` : ''}`,
      type: 'JOB_ASSIGNED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN'],
      targetUserIds: newDeptSupervisors.map((u) => u.id),
    });

    return success(
      res,
      {
        id: job.id,
        jobNumber: job.jobNumber,
        previousDepartment: previousDept ? { id: previousDept.id, name: previousDept.name } : null,
        departmentAssignedTo: { id: newDept.id, name: newDept.name },
      },
      'Job reassigned to new department successfully.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:id/complete
 * Mark a job as completed. Only allowed if current status is 'delivered'.
 */
const completeJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, { include: jobIncludes });
    if (!job) return error(res, 'Job not found.', 404);

    if (job.status === 'completed') {
      return error(res, 'Job is already completed.', 409);
    }

    if (job.status === 'delivered') {
      return error(res, 'Job is already delivered and cannot be changed.', 422);
    }

    await job.update({ status: 'completed' });

    await notify({
      createdById: req.user.id,
      title: 'Job Completed',
      message: `Job ${job.jobNumber} ("${job.title}") has been marked as completed and is ready for delivery.`,
      type: 'JOB_STATUS_CHANGED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN', 'RECEPTIONIST'],
    });

    return success(res, {
      id: job.id,
      jobNumber: job.jobNumber,
      status: 'completed',
    }, 'Job marked as completed.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/completed-and-paid
 * Fetch all jobs whose status is 'completed' AND paymentStatus is 'paid'.
 */
const getCompletedAndPaidJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search } = req.query;

    const where = { status: 'completed', paymentStatus: 'paid' };

    if (search) {
      where[Op.or] = [
        { jobNumber: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['paidAt', 'DESC']],
      include: jobIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:id/deliver
 * Mark a job as delivered. Only allowed if current status is 'ready-for-delivery'.
 */
const deliverJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, { include: jobIncludes });
    if (!job) return error(res, 'Job not found.', 404);

    if (job.status === 'delivered') {
      return error(res, 'Job is already marked as delivered.', 409);
    }

    if (job.status !== 'completed') {
      return error(res, `Job cannot be delivered from status '${job.status}'. It must be 'completed' first.`, 422);
    }

    const { deliveredByName, deliveredByContact } = req.body;

    await job.update({
      status: 'delivered',
      ...(deliveredByName !== undefined && { deliveredByName }),
      ...(deliveredByContact !== undefined && { deliveredByContact }),
    });

    await notify({
      createdById: req.user.id,
      title: 'Job Delivered',
      message: `Job ${job.jobNumber} ("${job.title}") has been marked as delivered.`,
      type: 'JOB_DELIVERED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN', 'SUPERVISOR', 'DAF'],
    });

    return success(res, {
      id: job.id,
      jobNumber: job.jobNumber,
      status: 'delivered',
    }, 'Job marked as delivered.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs/:id/approve
 * Approve a pending job (pending → confirmed). Only ADMIN or SUPERVISOR.
 */
/**
 * POST /api/jobs/:id/reject
 * Reject a pending or confirmed job. Only ADMIN or SUPERVISOR.
 */
const rejectJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, { include: jobIncludes });
    if (!job) return error(res, 'Job not found.', 404);

    if (!['pending', 'confirmed'].includes(job.status)) {
      return error(res, `Job cannot be rejected. Current status is '${job.status}'.`, 422);
    }

    const { rejectReason } = req.body;

    await job.update({ status: 'rejected', rejectReason: rejectReason || null });

    // If DAF is rejecting, notify the PM; otherwise notify the job creator
    const isDaf = req.user.role === 'DAF';
    await notify({
      createdById: req.user.id,
      title: 'Job Rejected',
      message: `Job ${job.jobNumber} ("${job.title}") has been rejected by ${req.user.name || req.user.role}.${rejectReason ? ` Reason: ${rejectReason}` : ''}`,
      type: isDaf ? 'JOB_DAF_ACTION' : 'JOB_STATUS_CHANGED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: isDaf ? ['ADMIN', 'PRODUCTION_MANAGER'] : [],
      targetUserIds: isDaf ? [] : [job.createdById],
    });

    return success(res, { id: job.id, jobNumber: job.jobNumber, status: 'rejected', rejectReason: job.rejectReason }, 'Job rejected successfully.');
  } catch (err) {
    next(err);
  }
};

const approveJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, { include: jobIncludes });
    if (!job) return error(res, 'Job not found.', 404);

    if (job.status !== 'pending') {
      return error(res, `Job cannot be approved. Current status is '${job.status}', expected 'pending'.`, 422);
    }

    await job.update({ status: 'confirmed' });

    // If DAF is confirming, notify the PM; otherwise notify the job creator
    const isDaf = req.user.role === 'DAF';
    await notify({
      createdById: req.user.id,
      title: 'Job Confirmed',
      message: `Job ${job.jobNumber} ("${job.title}") has been confirmed by ${req.user.name || req.user.role}.`,
      type: isDaf ? 'JOB_DAF_ACTION' : 'JOB_STATUS_CHANGED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: isDaf ? ['ADMIN', 'PRODUCTION_MANAGER'] : [],
      targetUserIds: isDaf ? [] : [job.createdById],
    });

    return success(res, { id: job.id, jobNumber: job.jobNumber, status: 'confirmed' }, 'Job approved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:id/in-production
 * Worker updates the inProduction status of a job assigned to their department.
 */
const updateInProduction = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);

    if (!job.departmentAssignedToId) {
      return error(res, 'Job has not been assigned to a department yet.', 422);
    }

    const { inProduction } = req.body;
    const allowed = ['pending', 'inprogress', 'paused', 'done'];
    if (!allowed.includes(inProduction)) {
      return error(res, `Invalid value. Allowed: ${allowed.join(', ')}.`, 422);
    }

    await job.update({ inProduction });

    await notify({
      createdById: req.user.id,
      title: 'Production Status Updated',
      message: `Job ${job.jobNumber} production status changed to "${inProduction}" by a worker.`,
      type: 'JOB_STATUS_CHANGED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN', 'SUPERVISOR'],
    });

    return success(res, { id: job.id, jobNumber: job.jobNumber, inProduction: job.inProduction }, 'Production status updated.');
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);

    if (!['pending', 'confirmed'].includes(job.status)) {
      return error(res, 'Only pending or confirmed jobs can be deleted.', 422);
    }

    await job.destroy();
    return success(res, null, 'Job deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/departments/:id/jobs
 */
const getJobsByDepartment = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, priority, search } = req.query;

    const department = await Department.findByPk(req.params.id);
    if (!department) return error(res, 'Department not found.', 404);

    const where = { departmentAssignedToId: req.params.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { jobNumber: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'company'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] },
      ],
    });

    return paginated(res, rows, count, page, limit, `Jobs for department: ${department.name}`);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:id/start  — worker starts the job
 */
const startJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);
    if (job.startedAt) return error(res, 'Job already started.', 409);
    await job.update({ startedAt: new Date(), pausedAt: null, inProduction: 'inprogress', progress: 'started' });
    return success(res, { id: job.id, jobNumber: job.jobNumber, startedAt: job.startedAt, inProduction: job.inProduction, progress: job.progress }, 'Job started.');
  } catch (err) { next(err); }
};

/**
 * PATCH /api/jobs/:id/pause  — worker pauses the job
 */
const pauseJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);
    await job.update({ pausedAt: new Date(), inProduction: 'paused', progress: 'paused' });
    return success(res, { id: job.id, jobNumber: job.jobNumber, pausedAt: job.pausedAt, inProduction: job.inProduction, progress: job.progress }, 'Job paused.');
  } catch (err) { next(err); }
};

/**
 * PATCH /api/jobs/:id/resume  — worker resumes a paused job
 */
const resumeJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);
    await job.update({ pausedAt: null, resumedAt: new Date(), inProduction: 'inprogress', progress: 'resumed' });
    return success(res, { id: job.id, jobNumber: job.jobNumber, resumedAt: job.resumedAt, inProduction: job.inProduction, progress: job.progress }, 'Job resumed.');
  } catch (err) { next(err); }
};

/**
 * PATCH /api/jobs/:id/done  — worker marks the job as done
 */
const markJobDone = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found.', 404);
    if (job.inProduction === 'done') return error(res, 'Job is already marked as done.', 409);
    await job.update({ inProduction: 'done', completedAt: new Date(), progress: 'completed' });

    await notify({
      createdById: req.user.id,
      title: 'Job Completed by Worker',
      message: `Job ${job.jobNumber} has been marked as done by a worker.`,
      type: 'JOB_STATUS_CHANGED',
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      targetRoles: ['ADMIN', 'SUPERVISOR'],
    });

    return success(res, { id: job.id, jobNumber: job.jobNumber, inProduction: 'done', completedAt: job.completedAt, progress: job.progress }, 'Job marked as done.');
  } catch (err) { next(err); }
};

module.exports = {
  getNextJobNumber,
  getJobByNumber,
  getAllJobs,
  getJobById,
  getJobDetails,
  createJob,
  updateJob,
  updateJobStatus,
  updateJobState,
  updateInProduction,
  startJob,
  pauseJob,
  resumeJob,
  markJobDone,
  approveJob,
  rejectJob,
  assignJob,
  reassignJob,
  completeJob,
  deliverJob,
  getCompletedAndPaidJobs,
  deleteJob,
  getJobsByDepartment,
};
