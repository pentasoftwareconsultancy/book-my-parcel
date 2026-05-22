/**
 * Migration: Add address and phone columns to address table
 * The DB has 'street' and no 'phone', but the Sequelize model defines 'address' and 'phone'.
 */

export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('address')) return;
  const tableDesc = await queryInterface.describeTable("address");

  if (!tableDesc.address) {
    await queryInterface.addColumn("address", "address", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("✅ Added address to address table");
  } else {
    console.log("ℹ️  address column already exists");
  }

  if (!tableDesc.phone) {
    await queryInterface.addColumn("address", "phone", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("✅ Added phone to address table");
  } else {
    console.log("ℹ️  phone column already exists");
  }
}

export async function down(queryInterface) {
  const tableDesc = await queryInterface.describeTable("address");
  if (tableDesc.address) await queryInterface.removeColumn("address", "address");
  if (tableDesc.phone) await queryInterface.removeColumn("address", "phone");
}
