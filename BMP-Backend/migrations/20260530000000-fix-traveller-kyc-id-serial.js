/**
 * Migration: Fix traveller_kyc.id to have UUID default
 *
 * Issue: The id column is UUID but has no default value,
 * causing "null value in column 'id' violates not-null constraint" on signup.
 *
 * Solution: Set default to gen_random_uuid()
 */

export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('traveller_kyc')) {
    console.log('  traveller_kyc table does not exist — skipping');
    return;
  }

  // Check existing id column type and default
  const [result] = await queryInterface.sequelize.query(`
    SELECT data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'traveller_kyc' 
      AND column_name = 'id'
  `);

  const column = result[0];
  const currentType = column?.data_type?.toLowerCase();
  const currentDefault = column?.column_default;

  if (currentType === 'uuid' && currentDefault && (currentDefault.includes('gen_random_uuid') || currentDefault.includes('uuid_generate'))) {
    console.log('✅ traveller_kyc.id already has UUID default — skipping');
    return;
  }

  if (currentType === 'uuid') {
    console.log('🔧 traveller_kyc.id is already UUID; setting default...');
    await queryInterface.sequelize.query(`
      ALTER TABLE traveller_kyc
      ALTER COLUMN id SET DEFAULT gen_random_uuid();
    `);
    console.log('✅ Fixed traveller_kyc.id — now has UUID default');
    return;
  }

  if (currentType === 'integer') {
    console.log('🔧 Converting traveller_kyc.id from integer to UUID and setting default...');
    await queryInterface.sequelize.query(`
      ALTER TABLE traveller_kyc
      ALTER COLUMN id DROP DEFAULT,
      ALTER COLUMN id TYPE uuid USING gen_random_uuid(),
      ALTER COLUMN id SET DEFAULT gen_random_uuid();
    `);
    console.log('✅ Converted traveller_kyc.id to UUID and set default');
    return;
  }

  console.log(`⚠️ traveller_kyc.id has unexpected data type: ${currentType}. Attempting to set UUID default anyway.`);
  await queryInterface.sequelize.query(`
    ALTER TABLE traveller_kyc 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
  `);

  console.log('✅ Fixed traveller_kyc.id — now has UUID default');
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    ALTER TABLE traveller_kyc 
    ALTER COLUMN id DROP DEFAULT;
  `);

  console.log('↩️  Reverted traveller_kyc.id default');
}
