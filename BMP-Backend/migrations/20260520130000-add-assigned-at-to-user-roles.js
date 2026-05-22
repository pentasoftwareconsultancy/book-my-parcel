/**
 * Migration: Add assigned_at to user_roles
 *
 * The UserRole Sequelize model defines assigned_at (NOT NULL, default NOW)
 * but the column is missing from the DB table, causing insert failures.
 */

export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('user_roles')) return;
  const tableDesc = await queryInterface.describeTable("user_roles");

  if (!tableDesc.assigned_at) {
    await queryInterface.addColumn("user_roles", "assigned_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("NOW()"),
    });
    console.log("✅ Added assigned_at to user_roles");
  } else {
    console.log("ℹ️  assigned_at already exists on user_roles — skipping");
  }
}

export async function down(queryInterface) {
  const tableDesc = await queryInterface.describeTable("user_roles");

  if (tableDesc.assigned_at) {
    await queryInterface.removeColumn("user_roles", "assigned_at");
    console.log("↩️  Removed assigned_at from user_roles");
  }
}
