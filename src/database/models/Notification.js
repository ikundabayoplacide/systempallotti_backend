const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Who triggered this notification
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Title is required' } },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Message is required' } },
    },
    type: {
      type: DataTypes.ENUM(
        'CUSTOMER_CREATED',
        'CUSTOMER_CHECKIN',
        'PAYMENT_COLLECTED',
        'JOB_DELIVERED',
        'BOUTIQUE_STOCK_REQUEST',
        'BOUTIQUE_PRODUCT_ADDED',
        'REPORT_GENERATED',
        'JOB_CREATED',
        'JOB_ASSIGNED',
        'JOB_STATUS_CHANGED',
        'DEPARTMENT_ASSIGNED',
        'PAYMENT_RECEIVED',
        'GENERAL'
      ),
      defaultValue: 'GENERAL',
      allowNull: false,
    },
    relatedEntityType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    relatedEntityId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    // Roles this notification was broadcast to (informational)
    targetRoles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
  }
);

module.exports = Notification;
