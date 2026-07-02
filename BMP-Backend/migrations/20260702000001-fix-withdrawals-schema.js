// Fix withdrawals table:
// 1. Ensure beneficiary_id column exists (may be missing if table was bootstrapped
//    without the original 20260504 migration).
// 2. Add PROCESSING / SUCCESS / FAILED to the status enum — the original migration
//    only had PENDING / APPROVED / REJECTED which prevents processWithdrawalService
//    from ever writing status: "PROCESSING" or "SUCCESS".

export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("withdrawals");

  // ── 1. beneficiary_id ────────────────────────────────────────────────────
  if (!table.beneficiary_id) {
    await queryInterface.addColumn("withdrawals", "beneficiary_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("✅ Added beneficiary_id to withdrawals");
  }

  // ── 2. transaction_id ───────────────────────────────────────────────────
  if (!table.transaction_id) {
    await queryInterface.addColumn("withdrawals", "transaction_id", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    console.log("✅ Added transaction_id to withdrawals");
  }

  // ── 3. Status ENUM — add missing values (PostgreSQL allows ADD VALUE) ──
  // We cannot remove APPROVED / REJECTED without rebuilding the type, so we
  // leave them and just add the values the application actually uses.
  const neededValues = ["PROCESSING", "SUCCESS", "FAILED"];
  for (const val of neededValues) {
    try {
      // IF NOT EXISTS prevents errors on repeated runs (Postgres 9.6+).
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_withdrawals_status_enum" ADD VALUE IF NOT EXISTS '${val}'`
      );
      console.log(`✅ Added enum value ${val} to enum_withdrawals_status_enum`);
    } catch {
      // Older Postgres versions don't support IF NOT EXISTS; value may already exist.
    }
  }
}

export async function down(queryInterface) {
  // Adding ENUM values and columns is not trivially reversible — no-op.
}
