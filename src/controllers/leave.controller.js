const LeaveRequest = require('../database/models/LeaveRequest');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const leaveIncludes = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
  { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'email', 'role'], required: false },
];

/**
 * GET /api/leaves/my
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { userId: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await LeaveRequest.findAndCountAll({
      where, offset: skip, limit,
      order: [['createdAt', 'DESC']],
      include: leaveIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

/**
 * GET /api/leaves/department
 * Supervisor: see leaves from workers in the same department
 */
const getDepartmentLeaves = async (req, res, next) => {
  try {
    if (!req.user.departmentId) return error(res, 'You are not assigned to a department.', 403);

    const { page, limit, skip } = getPagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await LeaveRequest.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role'],
          where: { departmentId: req.user.departmentId },
        },
        { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'email', 'role'], required: false },
      ],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

/**
 * GET /api/leaves
 * HR / Admin only
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await LeaveRequest.findAndCountAll({
      where, offset: skip, limit,
      order: [['createdAt', 'DESC']],
      include: leaveIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

/**
 * GET /api/leaves/:id
 */
const getLeaveById = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByPk(req.params.id, { include: leaveIncludes });
    if (!leave) return error(res, 'Leave request not found.', 404);
    return success(res, leave);
  } catch (err) { next(err); }
};

/**
 * POST /api/leaves
 */
const createLeave = async (req, res, next) => {
  try {
    const { type, startDate, startTime, endDate, endTime, reason } = req.body;
    const documentUrl = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : req.body.documentUrl || null;

    if (new Date(endDate) < new Date(startDate))
      return error(res, 'End date cannot be before start date.', 422);

    const leave = await LeaveRequest.create({
      userId: req.user.id,
      type, startDate, startTime: startTime || null, endDate, endTime: endTime || null, reason,
      documentUrl: documentUrl || null,
    });

    await notify({
      createdById: req.user.id,
      title: 'New Leave Request',
      message: `${req.user.name} submitted a ${type} leave request from ${startDate}${startTime ? ' ' + startTime : ''} to ${endDate}${endTime ? ' ' + endTime : ''}.`,
      type: 'GENERAL',
      relatedEntityType: 'leave_request',
      relatedEntityId: leave.id,
      targetRoles: ['ADMIN', 'SUPERVISOR'],
    });

    const created = await LeaveRequest.findByPk(leave.id, { include: leaveIncludes });
    return success(res, created, 'Leave request submitted successfully.', 201);
  } catch (err) { next(err); }
};

/**
 * PATCH /api/leaves/:id/review
 * Body: { action: 'approve' | 'reject', rejectionReason? }
 */
const reviewLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByPk(req.params.id);
    if (!leave) return error(res, 'Leave request not found.', 404);
    if (leave.status !== 'PENDING') return error(res, `Leave is already ${leave.status}.`, 409);
    if (leave.userId === req.user.id) return error(res, 'You cannot review your own leave request.', 403);

    const { action, rejectionReason } = req.body;
    if (!['approve', 'reject'].includes(action))
      return error(res, 'Action must be approve or reject.', 422);

    if (action === 'reject' && !rejectionReason)
      return error(res, 'Rejection reason is required.', 422);

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    await leave.update({
      status,
      rejectionReason: action === 'reject' ? rejectionReason : null,
      reviewedById: req.user.id,
      reviewedAt: new Date(),
    });

    await notify({
      createdById: req.user.id,
      title: `Leave Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
      message: status === 'APPROVED'
        ? `Your ${leave.type} leave request has been approved.`
        : `Your ${leave.type} leave request has been rejected. Reason: ${rejectionReason}`,
      type: 'GENERAL',
      relatedEntityType: 'leave_request',
      relatedEntityId: leave.id,
      targetUserIds: [leave.userId],
      targetRoles: ['ADMIN'],
    });

    const updated = await LeaveRequest.findByPk(leave.id, { include: leaveIncludes });
    return success(res, updated, `Leave request ${status.toLowerCase()} successfully.`);
  } catch (err) { next(err); }
};

/**
 * DELETE /api/leaves/:id
 * Only owner can cancel their own PENDING request
 */
const cancelLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByPk(req.params.id);
    if (!leave) return error(res, 'Leave request not found.', 404);

    const isOwner = leave.userId === req.user.id;
    const isAdmin = ['ADMIN'].includes(req.user.role);

    if (!isOwner && !isAdmin) return error(res, 'Forbidden.', 403);
    if (leave.status !== 'PENDING') return error(res, 'Only pending requests can be cancelled.', 409);

    await leave.destroy();
    return success(res, null, 'Leave request cancelled.');
  } catch (err) { next(err); }
};

/**
 * POST /api/leaves/upload-document
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No file uploaded.', 400);

    const documentUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    return success(res, { url: documentUrl }, 'Document uploaded successfully.');
  } catch (err) { next(err); }
};

/**
 * PUT /api/leaves/:id
 * Owner can edit their own PENDING leave request.
 */
const updateLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByPk(req.params.id);
    if (!leave) return error(res, 'Leave request not found.', 404);
    if (leave.userId !== req.user.id) return error(res, 'Forbidden.', 403);
    if (leave.status !== 'PENDING') return error(res, 'Only pending leave requests can be edited.', 409);

    const { type, startDate, startTime, endDate, endTime, reason } = req.body;
    const documentUrl = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : req.body.documentUrl !== undefined ? req.body.documentUrl : undefined;

    const newStart = startDate || leave.startDate;
    const newEnd = endDate || leave.endDate;
    if (new Date(newEnd) < new Date(newStart))
      return error(res, 'End date cannot be before start date.', 422);

    await leave.update({
      ...(type !== undefined && { type }),
      ...(startDate !== undefined && { startDate }),
      ...(startTime !== undefined && { startTime: startTime || null }),
      ...(endDate !== undefined && { endDate }),
      ...(endTime !== undefined && { endTime: endTime || null }),
      ...(reason !== undefined && { reason }),
      ...(documentUrl !== undefined && { documentUrl }),
    });

    const updated = await LeaveRequest.findByPk(leave.id, { include: leaveIncludes });
    return success(res, updated, 'Leave request updated successfully.');
  } catch (err) { next(err); }
};

module.exports = { getMyLeaves, getAllLeaves, getDepartmentLeaves, getLeaveById, createLeave, updateLeave, reviewLeave, cancelLeave, uploadDocument };
