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
  // Skip if enum doesn't exist yet
  const [results] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_type WHERE typname = 'enum_payments_status'`
  );
  if (results.length === 0) return;

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

  await queryInterface.sequelize.query(`
    UPDATE payments
    SET status = 'SUCCESS'
    WHERE status::text = 'COMPLETED';
  `);
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'COMPLETED'
      ) THEN
        UPDATE payments
        SET status = 'COMPLETED'
        WHERE status::text = 'SUCCESS';
      END IF;
    END$$;
  `);
}
