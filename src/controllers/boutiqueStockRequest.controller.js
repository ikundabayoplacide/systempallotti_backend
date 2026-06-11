const BoutiqueStockRequest = require('../database/models/BoutiqueStockRequest');
const BoutiqueStockRequestItem = require('../database/models/BoutiqueStockRequestItem');
const BoutiqueProduct = require('../database/models/BoutiqueProduct');
const BoutiqueStockMovement = require('../database/models/BoutiqueStockMovement');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const requestIncludes = [
  {
    model: BoutiqueStockRequestItem,
    as: 'items',
    include: [
      {
        model: BoutiqueProduct,
        as: 'product',
        attributes: ['id', 'sku', 'name', 'unit', 'stock'],
      },
    ],
  },
  { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email', 'role'] },
  { model: User, as: 'responder', attributes: ['id', 'name', 'email'], required: false },
];

/**
 * GET /api/boutique-stock-requests
 * STOCK / ADMIN sees all requests.
 */
const getAllRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await BoutiqueStockRequest.findAndCountAll({
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

/**
 * GET /api/boutique-stock-requests/my
 * Receptionist sees their own requests.
 */
const getMyRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { requestedById: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await BoutiqueStockRequest.findAndCountAll({
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

/**
 * GET /api/boutique-stock-requests/:id
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await BoutiqueStockRequest.findByPk(req.params.id, { include: requestIncludes });
    if (!request) return error(res, 'Request not found.', 404);
    return success(res, request);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/boutique-stock-requests
 * Receptionist submits a new request.
 * Body: { notes?, items: [{ productId, quantity }] }
 */
const createRequest = async (req, res, next) => {
  try {
    const { notes, items } = req.body;

    if (!items || items.length === 0)
      return error(res, 'At least one product is required.', 422);

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0)
        return error(res, 'Each item must have a valid productId and quantity.', 422);
    }

    // Validate all products exist
    const productIds = items.map((i) => i.productId);
    const products = await BoutiqueProduct.findAll({ where: { id: productIds, isActive: true } });
    if (products.length !== productIds.length)
      return error(res, 'One or more products not found.', 404);

    const requestNumber = await BoutiqueStockRequest.generateRequestNumber();

    const request = await BoutiqueStockRequest.create({
      requestNumber,
      requestedById: req.user.id,
      notes: notes || null,
    });

    await Promise.all(
      items.map((item) =>
        BoutiqueStockRequestItem.create({
          boutiqueStockRequestId: request.id,
          productId: item.productId,
          quantity: item.quantity,
        })
      )
    );

    const created = await BoutiqueStockRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, created, 'Stock request submitted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/boutique-stock-requests/:id/approve
 * STOCK approves → boutique product stock is incremented automatically.
 */
const approveRequest = async (req, res, next) => {
  try {
    const request = await BoutiqueStockRequest.findByPk(req.params.id, {
      include: [{ model: BoutiqueStockRequestItem, as: 'items' }],
    });
    if (!request) return error(res, 'Request not found.', 404);
    if (request.status !== 'pending') return error(res, `Request is already '${request.status}'.`, 409);

    // Increment boutique stock for each requested item
    for (const item of request.items) {
      const product = await BoutiqueProduct.findByPk(item.productId);
      if (!product) continue;

      const stockBefore = product.stock;
      const stockAfter = stockBefore + item.quantity;

      await product.update({ stock: stockAfter });

      await BoutiqueStockMovement.create({
        productId: product.id,
        changedById: req.user.id,
        change: item.quantity,
        reason: `Restocked via request ${request.requestNumber}`,
        stockBefore,
        stockAfter,
      });
    }

    await request.update({
      status: 'approved',
      responseNotes: req.body.responseNotes || null,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    });

    const updated = await BoutiqueStockRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request approved and boutique stock updated.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/boutique-stock-requests/:id/reject
 */
const rejectRequest = async (req, res, next) => {
  try {
    const request = await BoutiqueStockRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found.', 404);
    if (request.status !== 'pending') return error(res, `Request is already '${request.status}'.`, 409);

    await request.update({
      status: 'rejected',
      responseNotes: req.body.responseNotes || null,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    });

    const updated = await BoutiqueStockRequest.findByPk(request.id, { include: requestIncludes });
    return success(res, updated, 'Request rejected.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllRequests, getMyRequests, getRequestById, createRequest, approveRequest, rejectRequest };
