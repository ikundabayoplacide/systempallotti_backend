'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reception_requests', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      request_number:{ type: Sequelize.STRING, allowNull: false, unique: true },
      requested_by_id:{ type: Sequelize.UUID, allowNull: false },
      status:        { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending', allowNull: false },
      notes:         { type: Sequelize.TEXT, allowNull: true },
      response_notes:{ type: Sequelize.TEXT, allowNull: true },
      responded_by:  { type: Sequelize.UUID, allowNull: true },
      responded_at:  { type: Sequelize.DATE, allowNull: true },
      created_at:    { type: Sequelize.DATE, allowNull: false },
      updated_at:    { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('reception_request_items', {
      id:                   { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      reception_request_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'reception_requests', key: 'id' }, onDelete: 'CASCADE' },
      item_name:            { type: Sequelize.STRING, allowNull: false },
      description:          { type: Sequelize.TEXT, allowNull: true },
      quantity:             { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      unit:                 { type: Sequelize.STRING, allowNull: false },
      unit_price:           { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_amount:         { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      created_at:           { type: Sequelize.DATE, allowNull: false },
      updated_at:           { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reception_request_items');
    await queryInterface.dropTable('reception_requests');
  },
};
