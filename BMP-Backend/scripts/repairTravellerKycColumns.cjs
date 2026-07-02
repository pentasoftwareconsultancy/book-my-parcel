const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    const { rows } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'traveller_kyc'");
    const existing = new Set(rows.map((r) => r.column_name));

    const columns = [
      ['first_name', 'character varying'],
      ['last_name', 'character varying'],
      ['dob', 'date'],
      ['gender', 'character varying'],
      ['address', 'text'],
      ['aadhar_number', 'character varying'],
      ['pan_number', 'character varying'],
      ['driving_number', 'character varying'],
      ['aadhar_front', 'character varying'],
      ['aadhar_back', 'character varying'],
      ['pan_front', 'character varying'],
      ['pan_back', 'character varying'],
      ['driving_photo', 'character varying'],
      ['selfie', 'character varying'],
      ['account_number', 'character varying'],
      ['account_holder', 'character varying'],
      ['ifsc', 'character varying'],
      ['bank_name', 'character varying'],
      ['bank_verified', 'boolean'],
    ];

    for (const [name, type] of columns) {
      if (!existing.has(name)) {
        await client.query(`ALTER TABLE traveller_kyc ADD COLUMN ${name} ${type}`);
        console.log(`added ${name}`);
      } else {
        console.log(`exists ${name}`);
      }
    }

    const { rows: afterRows } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'traveller_kyc' ORDER BY ordinal_position");
    console.log('final columns:', afterRows.map((r) => r.column_name).join(', '));
  } catch (error) {
    console.error('repair failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
