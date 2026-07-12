const ReceptionRequest = require('../database/models/ReceptionRequest');
const ReceptionRequestItem = require('../database/models/ReceptionRequestItem');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const requestIncludes = [
  { model: ReceptionRequestItem, as: 'items' },
  { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email', 'role'] },
  { model: User, as: 'responder', attributes: ['id', 'name', 'email', 'role'], required: false },
];

/**
 * POST /api/reception-requests
 */
const createRequest = async (req, res, next) => {
  try {
    const { notes, items } = req.body;

    if (!items || items.length === 0)
      return error(res, 'At least one item is required.', 422);

    for (const item of items) {
      if (!item.itemName || !item.quantity || !item.unit)
        return error(res, 'Each item must have itemName, quantity, and unit.', 422);
    }

    const requestNumber = await ReceptionRequest.generateRequestNumber();

    const request = await ReceptionRequest.create({
      requestNumber,
      requestedById: req.user.id,
      notes: notes || null,
    });

    await Promise.all(
      items.map((item) =>
        ReceptionRequestItem.create({
          receptionRequestId: request.id,
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice || 0,
          totalAmount: (item.quantity || 0) * (item.unitPrice || 0),
        })
      )
    );

    await notify({
      createdById: req.user.id,
      title: 'New Reception Material Request',
      message: `${req.user.name} submitted a material request (${requestNumber}).`,
      type: 'GENERAL',
      relatedEntityType: 'reception_request',
      relatedEntityId: request.id,
      targetRoles: ['ADMIN', 'DAF'],
    });

    const created = await ReceptionRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, created, 'Request submitted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reception-requests/my
 */
const getMyRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { requestedById: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await ReceptionRequest.findAndCountAll({
      where, offset: skip, limit,
      order: [['createdAt', 'DESC']],
      include: requestIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reception-requests
 */
const getAllRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await ReceptionRequest.findAndCountAll({
      where, offset: skip, limit,
      order: [['createdAt', 'DESC']],
      include: requestIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reception-requests/:id
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await ReceptionRequest.findByPk(req.params.id, { include: requestIncludes });
    if (!request) return error(res, 'Request not found.', 404);
    return success(res, request);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reception-requests/:id
 */
const updateRequest = async (req, res, next) => {
  try {
    const request = await ReceptionRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.requestedById !== req.user.id) return error(res, 'Forbidden.', 403);
    if (request.status !== 'pending') return error(res, 'Only pending requests can be edited.', 409);

    const { notes, items } = req.body;

    await request.update({ ...(notes !== undefined && { notes }) });

    if (items && items.length > 0) {
      await ReceptionRequestItem.destroy({ where: { receptionRequestId: request.id } });
      await Promise.all(
        items.map((item) =>
          ReceptionRequestItem.create({
            receptionRequestId: request.id,
            itemName: item.itemName,
            description: item.description || null,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice || 0,
            totalAmount: (item.quantity || 0) * (item.unitPrice || 0),
          })
        )
      );
    }

    const updated = await ReceptionRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/reception-requests/:id
 */
const deleteRequest = async (req, res, next) => {
  try {
    const request = await ReceptionRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.requestedById !== req.user.id && req.user.role !== 'ADMIN')
      return error(res, 'Forbidden.', 403);
    if (request.status !== 'pending') return error(res, 'Only pending requests can be deleted.', 409);

    await request.destroy();
    return success(res, null, 'Request deleted.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reception-requests/:id/approve
 */
const approveRequest = async (req, res, next) => {
  try {
    const request = await ReceptionRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.status !== 'pending') return error(res, `Request is already ${request.status}.`, 409);

    await request.update({
      status: 'approved',
      responseNotes: req.body.responseNotes || null,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    });

    await notify({
      createdById: req.user.id,
      title: 'Material Request Approved',
      message: `Your material request (${request.requestNumber}) has been approved.`,
      type: 'GENERAL',
      relatedEntityType: 'reception_request',
      relatedEntityId: request.id,
      targetUserIds: [request.requestedById],
      targetRoles: [],
    });

    const updated = await ReceptionRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request approved.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reception-requests/:id/reject
 */
const rejectRequest = async (req, res, next) => {
  try {
    const request = await ReceptionRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.status !== 'pending') return error(res, `Request is already ${request.status}.`, 409);

    await request.update({
      status: 'rejected',
      responseNotes: req.body.responseNotes || null,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    });

    await notify({
      createdById: req.user.id,
      title: 'Material Request Rejected',
      message: `Your material request (${request.requestNumber}) has been rejected.${req.body.responseNotes ? ` Reason: ${req.body.responseNotes}` : ''}`,
      type: 'GENERAL',
      relatedEntityType: 'reception_request',
      relatedEntityId: request.id,
      targetUserIds: [request.requestedById],
      targetRoles: [],
    });

    const updated = await ReceptionRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request rejected.');
  } catch (err) {
    next(err);
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, getRequestById, updateRequest, deleteRequest, approveRequest, rejectRequest };
