export const up = async (queryInterface) => {
  const [results] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_type WHERE typname = 'enum_parcel_status'`
  );

  if (results.length === 0) {
    return;
  }

  await queryInterface.sequelize.query(`
    ALTER TYPE "enum_parcel_status"
    ADD VALUE IF NOT EXISTS 'PARTNER_SELECTED';
  `);
};

export const down = async (queryInterface, Sequelize) => {
  // Note: PostgreSQL doesn't support removing enum values directly
  // This would require recreating the enum type, which is complex
  // For now, we'll leave the enum value in place
  console.log('Rollback: PARTNER_SELECTED status will remain in enum (PostgreSQL limitation)');
};