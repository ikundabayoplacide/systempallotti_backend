const Report = require('../database/models/Report');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const reportIncludes = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] },
];

/**
 * POST /api/reports
 */
const createReport = async (req, res, next) => {
  try {
    const { title, purpose, notes } = req.body;

    let items = [];
    if (req.body.items) {
      try {
        items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
      } catch {
        return error(res, 'Invalid items format. Must be a JSON array.', 400);
      }
    }

    const attachmentUrl = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : null;

    const report = await Report.create({
      title,
      purpose,
      items,
      notes: notes || null,
      attachmentUrl,
      createdById: req.user.id,
    });

    await notify({
      createdById: req.user.id,
      title: 'Report Generated',
      message: `A new report "${title}" has been generated.${purpose ? ` Purpose: ${purpose}` : ''}`,
      type: 'REPORT_GENERATED',
      relatedEntityType: 'report',
      relatedEntityId: report.id,
      targetRoles: ['ADMIN', 'DAF'],
    });

    const created = await Report.findByPk(report.id, { include: reportIncludes });
    return success(res, created, 'Report created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/my
 */
const getMyReports = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const { count, rows } = await Report.findAndCountAll({
      where: { createdById: req.user.id },
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: reportIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports
 */
const getAllReports = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const { count, rows } = await Report.findAndCountAll({
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: reportIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/:id
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id, { include: reportIncludes });
    if (!report) return error(res, 'Report not found.', 404);
    return success(res, report);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reports/:id
 */
const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return error(res, 'Report not found.', 404);

    const { title, purpose, notes } = req.body;

    let items = report.items;
    if (req.body.items) {
      try {
        items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
      } catch {
        return error(res, 'Invalid items format. Must be a JSON array.', 400);
      }
    }

    const attachmentUrl = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : report.attachmentUrl;

    await report.update({
      ...(title !== undefined && { title }),
      ...(purpose !== undefined && { purpose }),
      ...(notes !== undefined && { notes }),
      items,
      attachmentUrl,
    });

    const updated = await Report.findByPk(report.id, { include: reportIncludes });
    return success(res, updated, 'Report updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/reports/:id
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return error(res, 'Report not found.', 404);
    await report.destroy();
    return success(res, null, 'Report deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, getAllReports, getReportById, updateReport, deleteReport, getMyReports };
