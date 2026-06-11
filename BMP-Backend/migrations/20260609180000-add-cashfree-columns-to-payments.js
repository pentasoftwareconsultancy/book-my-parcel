export const up = async (queryInterface, Sequelize) => {
  try {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("payments")) return;

    const tableDescription = await queryInterface.describeTable("payments");

    if (!tableDescription.cashfree_order_id) {
      await queryInterface.addColumn("payments", "cashfree_order_id", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableDescription.cashfree_payment_id) {
      await queryInterface.addColumn("payments", "cashfree_payment_id", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    console.log("✅ Added Cashfree columns to payments");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
};

export const down = async (queryInterface) => {
  try {
    await queryInterface.removeColumn("payments", "cashfree_order_id");
    await queryInterface.removeColumn("payments", "cashfree_payment_id");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
};