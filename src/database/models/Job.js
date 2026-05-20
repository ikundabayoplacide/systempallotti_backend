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
        'in-composition',
        'in-montage',
        'in-printing',
        'in-binding',
        'in-packaging',
        'quality-check',
        'ready-for-delivery',
        'delivered',
        'completed'
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
  pending: ['confirmed'],
  confirmed: ['in-composition'],
  'in-composition': ['in-montage'],
  'in-montage': ['in-printing'],
  'in-printing': ['in-binding'],
  'in-binding': ['in-packaging'],
  'in-packaging': ['quality-check'],
  'quality-check': ['ready-for-delivery'],
  'ready-for-delivery': ['delivered'],
  delivered: ['completed'],
  completed: [],
};

Job.canTransition = (fromStatus, toStatus) => {
  return Job.validTransitions[fromStatus]?.includes(toStatus) ?? false;
};

module.exports = Job;
