"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("withdrawals", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    user_id: {
      type: Sequelize.UUID,   // ✅ FIXED HERE
      allowNull: false
    },

    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },

    status: {
      type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING"
    },

    bank_account_id: {
      type: Sequelize.STRING(50),
      allowNull: false
    },

    bank_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },

    ifsc_code: {
      type: Sequelize.STRING(11)
    },

    account_holder: {
      type: Sequelize.STRING(100)
    },

    transaction_id: {
      type: Sequelize.STRING(100)
    },

    requested_at: {
      type: Sequelize.DATE,
      allowNull: false
    },

    processed_at: {
      type: Sequelize.DATE
    },

    failure_reason: {
      type: Sequelize.TEXT
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("withdrawals");
}