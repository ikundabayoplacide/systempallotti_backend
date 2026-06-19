const { Op } = require('sequelize');
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

    let visibleTo = null;
    if (req.body.visibleTo) {
      try {
        visibleTo = typeof req.body.visibleTo === 'string' ? JSON.parse(req.body.visibleTo) : req.body.visibleTo;
        if (!Array.isArray(visibleTo) || visibleTo.length === 0) {
          return error(res, 'visibleTo must be a non-empty array of role names.', 400);
        }
      } catch {
        return error(res, 'Invalid visibleTo format. Must be a JSON array.', 400);
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
      visibleTo,
    });

    await notify({
      createdById: req.user.id,
      title: 'Report Generated',
      message: `A new report "${title}" has been generated.${purpose ? ` Purpose: ${purpose}` : ''}`,
      type: 'REPORT_GENERATED',
      relatedEntityType: 'report',
      relatedEntityId: report.id,
      targetRoles: visibleTo || ['ADMIN'],
    });

    const created = await Report.findByPk(report.id, { include: reportIncludes });
    return success(res, created, 'Report created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/my
 * Returns only reports created by the user
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
 * Returns all reports that the user's role can view
 */
const getAllReports = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const userRole = req.user.role;

    // Admin can see all reports
    const whereCondition = userRole === 'ADMIN' 
      ? {} 
      : {
          [Op.or]: [
            { visibleTo: { [Op.contains]: [userRole] } },
            { visibleTo: null }, // legacy reports with no visibility set
          ],
        };

    const { count, rows } = await Report.findAndCountAll({
      where: whereCondition,
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
    const userRole = req.user.role;
    
    // Build where condition to check visibility
    const whereCondition = { id: req.params.id };
    if (userRole !== 'ADMIN') {
      whereCondition[Op.or] = [
        { visibleTo: { [Op.contains]: [userRole] } },
        { visibleTo: null }, // legacy reports
        { createdById: req.user.id }, // creator can always see their own reports
      ];
    }

    const report = await Report.findOne({ 
      where: whereCondition,
      include: reportIncludes 
    });
    
    if (!report) return error(res, 'Report not found or you do not have permission to view it.', 404);
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

    // Only the creator can update the report
    if (report.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return error(res, 'You can only update reports you created.', 403);
    }

    const { title, purpose, notes } = req.body;

    let items = report.items;
    if (req.body.items) {
      try {
        items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
      } catch {
        return error(res, 'Invalid items format. Must be a JSON array.', 400);
      }
    }

    let visibleTo = report.visibleTo;
    if (req.body.visibleTo !== undefined) {
      if (req.body.visibleTo) {
        try {
          visibleTo = typeof req.body.visibleTo === 'string' ? JSON.parse(req.body.visibleTo) : req.body.visibleTo;
          if (!Array.isArray(visibleTo) || visibleTo.length === 0) {
            return error(res, 'visibleTo must be a non-empty array of role names.', 400);
          }
        } catch {
          return error(res, 'Invalid visibleTo format. Must be a JSON array.', 400);
        }
      } else {
        visibleTo = null;
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
      visibleTo,
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

/**
 * GET /api/reports/assigned
 * Returns only reports where the user's role is in visibleTo (excludes own reports)
 */
const getAssignedReports = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const userRole = req.user.role;

    const { count, rows } = await Report.findAndCountAll({
      where: {
        visibleTo: { [Op.contains]: [userRole] },
        createdById: { [Op.ne]: req.user.id }, // exclude own reports
      },
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

module.exports = { createReport, getAllReports, getReportById, updateReport, deleteReport, getMyReports, getAssignedReports };
