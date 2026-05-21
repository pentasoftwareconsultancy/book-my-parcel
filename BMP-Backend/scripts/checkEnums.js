import seq from '../src/config/database.config.js';

const enums = ['enum_bookings_status', 'enum_parcels_status'];
for (const e of enums) {
  try {
    const [rows] = await seq.query(`SELECT unnest(enum_range(NULL::${e}))::text AS val`);
    console.log(`${e}:`, rows.map(r => r.val));
  } catch (err) {
    console.log(`${e}: NOT FOUND (${err.message})`);
  }
}

// Also check bookings columns nullability
const [cols] = await seq.query(
  "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'bookings' ORDER BY ordinal_position"
);
console.log('\nbookings columns:');
console.table(cols);

process.exit(0);
