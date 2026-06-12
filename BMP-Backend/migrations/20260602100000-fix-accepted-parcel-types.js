/**
 * Migration: Fix accepted_parcel_types on traveller_routes
 *
 * Old routes stored package sizes: ["small", "medium", "large", "extra_large"]
 * New routes store categories:     ["documents", "electronics", "clothing", ...]
 *
 * Routes with size values will never match any parcel_type → no matching.
 * Fix: replace size-only arrays with all categories (accept everything).
 */

const ALL_CATEGORIES = [
  "documents", "electronics", "clothing",
  "food", "medicines", "books", "gifts", "others"
];

export async function up(queryInterface) {
  // Safety checks: ensure table + column exist
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('traveller_routes')) {
    console.log('ℹ️  traveller_routes table not present — skipping');
    return;
  }

  const tableDesc = await queryInterface.describeTable('traveller_routes');
  if (!tableDesc.accepted_parcel_types) {
    console.log('ℹ️  Column accepted_parcel_types not present on traveller_routes — skipping');
    return;
  }

  // Find routes where accepted_parcel_types contains only size keywords
  const [routes] = await queryInterface.sequelize.query(`
    SELECT id, accepted_parcel_types
    FROM traveller_routes
    WHERE accepted_parcel_types IS NOT NULL
      AND accepted_parcel_types::text != '[]'
      AND (
        accepted_parcel_types @> '["small"]'::jsonb
        OR accepted_parcel_types @> '["medium"]'::jsonb
        OR accepted_parcel_types @> '["large"]'::jsonb
        OR accepted_parcel_types @> '["extra_large"]'::jsonb
      )
  `);

  if (routes.length === 0) {
    console.log("ℹ️  No routes with size-based accepted_parcel_types found — skipping");
    return;
  }

  console.log(`🔄 Fixing ${routes.length} routes with size-based accepted_parcel_types...`);

  await queryInterface.sequelize.query(`
    UPDATE traveller_routes
    SET accepted_parcel_types = :categories::jsonb
    WHERE id IN (:ids)
  `, {
    replacements: {
      categories: JSON.stringify(ALL_CATEGORIES),
      ids: routes.map(r => r.id),
    },
  });

  console.log(`✅ Updated ${routes.length} routes to use category-based accepted_parcel_types`);
}

export async function down(queryInterface) {
  console.log("↩️  down: no-op — original size values are not recoverable");
}
