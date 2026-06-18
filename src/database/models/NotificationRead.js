const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class NotificationRead extends Model {}

NotificationRead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    notificationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // The recipient user
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    // Set when the user actually reads it
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'NotificationRead',
    tableName: 'notification_reads',
    timestamps: true,
  }
);

module.exports = NotificationRead;
