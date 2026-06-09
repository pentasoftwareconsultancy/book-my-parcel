export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("wallets", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
    },

    balance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  await queryInterface.addIndex("wallets", ["user_id"]);
}