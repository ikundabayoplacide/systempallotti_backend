const DepartmentSample = require('../database/models/DepartmentSample');
const DepartmentSampleDocument = require('../database/models/DepartmentSampleDocument');
const Department = require('../database/models/Department');
const User = require('../database/models/User');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

const userAttrs = ['id', 'name', 'role'];

const sampleIncludes = [
  { model: Department, as: 'department', attributes: ['id', 'name'] },
  { model: User, as: 'createdBy', attributes: userAttrs },
  { model: User, as: 'reviewedBy', attributes: userAttrs },
  {
    model: DepartmentSampleDocument, as: 'documents',
    attributes: ['id', 'fileName', 'mimeType', 'fileUrl', 'createdAt'],
    include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'name'] }],
  },
];

/**
 * GET /api/department-samples
 * - SUPERVISOR: sees only their own department's samples
 * - PRODUCTION_MANAGER / ADMIN: sees all, filterable by ?departmentId
 */
const getAllSamples = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, departmentId } = req.query;

    const where = {};
    if (status) where.status = status;

    if (req.user.role === 'SUPERVISOR') {
      // Supervisor only sees their own department
      where.departmentId = req.user.departmentId;
    } else if (departmentId) {
      where.departmentId = departmentId;
    }

    const { count, rows } = await DepartmentSample.findAndCountAll({
      where,
      offset: skip,
      limit,
      order: [['createdAt', 'DESC']],
      include: sampleIncludes,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/department-samples/:id
 */
const getSampleById = async (req, res, next) => {
  try {
    const sample = await DepartmentSample.findByPk(req.params.id, { include: sampleIncludes });
    if (!sample) return error(res, 'Sample not found.', 404);

    // Supervisor can only see their own department
    if (req.user.role === 'SUPERVISOR' && sample.departmentId !== req.user.departmentId) {
      return error(res, 'Forbidden.', 403);
    }

    return success(res, sample);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/department-samples
 * Supervisor creates a sample for their department
 */
const createSample = async (req, res, next) => {
  try {
    const { name, description, quantity, unit, sampleDate, notes } = req.body;

    // Supervisor's departmentId comes from their user profile
    // ADMIN/PM can pass departmentId explicitly
    const departmentId = req.user.role === 'SUPERVISOR'
      ? req.user.departmentId
      : req.body.departmentId;

    if (!departmentId) return error(res, 'departmentId is required.', 400);

    const dept = await Department.findByPk(departmentId);
    if (!dept) return error(res, 'Department not found.', 404);

    const referenceNo = await DepartmentSample.generateRefNo();

    const sample = await DepartmentSample.create({
      departmentId,
      createdById: req.user.id,
      name: name || null,
      description: description || null,
      quantity: quantity || null,
      unit: unit || null,
      sampleDate: sampleDate || null,
      referenceNo,
      notes: notes || null,
    });

    if (req.files && req.files.length > 0) {
      await Promise.all(req.files.map((file) =>
        DepartmentSampleDocument.create({
          sampleId: sample.id,
          uploadedById: req.user.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        })
      ));
    }

    const created = await DepartmentSample.findByPk(sample.id, { include: sampleIncludes });
    return success(res, created, 'Sample created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/department-samples/:id
 * Only creator (supervisor) or admin can edit, and only while pending
 */
const updateSample = async (req, res, next) => {
  try {
    const sample = await DepartmentSample.findByPk(req.params.id);
    if (!sample) return error(res, 'Sample not found.', 404);

    if (req.user.role === 'SUPERVISOR' && sample.createdById !== req.user.id) {
      return error(res, 'Forbidden.', 403);
    }

    if (sample.status !== 'pending') {
      return error(res, `Cannot edit a sample with status "${sample.status}".`, 400);
    }

    const { name, description, quantity, unit, sampleDate, notes } = req.body;

    await sample.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(quantity !== undefined && { quantity }),
      ...(unit !== undefined && { unit }),
      ...(sampleDate !== undefined && { sampleDate }),
      ...(notes !== undefined && { notes }),
    });

    // Append new documents if any
    if (req.files && req.files.length > 0) {
      await Promise.all(req.files.map((file) =>
        DepartmentSampleDocument.create({
          sampleId: sample.id,
          uploadedById: req.user.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        })
      ));
    }

    const updated = await DepartmentSample.findByPk(sample.id, { include: sampleIncludes });
    return success(res, updated, 'Sample updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/department-samples/:id/review
 * PM marks sample as reviewed / approved / rejected
 */
const reviewSample = async (req, res, next) => {
  try {
    const sample = await DepartmentSample.findByPk(req.params.id);
    if (!sample) return error(res, 'Sample not found.', 404);

    const { status, reviewNote } = req.body;
    const allowed = ['reviewed', 'approved', 'rejected'];
    if (!allowed.includes(status)) {
      return error(res, `Invalid status. Allowed: ${allowed.join(', ')}.`, 400);
    }

    await sample.update({
      status,
      reviewedById: req.user.id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || null,
    });

    const updated = await DepartmentSample.findByPk(sample.id, { include: sampleIncludes });
    return success(res, updated, `Sample marked as ${status}.`);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/department-samples/:id
 */
const deleteSample = async (req, res, next) => {
  try {
    const sample = await DepartmentSample.findByPk(req.params.id);
    if (!sample) return error(res, 'Sample not found.', 404);

    if (req.user.role === 'SUPERVISOR' && sample.createdById !== req.user.id) {
      return error(res, 'Forbidden.', 403);
    }

    await DepartmentSampleDocument.destroy({ where: { sampleId: sample.id } });
    await sample.destroy();

    return success(res, null, 'Sample deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/department-samples/:id/documents/:docId
 */
const deleteSampleDocument = async (req, res, next) => {
  try {
    const doc = await DepartmentSampleDocument.findOne({
      where: { id: req.params.docId, sampleId: req.params.id },
    });
    if (!doc) return error(res, 'Document not found.', 404);
    await doc.destroy();
    return success(res, null, 'Document deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllSamples, getSampleById, createSample, updateSample, reviewSample, deleteSample, deleteSampleDocument };
