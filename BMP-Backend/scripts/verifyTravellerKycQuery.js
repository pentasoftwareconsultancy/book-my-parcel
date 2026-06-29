import sequelize from '../src/config/database.config.js';

try {
  const [rows] = await sequelize.query("SELECT first_name, last_name FROM traveller_kyc LIMIT 1");
  console.log(JSON.stringify(rows[0] || {}, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
