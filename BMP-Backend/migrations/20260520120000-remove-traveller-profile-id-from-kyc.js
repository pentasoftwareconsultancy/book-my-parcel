/**
 * Migration: Remove traveller_profile_id from traveller_kyc
 *
 * The traveller_kyc table is linked to users via user_id only.
 * A traveller_profile_id column was added to the DB but is not defined
 * in the Sequelize model, causing notNull violations on every KYC insert.
 */

export async function up(queryInterface, Sequelize) {
  const tableDesc = await queryInterface.describeTable("traveller_kyc");

  if (tableDesc.traveller_profile_id) {
    await queryInterface.removeColumn("traveller_kyc", "traveller_profile_id");
    console.log("✅ Removed traveller_profile_id from traveller_kyc");
  } else {
    console.log("ℹ️  traveller_profile_id not found on traveller_kyc — skipping");
  }
}

export async function down(queryInterface, Sequelize) {
  const tableDesc = await queryInterface.describeTable("traveller_kyc");

  if (!tableDesc.traveller_profile_id) {
    await queryInterface.addColumn("traveller_kyc", "traveller_profile_id", {
      type: Sequelize.UUID,
      allowNull: true, // nullable on rollback to avoid breaking existing rows
    });
    console.log("↩️  Re-added traveller_profile_id (nullable) to traveller_kyc");
  }
}
