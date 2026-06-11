export const up = async (queryInterface, Sequelize) => {
  try {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("wallet_transactions")) return;

    const tableDescription =
      await queryInterface.describeTable("wallet_transactions");

    if (!tableDescription.idempotency_key) {
      await queryInterface.addColumn(
        "wallet_transactions",
        "idempotency_key",
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    }

    console.log("✅ Added idempotency_key to wallet_transactions");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
};

export const down = async (queryInterface) => {
  try {
    await queryInterface.removeColumn(
      "wallet_transactions",
      "idempotency_key"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
};