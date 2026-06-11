"use strict";

export async function up(queryInterface, Sequelize) {
  // check if users table exists first (safety for production)
  const [tables] = await queryInterface.sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);

  const tableNames = tables.map(t => t.table_name);

  if (!tableNames.includes("users")) {
    console.log("⚠️ users table not found — skipping FK creation");
    return;
  }

  console.log("🔗 Adding FK: withdrawals.user_id → users.id");

  await queryInterface.addConstraint("withdrawals", {
    fields: ["user_id"],
    type: "foreign key",
    name: "fk_withdrawals_user_id",
    references: {
      table: "users",
      field: "id"
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  console.log("✅ FK added successfully");
}

export async function down(queryInterface) {
  await queryInterface.removeConstraint(
    "withdrawals",
    "fk_withdrawals_user_id"
  );
}