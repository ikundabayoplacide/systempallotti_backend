const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../../config/database');

class BoutiqueStockRequest extends Model {
  static async generateRequestNumber() {
    const year = new Date().getFullYear();
    const last = await BoutiqueStockRequest.findOne({
      where: { requestNumber: { [Op.like]: `BSR-${year}-%` } },
      order: [['createdAt', 'DESC']],
    });
    let next = 1;
    if (last) {
      const seq = parseInt(last.requestNumber.split('-')[2], 10);
      if (!isNaN(seq)) next = seq + 1;
    }
    return `BSR-${year}-${String(next).padStart(3, '0')}`;
  }
}

BoutiqueStockRequest.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    requestNumber: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'request_number' },
    requestedById: { type: DataTypes.UUID, allowNull: false, field: 'requested_by_id' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    responseNotes: { type: DataTypes.TEXT, allowNull: true, field: 'response_notes' },
    respondedBy: { type: DataTypes.UUID, allowNull: true, field: 'responded_by' },
    respondedAt: { type: DataTypes.DATE, allowNull: true, field: 'responded_at' },
  },
  {
    sequelize,
    modelName: 'BoutiqueStockRequest',
    tableName: 'boutique_stock_requests',
    timestamps: true,
    underscored: true,
  }
);

module.exports = BoutiqueStockRequest;
