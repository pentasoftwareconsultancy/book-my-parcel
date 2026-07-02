// Add GIN indexes on the JSONB columns used for containment queries in matching.
// The locality/city matching sub-queries use `@>` (JSONB containment) which can
// only be accelerated by a GIN index — a B-tree index is useless for this operator.
// Using CONCURRENTLY so existing traffic is not blocked during index build.

export async function up(queryInterface) {
  // Check which JSONB columns actually exist before indexing
  const cols = await queryInterface.describeTable("traveller_routes");

  if (cols.localities_passed) {
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS
        idx_traveller_routes_localities_gin
      ON traveller_routes USING gin (localities_passed)
    `);
  }

  if (cols.cities_passed) {
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS
        idx_traveller_routes_cities_gin
      ON traveller_routes USING gin (cities_passed)
    `);
  }
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_traveller_routes_localities_gin`);
  await queryInterface.sequelize.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_traveller_routes_cities_gin`);
}
