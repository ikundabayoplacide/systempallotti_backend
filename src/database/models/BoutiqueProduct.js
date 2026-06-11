const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class BoutiqueProduct extends Model {
  /**
   * Computed status based on stock vs min_stock
   */
  get status() {
    if (this.stock === 0) return 'out-of-stock';
    if (this.stock <= this.minStock) return 'low-stock';
    return 'in-stock';
  }

  /**
   * Auto-generate SKU from category prefix + sequence
   */
  static async generateSku(skuPrefix) {
    const all = await BoutiqueProduct.findAll({
      where: { sku: { [require('sequelize').Op.like]: `${skuPrefix}-%` } },
      attributes: ['sku'],
    });

    let maxSeq = 0;
    for (const p of all) {
      const seq = parseInt(p.sku.slice(skuPrefix.length + 1), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }

    return `${skuPrefix}-${String(maxSeq + 1).padStart(3, '0')}`;
  }
}

BoutiqueProduct.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sku: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Product name is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g. per 100, per item, per pad',
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Price cannot be negative' },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Stock cannot be negative' },
      },
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: 'Threshold that triggers low-stock warning',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    saleStatus: {
      type: DataTypes.ENUM('pending', 'sold'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'BoutiqueProduct',
    tableName: 'boutique_products',
    timestamps: true,
  }
);

module.exports = BoutiqueProduct;
