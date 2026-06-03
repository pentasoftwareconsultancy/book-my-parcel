export const up = async (queryInterface, Sequelize) => {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('traveller_routes')) return;
  const tableDesc = await queryInterface.describeTable('traveller_routes');
  if (tableDesc.transport_mode) return;

  await queryInterface.addColumn('traveller_routes', 'transport_mode', {
    type: Sequelize.ENUM('private', 'public'),
    defaultValue: 'private',
    allowNull: true,
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Remove transport_mode column
  await queryInterface.removeColumn('traveller_routes', 'transport_mode');
};
