export const up = async (queryInterface, Sequelize) => {
  const table = await queryInterface.describeTable("payments");

  if (!table.wallet_credit_released) {
    await queryInterface.addColumn("payments", "wallet_credit_released", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  }

  if (!table.wallet_txn_id) {
    await queryInterface.addColumn("payments", "wallet_txn_id", {
      type: Sequelize.UUID,
      allowNull: true,
      unique: true,
    });
  }
};

export const down = async (queryInterface) => {
  await queryInterface.removeColumn("payments", "wallet_credit_released");
  await queryInterface.removeColumn("payments", "wallet_txn_id");
};