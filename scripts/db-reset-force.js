/**
 * Force-drops ALL tables in the database (CASCADE), then re-runs migrations and seeds.
 * Usage: node scripts/db-reset-force.js
 */
require('dotenv').config();
const { execSync } = require('child_process');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();

    console.log('💣 Dropping all tables with CASCADE...');
    await sequelize.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    console.log('✅ All tables dropped.');

    await sequelize.close();

    console.log('🚀 Running migrations...');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });

    console.log('🌱 Running seeds...');
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });

    console.log('🎉 Database reset complete!');
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
})();
