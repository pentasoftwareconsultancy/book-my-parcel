export const up = async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    ALTER TYPE enum_traveller_kyc_status
    ADD VALUE IF NOT EXISTS 'NOT_STARTED';
  `);
};

export const down = async (queryInterface, Sequelize) => {
  // PostgreSQL ENUM rollback is risky
};