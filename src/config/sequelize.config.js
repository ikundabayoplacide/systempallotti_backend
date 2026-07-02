const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  url: process.env.DATABASE_URL,
  dialect: 'mysql',
  seederStorage: 'sequelize',
  migrationStorage: 'sequelize',
};

module.exports = {
  development: config,
  production: config,
};
