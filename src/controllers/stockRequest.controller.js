const StockRequest = require('../database/models/StockRequest');
const StockRequestItem = require('../database/models/StockRequestItem');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const requestIncludes = [
  { model: StockRequestItem, as: 'items' },
  { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email', 'role'] },
  { model: User, as: 'responder', attributes: ['id', 'name', 'email'], required: false },
];

const getAllRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await StockRequest.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: requestIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { requestedById: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await StockRequest.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: requestIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await StockRequest.findByPk(req.params.id, { include: requestIncludes });
    if (!request) return error(res, 'Request not found.', 404);
    return success(res, request);
  } catch (err) {
    next(err);
  }
};

const createRequest = async (req, res, next) => {
  try {
    const { notes, items } = req.body;

    if (!items || items.length === 0)
      return error(res, 'At least one item is required.', 422);

    for (const item of items) {
      if (!item.itemName || !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0 || !item.unit)
        return error(res, 'Each item must have itemName, unit, quantity and unitPrice.', 422);
    }

    const requestNumber = await StockRequest.generateRequestNumber();

    const request = await StockRequest.create({
      requestNumber,
      requestedById: req.user.id,
      notes: notes || null,
    });

    await Promise.all(
      items.map((item) =>
        StockRequestItem.create({
          stockRequestId: request.id,
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalAmount: item.quantity * item.unitPrice,
        })
      )
    );

    await notify({
      createdById: req.user.id,
      title: 'Stock Request Submitted',
      message: `A new stock request (${requestNumber}) has been submitted with ${items.length} item(s).`,
      type: 'STOCK_REQUEST',
      relatedEntityType: 'stockRequest',
      relatedEntityId: request.id,
      targetRoles: ['ADMIN', 'DAF'],
    });

    const created = await StockRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, created, 'Stock request submitted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const request = await StockRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.requestedById !== req.user.id) return error(res, 'Forbidden.', 403);
    if (request.status !== 'pending') return error(res, 'Only pending requests can be edited.', 409);

    const { notes, items } = req.body;

    if (!items || items.length === 0)
      return error(res, 'At least one item is required.', 422);

    for (const item of items) {
      if (!item.itemName || !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0 || !item.unit)
        return error(res, 'Each item must have itemName, unit, quantity and unitPrice.', 422);
    }

    await request.update({ notes: notes ?? request.notes });

    await StockRequestItem.destroy({ where: { stockRequestId: request.id } });
    await Promise.all(
      items.map((item) =>
        StockRequestItem.create({
          stockRequestId: request.id,
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalAmount: item.quantity * item.unitPrice,
        })
      )
    );

    const updated = await StockRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request updated successfully.');
  } catch (err) {
    next(err);
  }
};

const approveRequest = async (req, res, next) => {
  try {
    const request = await StockRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.status !== 'pending') return error(res, `Request is already '${request.status}'.`, 409);

    await request.update({
      status: 'approved',
      responseNotes: req.body.responseNotes || null,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    });

    await notify({
      createdById: req.user.id,
      title: 'Stock Request Approved',
      message: `Your stock request (${request.requestNumber}) has been approved.`,
      type: 'STOCK_REQUEST',
      relatedEntityType: 'stockRequest',
      relatedEntityId: request.id,
      targetUserIds: [request.requestedById],
    });

    const updated = await StockRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request approved.');
  } catch (err) {
    next(err);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const request = await StockRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.status !== 'pending') return error(res, `Request is already '${request.status}'.`, 409);

    await request.update({
      status: 'rejected',
      responseNotes: req.body.responseNotes || null,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    });

    await notify({
      createdById: req.user.id,
      title: 'Stock Request Rejected',
      message: `Your stock request (${request.requestNumber}) has been rejected.${req.body.responseNotes ? ` Reason: ${req.body.responseNotes}` : ''}`,
      type: 'STOCK_REQUEST',
      relatedEntityType: 'stockRequest',
      relatedEntityId: request.id,
      targetUserIds: [request.requestedById],
    });

    const updated = await StockRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request rejected.');
  } catch (err) {
    next(err);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const request = await StockRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.requestedById !== req.user.id) return error(res, 'Forbidden.', 403);
    if (request.status !== 'pending') return error(res, 'Only pending requests can be deleted.', 409);

    await StockRequestItem.destroy({ where: { stockRequestId: request.id } });
    await request.destroy();

    return success(res, null, 'Request deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllRequests, getMyRequests, getRequestById, createRequest, updateRequest, deleteRequest, approveRequest, rejectRequest };
