const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Machine extends Model {}

Machine.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'Machine name is required' } },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
      defaultValue: 'active',
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Machine',
    tableName: 'machines',
    timestamps: true,
  }
);

module.exports = Machine;
