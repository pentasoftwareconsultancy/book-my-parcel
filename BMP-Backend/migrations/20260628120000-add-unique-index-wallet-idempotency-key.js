'use strict';

// Adds the DB-level unique constraint that was missing for
// wallet_transactions.idempotency_key. The Sequelize model already declares
// `unique: true`, but the migration that added the column
// (20260609180100-add-idempotency-key-to-wallet-transactions.js) never created
// the actual index — and sequelize.sync() is never run in production, so the
// uniqueness was never enforced at the DB level. This is the backstop against
// the inline-delivery-credit path and the 10-min paymentRelease job both
// crediting the same payment twice (see booking.service.js's row lock fix and
// the audit notes in CLAUDE.md, finding P2).
//
// NULLs are fine for a unique index in Postgres (NULL is never considered
// equal to another NULL), so existing rows without an idempotency_key won't
// block this migration.

async function tableExists(queryInterface, tableName) {
  const [result] = await queryInterface.sequelize.query(
    `SELECT to_regclass('public."${tableName}"') as exists`
  );
  return !!result[0].exists;
}

export const up = async (queryInterface) => {
  try {
    const exists = await tableExists(queryInterface, "wallet_transactions");
    if (!exists) {
      console.warn("⚠️ Table missing: wallet_transactions → skipping unique index");
      return;
    }

    await queryInterface.addIndex("wallet_transactions", ["idempotency_key"], {
      name: "uniq_wallet_transactions_idempotency_key",
      unique: true,
    });

    console.log("✅ Added unique index on wallet_transactions.idempotency_key");
  } catch (err) {
    console.warn(`⚠️ Unique index skip (likely pre-existing duplicates or already present): ${err.message}`);
  }
};

export const down = async (queryInterface) => {
  try {
    await queryInterface.removeIndex(
      "wallet_transactions",
      "uniq_wallet_transactions_idempotency_key"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};
