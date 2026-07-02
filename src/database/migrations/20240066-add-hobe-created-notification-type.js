'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notifications', 'type', {
      type: Sequelize.ENUM(
        'JOB_CREATED', 'JOB_ASSIGNED', 'JOB_STATUS_CHANGED',
        'DEPARTMENT_ASSIGNED', 'PAYMENT_RECEIVED', 'GENERAL',
        'EMPLOYEE_CREATED', 'JOB_DAF_ACTION', 'HOBE_CREATED'
      ),
      defaultValue: 'GENERAL',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notifications', 'type', {
      type: Sequelize.ENUM(
        'JOB_CREATED', 'JOB_ASSIGNED', 'JOB_STATUS_CHANGED',
        'DEPARTMENT_ASSIGNED', 'PAYMENT_RECEIVED', 'GENERAL',
        'EMPLOYEE_CREATED', 'JOB_DAF_ACTION'
      ),
      defaultValue: 'GENERAL',
      allowNull: false,
    });
  },
};
