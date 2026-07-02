"use strict";

// Fix two gaps left by 20260702000001:
// 1. cashfree_transfer_id column was never added (only beneficiary_id and transaction_id were)
// 2. The status enum fix used the wrong type name, so PROCESSING/SUCCESS/FAILED
//    may not have been added. Try both possible names defensively.

export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("withdrawals");

  // ── 1. cashfree_transfer_id ─────────────────────────────────────────────────
  if (!table.cashfree_transfer_id) {
    await queryInterface.addColumn("withdrawals", "cashfree_transfer_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("✅ Added cashfree_transfer_id to withdrawals");
  } else {
    console.log("ℹ️  cashfree_transfer_id already exists — skipping");
  }

  // ── 2. Status enum — ensure PROCESSING / SUCCESS / FAILED exist ─────────────
  // Sequelize may have named the type enum_withdrawals_status (via createTable)
  // or enum_withdrawals_status_enum (via raw createEnum helper). Try both.
  const enumCandidates = ["enum_withdrawals_status", "enum_withdrawals_status_enum"];
  const neededValues = ["PROCESSING", "SUCCESS", "FAILED"];

  for (const enumName of enumCandidates) {
    for (const val of neededValues) {
      try {
        await queryInterface.sequelize.query(
          `ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS '${val}'`
        );
        console.log(`✅ Ensured '${val}' in ${enumName}`);
      } catch {
        // Type name doesn't exist on this DB — try the other candidate
      }
    }
  }
}

export async function down() {
  // Adding columns/enum values is not trivially reversible — no-op.
}
