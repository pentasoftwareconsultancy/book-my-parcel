export const up = async (queryInterface, Sequelize) => {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('traveller_routes')) return;
  const tableDesc = await queryInterface.describeTable('traveller_routes');

  try {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_traveller_routes_transport_mode" AS ENUM ('private', 'public');
    `).catch((err) => {
      if (!err.message.includes('already exists')) throw err;
    });

    if (!tableDesc.transport_mode) {
      await queryInterface.addColumn('traveller_routes', 'transport_mode', {
        type: Sequelize.ENUM('private', 'public'),
        allowNull: false,
        defaultValue: 'private',
      });
    }
    if (!tableDesc.stops_passed) {
      await queryInterface.addColumn('traveller_routes', 'stops_passed', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }
  } catch (error) {
    console.error('[Migration] Error during up:', error.message);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    // Remove stops_passed column
    await queryInterface.removeColumn('traveller_routes', 'stops_passed');
    console.log('✅ Removed stops_passed column');

    // Remove transport_mode column
    await queryInterface.removeColumn('traveller_routes', 'transport_mode');
    console.log('✅ Removed transport_mode column');

    // Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_traveller_routes_transport_mode" CASCADE;
    `);
    console.log('✅ Dropped transport_mode enum type');

  } catch (error) {
    console.error('[Migration] Error during down:', error.message);
    throw error;
  }
};
