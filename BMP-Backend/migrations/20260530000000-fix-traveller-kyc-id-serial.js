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

  // Check if already has default
  const [result] = await queryInterface.sequelize.query(`
    SELECT column_default 
    FROM information_schema.columns 
    WHERE table_name = 'traveller_kyc' 
      AND column_name = 'id'
  `);

  const hasDefault = result[0]?.column_default;

  if (hasDefault && (hasDefault.includes('gen_random_uuid') || hasDefault.includes('uuid_generate'))) {
    console.log('✅ traveller_kyc.id already has UUID default — skipping');
    return;
  }

  console.log('🔧 Adding UUID default to traveller_kyc.id...');

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
