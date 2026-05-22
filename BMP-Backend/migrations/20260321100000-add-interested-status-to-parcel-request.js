export async function up(queryInterface, Sequelize) {
  const [r] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_type WHERE typname = 'enum_parcel_requests_status'`
  );
  if (r.length === 0) return;

  await queryInterface.sequelize.query(`
    ALTER TYPE "enum_parcel_requests_status" 
    ADD VALUE IF NOT EXISTS 'INTERESTED' AFTER 'SENT';
  `);
}

export async function down(queryInterface, Sequelize) {
  // Note: PostgreSQL doesn't support removing enum values directly
  // This would require recreating the enum type and updating all references
  console.log('Rollback not supported for enum value removal in PostgreSQL');
}