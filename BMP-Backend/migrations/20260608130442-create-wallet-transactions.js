"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("wallet_transactions", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    wallet_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },

    type: {
      type: Sequelize.STRING, // CREDIT / DEBIT
      allowNull: false,
    },

    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },

    reason: {
      type: Sequelize.TEXT,
    },

    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },

    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.addIndex("wallet_transactions", ["wallet_id"]);
  await queryInterface.addIndex("wallet_transactions", ["type"]);
  await queryInterface.addIndex("wallet_transactions", ["createdAt"]);
}

export async function down(queryInterface) {
  await queryInterface.dropTable("wallet_transactions");
}