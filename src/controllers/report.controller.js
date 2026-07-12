const { Op, literal } = require('sequelize');
const Report = require('../database/models/Report');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');
const notify = require('../utils/notification.service');

const reportIncludes = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role', 'phone'] },
  { model: User, as: 'supervisor', attributes: ['id', 'name', 'email', 'role', 'phone'], required: false },
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

    const supervisorId = req.body.supervisorId || null;

    const attachmentUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

    const report = await Report.create({
      title,
      purpose,
      items,
      notes: notes || null,
      attachmentUrl,
      createdById: req.user.id,
      visibleTo,
      supervisorId,
    });

    await notify({
      createdById: req.user.id,
      title: 'Report Generated',
      message: `A new report "${title}" has been generated.${purpose ? ` Purpose: ${purpose}` : ''}`,
      type: 'REPORT_GENERATED',
      relatedEntityType: 'report',
      relatedEntityId: report.id,
      targetRoles: visibleTo || ['ADMIN'],
      targetUserIds: supervisorId ? [supervisorId] : [],
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

    // Admin and DAF can see all reports
    const whereCondition = ['ADMIN', 'DAF'].includes(userRole)
      ? {}
      : {
          [Op.or]: [
            // Reports with a specific supervisor → only that supervisor sees it
            { supervisorId: req.user.id },
            // Reports with no supervisorId → fall back to role-based visibleTo
            {
              supervisorId: null,
              [Op.or]: [
                literal(`JSON_CONTAINS(\`Report\`.\`visible_to\`, '"${userRole}"')`),
                { visibleTo: null },
              ],
            },
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
    if (!['ADMIN', 'DAF'].includes(userRole)) {
      whereCondition[Op.or] = [
        { createdById: req.user.id },
        { supervisorId: req.user.id },
        {
          supervisorId: null,
          [Op.or]: [
            literal(`JSON_CONTAINS(\`Report\`.\`visible_to\`, '"${userRole}"')`),
            { visibleTo: null },
          ],
        },
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

    const supervisorId = req.body.supervisorId !== undefined ? (req.body.supervisorId || null) : report.supervisorId;

    const attachmentUrl = req.file ? `/uploads/reports/${req.file.filename}` : report.attachmentUrl;

    await report.update({
      ...(title !== undefined && { title }),
      ...(purpose !== undefined && { purpose }),
      ...(notes !== undefined && { notes }),
      items,
      attachmentUrl,
      visibleTo,
      supervisorId,
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
        createdById: { [Op.ne]: req.user.id },
        [Op.or]: [
          { supervisorId: req.user.id },
          {
            supervisorId: null,
            [Op.and]: [literal(`JSON_CONTAINS(\`Report\`.\`visible_to\`, '"${userRole}"')`)],
          },
        ],
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
