const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class ReceptionRequest extends Model {
  static async generateRequestNumber() {
    const last = await ReceptionRequest.findOne({ order: [['createdAt', 'DESC']] });
    let next = 1;
    if (last) {
      const parts = last.requestNumber.split('-');
      const seq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(seq)) next = seq + 1;
    }
    return `REC-REQ-${String(next).padStart(4, '0')}`;
  }
}

ReceptionRequest.init(
  {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    requestNumber: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'request_number' },
    requestedById: { type: DataTypes.UUID, allowNull: false, field: 'requested_by_id' },
    status:        { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending', allowNull: false },
    notes:         { type: DataTypes.TEXT, allowNull: true },
    responseNotes: { type: DataTypes.TEXT, allowNull: true, field: 'response_notes' },
    respondedBy:   { type: DataTypes.UUID, allowNull: true, field: 'responded_by' },
    respondedAt:   { type: DataTypes.DATE, allowNull: true, field: 'responded_at' },
  },
  {
    sequelize,
    modelName: 'ReceptionRequest',
    tableName: 'reception_requests',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ReceptionRequest;
