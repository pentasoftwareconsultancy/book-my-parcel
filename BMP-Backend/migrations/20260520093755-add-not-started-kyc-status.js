export const up = async (queryInterface, Sequelize) => {
  const [r] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_type WHERE typname = 'enum_traveller_kyc_status'`
  );
  if (r.length === 0) return;

  await queryInterface.sequelize.query(`
    ALTER TYPE enum_traveller_kyc_status
    ADD VALUE IF NOT EXISTS 'NOT_STARTED';
  `);
};

export const down = async (queryInterface, Sequelize) => {
  // PostgreSQL ENUM rollback is risky
};