'use strict';

/**
 * Migration: Add EXPIRED value to enum_traveller_routes_status
 *
 * The bootstrap migration never included EXPIRED in this enum.
 * Later migrations attempted to re-create the type but silently skipped
 * it (duplicate_object exception), so EXPIRED was never actually added.
 *
 * ALTER TYPE ... ADD VALUE is idempotent via IF NOT EXISTS.
 * NOTE: ADD VALUE cannot be run inside a transaction in PostgreSQL,
 * so this migration disables transactions.
 */

export async function up(queryInterface) {
  // ADD VALUE cannot run inside a transaction in PostgreSQL
  await queryInterface.sequelize.query(`
    ALTER TYPE "enum_traveller_routes_status" ADD VALUE IF NOT EXISTS 'EXPIRED';
  `);
  console.log("✅ Added EXPIRED to enum_traveller_routes_status");
}

export async function down(queryInterface) {
  // PostgreSQL does not support removing enum values without recreating the type.
  // This is intentionally a no-op — removing EXPIRED would require a full type
  // replacement which is risky in production.
  console.log("ℹ️  down: EXPIRED cannot be removed from enum without full type recreation — skipping");
}
