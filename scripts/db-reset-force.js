/**
 * Force-drops ALL tables in the database, then re-runs migrations and seeds.
 * Usage: node scripts/db-reset-force.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { execSync } = require('child_process');
const { Sequelize } = require('sequelize');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  logging: false,
});

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();

    console.log('💣 Dropping all tables...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    const [tables] = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE();`
    );

    for (const row of tables) {
      const table = row.table_name || row.TABLE_NAME;
      await sequelize.query(`DROP TABLE IF EXISTS \`${table}\`;`);
      console.log(`  dropped: ${table}`);
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
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
