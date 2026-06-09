"use strict";

export async function up(queryInterface) {

  const tableExists = async (table) => {
    const result = await queryInterface.sequelize.query(`
      SELECT to_regclass('public.${table}') IS NOT NULL as exists;
    `);
    return result[0][0].exists;
  };

  const safeAddIndex = async (table, fields, name) => {
    const exists = await tableExists(table);
    if (!exists) {
      console.warn(`[SKIP] Table ${table} does not exist`);
      return;
    }

    try {
      await queryInterface.addIndex(table, fields, {
        name,
        ifNotExists: true,
      });
    } catch (err) {
      console.warn(`[INDEX SKIP] ${name}: ${err.message}`);
    }
  };

  // ───────── payments ─────────
  await safeAddIndex("payments", ["status"], "idx_payments_status");
  await safeAddIndex("payments", ["booking_id"], "idx_payments_booking_id");

  // ───────── wallet_transactions ─────────
  await safeAddIndex("wallet_transactions", ["wallet_id"], "idx_wallet_tx_wallet_id");
  await safeAddIndex("wallet_transactions", ["createdAt"], "idx_wallet_tx_created_at");

  // ───────── wallets ─────────
  await safeAddIndex("wallets", ["user_id"], "idx_wallets_user_id");

  // ───────── parcel_acceptances ─────────
  await safeAddIndex("parcel_acceptances", ["parcel_id"], "idx_pa_parcel_id");
  await safeAddIndex("parcel_acceptances", ["traveller_id"], "idx_pa_traveller_id");

  // ───────── booking ─────────
  await safeAddIndex("booking", ["status", "createdAt"], "idx_booking_status_created");

  // ───────── address ─────────
  await safeAddIndex("address", ["place_id"], "idx_address_place_id");

  // ───────── notifications ─────────
  await safeAddIndex("notifications", ["user_id", "is_read"], "idx_notifications_user_unread");

  console.log("✅ Index migration completed safely");
}

export async function down(queryInterface) {
  // safe rollback (optional)
}