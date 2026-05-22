export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('users')) return;
  const tableDesc = await queryInterface.describeTable("users");
  if (!tableDesc.password_changed_at) {
    await queryInterface.addColumn("users", "password_changed_at", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("NOW()"),
    });
  }
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("users", "password_changed_at").catch(() => {});
}
