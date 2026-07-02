const JobSpec = require('../database/models/JobSpec');
const JobSpecDocument = require('../database/models/JobSpecDocument');
const Job = require('../database/models/Job');
const User = require('../database/models/User');
const { success, error } = require('../utils/apiResponse');

const specIncludes = [
  { model: User, as: 'addedBy', attributes: ['id', 'name', 'role'] },
  {
    model: JobSpecDocument, as: 'documents',
    attributes: ['id', 'fileName', 'mimeType', 'fileUrl', 'createdAt'],
    include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'name'] }],
  },
];

/**
 * GET /api/jobs/:jobId/specs
 */
const getJobSpecs = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) return error(res, 'Job not found.', 404);

    const specs = await JobSpec.findAll({
      where: { jobId: req.params.jobId },
      order: [['createdAt', 'DESC']],
      include: specIncludes,
    });

    return success(res, specs);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:jobId/specs/:id
 */
const getJobSpecById = async (req, res, next) => {
  try {
    const spec = await JobSpec.findOne({
      where: { id: req.params.id, jobId: req.params.jobId },
      include: specIncludes,
    });
    if (!spec) return error(res, 'Spec not found.', 404);
    return success(res, spec);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs/:jobId/specs
 */
const createJobSpec = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) return error(res, 'Job not found.', 404);

    const { description, paperType, paperWeight, size, colors, finishType, quantity, materials, notes } = req.body;

    const spec = await JobSpec.create({
      jobId: req.params.jobId,
      addedById: req.user.id,
      description, paperType, paperWeight, size, colors, finishType, quantity, materials, notes,
    });

    if (req.files && req.files.length > 0) {
      await Promise.all(req.files.map((file) =>
        JobSpecDocument.create({
          jobSpecId: spec.id,
          uploadedById: req.user.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        })
      ));
    }

    const created = await JobSpec.findByPk(spec.id, { include: specIncludes });
    return success(res, created, 'Job spec created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/jobs/:jobId/specs/:id
 */
const updateJobSpec = async (req, res, next) => {
  try {
    const spec = await JobSpec.findOne({ where: { id: req.params.id, jobId: req.params.jobId } });
    if (!spec) return error(res, 'Spec not found.', 404);

    const { description, paperType, paperWeight, size, colors, finishType, quantity, materials, notes } = req.body;

    await spec.update({
      ...(description !== undefined && { description }),
      ...(paperType !== undefined && { paperType }),
      ...(paperWeight !== undefined && { paperWeight }),
      ...(size !== undefined && { size }),
      ...(colors !== undefined && { colors }),
      ...(finishType !== undefined && { finishType }),
      ...(quantity !== undefined && { quantity }),
      ...(materials !== undefined && { materials }),
      ...(notes !== undefined && { notes }),
    });

    // Append new documents if any
    if (req.files && req.files.length > 0) {
      await Promise.all(req.files.map((file) =>
        JobSpecDocument.create({
          jobSpecId: spec.id,
          uploadedById: req.user.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        })
      ));
    }

    const updated = await JobSpec.findByPk(spec.id, { include: specIncludes });
    return success(res, updated, 'Job spec updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/jobs/:jobId/specs/:id
 */
const deleteJobSpec = async (req, res, next) => {
  try {
    const spec = await JobSpec.findOne({ where: { id: req.params.id, jobId: req.params.jobId } });
    if (!spec) return error(res, 'Spec not found.', 404);

    await JobSpecDocument.destroy({ where: { jobSpecId: spec.id } });
    await spec.destroy();

    return success(res, null, 'Job spec deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/jobs/:jobId/specs/:id/documents/:docId
 */
const deleteJobSpecDocument = async (req, res, next) => {
  try {
    const doc = await JobSpecDocument.findOne({ where: { id: req.params.docId, jobSpecId: req.params.id } });
    if (!doc) return error(res, 'Document not found.', 404);
    await doc.destroy();
    return success(res, null, 'Document deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getJobSpecs, getJobSpecById, createJobSpec, updateJobSpec, deleteJobSpec, deleteJobSpecDocument };
