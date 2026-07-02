"use strict";

// The walletTransaction model declares idempotency_key as unique:true, but
// sequelize.sync() never runs in production, so the DB-level constraint was
// never actually created. This migration adds the real unique index so the
// DB enforces idempotency even under concurrent wallet-credit attempts.

export async function up(queryInterface) {
  await queryInterface.addIndex("wallet_transactions", ["idempotency_key"], {
    unique: true,
    name: "wallet_transactions_idempotency_key_unique",
    where: { idempotency_key: { [queryInterface.sequelize.Sequelize.Op.ne]: null } },
  });
}

export async function down(queryInterface) {
  await queryInterface.removeIndex(
    "wallet_transactions",
    "wallet_transactions_idempotency_key_unique"
  );
}
