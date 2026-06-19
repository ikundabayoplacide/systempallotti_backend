const { Op } = require('sequelize');
const ProcurementLead = require('../database/models/ProcurementLead');
const ProcurementLeadDocument = require('../database/models/ProcurementLeadDocument');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const STAGES = ['prospect', 'contacted', 'negotiating', 'won', 'lost'];

const leadIncludes = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] },
  { model: ProcurementLeadDocument, as: 'documents', attributes: ['id', 'fileName', 'mimeType', 'fileUrl', 'uploadedById', 'createdAt'] },
];

/**
 * GET /api/procurement/stats
 * KPI cards + pipeline overview data for the frontend dashboard.
 */
const getStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Fetch all leads once and compute everything in JS to avoid multiple DB round-trips
    const all = await ProcurementLead.findAll({ attributes: ['stage', 'estimatedValue', 'nextFollowUp'] });

    const totalLeads = all.length;
    const inProgress = all.filter((l) => ['contacted', 'negotiating'].includes(l.stage)).length;
    const wonCount = all.filter((l) => l.stage === 'won').length;
    const overdueFollowUps = all.filter(
      (l) => l.nextFollowUp && new Date(l.nextFollowUp) < now && l.stage !== 'won' && l.stage !== 'lost'
    ).length;
    const wonValue = all
      .filter((l) => l.stage === 'won')
      .reduce((sum, l) => sum + parseFloat(l.estimatedValue || 0), 0);

    // Pipeline overview — count and total estimated value per stage
    const pipeline = STAGES.map((stage) => {
      const stageLeads = all.filter((l) => l.stage === stage);
      return {
        stage,
        count: stageLeads.length,
        totalValue: stageLeads.reduce((sum, l) => sum + parseFloat(l.estimatedValue || 0), 0),
      };
    });

    return success(res, {
      kpi: { totalLeads, inProgress, wonCount, overdueFollowUps, wonValue },
      pipeline,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/procurement
 * List all leads with search, sector, stage filters + pagination.
 */
const getAllLeads = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, sector, stage } = req.query;

    const where = {};
    if (sector) where.sector = sector;
    if (stage) where.stage = stage;

    if (search) {
      where[Op.or] = [
        { company: { [Op.iLike]: `%${search}%` } },
        { contactPerson: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await ProcurementLead.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: leadIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/procurement/:id
 */
const getLeadById = async (req, res, next) => {
  try {
    const lead = await ProcurementLead.findByPk(req.params.id, { include: leadIncludes });
    if (!lead) return error(res, 'Lead not found.', 404);
    return success(res, lead);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/procurement
 */
const createLead = async (req, res, next) => {
  try {
    const { company, contactPerson, phone, email, sector, stage, estimatedValue, location, nextFollowUp, notes } = req.body;

    const lead = await ProcurementLead.create({
      company,
      contactPerson,
      phone,
      email: email || null,
      sector: sector || null,
      stage: stage || 'prospect',
      estimatedValue: estimatedValue || null,
      location: location || null,
      nextFollowUp: nextFollowUp || null,
      notes: notes || null,
      createdById: req.user.id,
    });

    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          ProcurementLeadDocument.create({
            procurementLeadId: lead.id,
            uploadedById: req.user.id,
            fileName: file.originalname,
            mimeType: file.mimetype,
            fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          })
        )
      );
    }

    const created = await ProcurementLead.findByPk(lead.id, { include: leadIncludes });
    return success(res, created, 'Lead created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/procurement/:id
 */
const updateLead = async (req, res, next) => {
  try {
    const lead = await ProcurementLead.findByPk(req.params.id);
    if (!lead) return error(res, 'Lead not found.', 404);

    const { company, contactPerson, phone, email, sector, stage, estimatedValue, location, nextFollowUp, notes } = req.body;

    await lead.update({
      ...(company !== undefined && { company }),
      ...(contactPerson !== undefined && { contactPerson }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(sector !== undefined && { sector }),
      ...(stage !== undefined && { stage }),
      ...(estimatedValue !== undefined && { estimatedValue }),
      ...(location !== undefined && { location }),
      ...(nextFollowUp !== undefined && { nextFollowUp }),
      ...(notes !== undefined && { notes }),
    });

    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          ProcurementLeadDocument.create({
            procurementLeadId: lead.id,
            uploadedById: req.user.id,
            fileName: file.originalname,
            mimeType: file.mimetype,
            fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          })
        )
      );
    }

    const updated = await ProcurementLead.findByPk(lead.id, { include: leadIncludes });
    return success(res, updated, 'Lead updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/procurement/:id/stage
 * Quick stage update from the pipeline board.
 */
const updateLeadStage = async (req, res, next) => {
  try {
    const lead = await ProcurementLead.findByPk(req.params.id);
    if (!lead) return error(res, 'Lead not found.', 404);

    const { stage } = req.body;
    if (!STAGES.includes(stage)) {
      return error(res, `Invalid stage. Must be one of: ${STAGES.join(', ')}.`, 400);
    }

    await lead.update({ stage });
    return success(res, { id: lead.id, company: lead.company, stage: lead.stage }, 'Lead stage updated.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/procurement/:id
 */
const deleteLead = async (req, res, next) => {
  try {
    const lead = await ProcurementLead.findByPk(req.params.id);
    if (!lead) return error(res, 'Lead not found.', 404);

    await lead.destroy();
    return success(res, null, 'Lead deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getAllLeads, getLeadById, createLead, updateLead, updateLeadStage, deleteLead };
