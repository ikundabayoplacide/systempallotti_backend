const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class ExtraWorker extends Model {}

ExtraWorker.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: 'Full name is required' } },
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    task: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: 'Task is required' } },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doneBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ExtraWorker',
    tableName: 'extra_workers',
    timestamps: true,
  }
);

module.exports = ExtraWorker;
