/**
 * Migration: Fix enum_payments_status to match PAYMENT_STATUS constants
 *
 * The payments table was originally created by sequelize.sync() with enum values:
 *   PENDING, COMPLETED, FAILED, REFUNDED
 *
 * The codebase now uses:
 *   CREATED, PENDING, SUCCESS, FAILED, REFUNDED
 *
 * This migration:
 *  1. Adds missing values: CREATED, SUCCESS
 *  2. Migrates any existing COMPLETED rows → SUCCESS
 *  3. Does NOT remove COMPLETED (PostgreSQL doesn't support removing enum values)
 *     — it becomes a harmless dead value in the enum type.
 */

export async function up(queryInterface) {
  // 1. Add CREATED if missing
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'CREATED'
          AND enumtypid = 'enum_payments_status'::regtype
      ) THEN
        ALTER TYPE enum_payments_status ADD VALUE 'CREATED';
      END IF;
    END
    $$;
  `);

  // 2. Add SUCCESS if missing
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'SUCCESS'
          AND enumtypid = 'enum_payments_status'::regtype
      ) THEN
        ALTER TYPE enum_payments_status ADD VALUE 'SUCCESS';
      END IF;
    END
    $$;
  `);

  // 3. Migrate any existing COMPLETED rows to SUCCESS
  await queryInterface.sequelize.query(`
    UPDATE payments SET status = 'SUCCESS' WHERE status = 'COMPLETED';
  `);
}

export async function down(queryInterface) {
  // Revert SUCCESS rows back to COMPLETED (best-effort)
  await queryInterface.sequelize.query(`
    UPDATE payments SET status = 'COMPLETED' WHERE status = 'SUCCESS';
  `);
  // Note: cannot remove enum values in PostgreSQL without recreating the type.
}
