const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

class Job extends Model {
  /**
   * Auto-generate the next job number in format JOB-YYYY-NNN
   */
  static async generateJobNumber() {
    const year = new Date().getFullYear();
    const lastJob = await Job.findOne({
      where: {
        jobNumber: { [Op.like]: `JOB-${year}-%` },
      },
      order: [['createdAt', 'DESC']],
      paranoid: false,
    });

    let nextNumber = 1;
    if (lastJob) {
      const parts = lastJob.jobNumber.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) nextNumber = lastSeq + 1;
    }

    return `JOB-${year}-${String(nextNumber).padStart(3, '0')}`;
  }
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Job title is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jobType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobFor: {
      type: DataTypes.ENUM('hobe', 'general'),
      allowNull: true,
      defaultValue: null,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [1], msg: 'Quantity must be at least 1' },
      },
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    colorMode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bindingType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'rejected',
        'ready-for-delivery',
        'partial-delivered',
        'delivered',
        'completed',
        'verified'
      ),
      defaultValue: 'pending',
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rejectReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    state: {
      type: DataTypes.ENUM(
        'in-composition',
        'in-montage',
        'in-printing',
        'in-binding',
        'in-packaging',
        'quality-check',
        'in-atelier',
        'composition-done',
        'montage-done',
        'printing-done',
        'binding-done',
        'packaging-done',
        'qualitycheck-done',
        'atelier-done'
      ),
      allowNull: true,
      defaultValue: null,
      comment: 'Production state — set on assignment; supervisor marks it done when department finishes',
    },
    inProduction: {
      type: DataTypes.ENUM('pending', 'inprogress', 'paused', 'done'),
      allowNull: true,
      defaultValue: null,
      comment: 'Production progress status updated by the worker',
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      comment: 'e.g. "2h 30m"',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    pausedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    progress: {
      type: DataTypes.ENUM('started', 'paused', 'resumed', 'completed'),
      allowNull: true,
      defaultValue: null,
      comment: 'Worker-driven progress state: started, paused, resumed, or completed',
    },
    resumedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Amount must be a positive number' },
      },
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid',
      allowNull: false,
    },
    quantityDelivered: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Cumulative quantity already delivered to the customer',
    },
    deliveredByName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name of person who received the delivery',
    },
    deliveredByContact: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Contact of person who received the delivery',
    },
    departmentAssignedToId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: true,
  }
);

// Valid status transitions
Job.validTransitions = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['ready-for-delivery', 'rejected'],
  'ready-for-delivery': ['delivered'],
  'partial-delivered': ['delivered'],
  delivered: ['completed'],
  completed: [],
  verified: [],
};

// Valid state transitions (supervisor marks department work as done)
Job.validStateTransitions = {
  'in-composition':  'composition-done',
  'in-montage':      'montage-done',
  'in-printing':     'printing-done',
  'in-binding':      'binding-done',
  'in-packaging':    'packaging-done',
  'quality-check':   'qualitycheck-done',
  'in-atelier':      'atelier-done',
};

Job.canTransition = (fromStatus, toStatus) => {
  return Job.validTransitions[fromStatus]?.includes(toStatus) ?? false;
};

module.exports = Job;
