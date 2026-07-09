'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE jobs MODIFY COLUMN progress ENUM('pending','started','paused','resumed','completed') NULL DEFAULT NULL`
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE jobs MODIFY COLUMN progress ENUM('started','paused','resumed','completed') NULL DEFAULT NULL`
    );
  },
};
