'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('procurement_leads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      company: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      contactPerson: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      sector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'e.g. Education, Government, Healthcare, NGO, Private',
      },
      stage: {
        type: Sequelize.ENUM('prospect', 'contacted', 'negotiating', 'won', 'lost'),
        allowNull: false,
        defaultValue: 'prospect',
      },
      estimatedValue: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: true,
        comment: 'Estimated contract value in RWF',
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      nextFollowUp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('procurement_leads', ['stage']);
    await queryInterface.addIndex('procurement_leads', ['createdById']);
    await queryInterface.addIndex('procurement_leads', ['nextFollowUp']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('procurement_leads');
  },
};
