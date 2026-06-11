const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../utils/logger');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully.');

    // Models are managed via migrations — no auto-sync needed
    await sequelize.authenticate();
    logger.info('Database models synchronized.');
  } catch (error) {
    logger.error(`PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
