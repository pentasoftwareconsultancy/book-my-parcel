export const up = async (queryInterface, Sequelize) => {
  // Skip if enum doesn't exist yet (parcel table not created yet)
  const [results] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_type WHERE typname = 'enum_parcel_status'`
  );
  if (results.length === 0) {
    console.log('ℹ️  enum_parcel_status not found — skipping (will be created with parcel table)');
    return;
  }

  await queryInterface.sequelize.query(`
    ALTER TYPE "enum_parcel_status" 
    ADD VALUE IF NOT EXISTS 'PARTNER_SELECTED' AFTER 'MATCHING';
  `);
};

export const down = async (queryInterface, Sequelize) => {
  // Note: PostgreSQL doesn't support removing enum values directly
  // This would require recreating the enum type, which is complex
  // For now, we'll leave the enum value in place
  console.log('Rollback: PARTNER_SELECTED status will remain in enum (PostgreSQL limitation)');
};