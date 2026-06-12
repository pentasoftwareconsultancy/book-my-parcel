import { DataTypes } from "sequelize";
import sequelize from "../../config/database.config.js";

const WalletTransaction = sequelize.define(
  "wallet_transactions",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    wallet_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING, // CREDIT / DEBIT
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    reason: DataTypes.STRING,
    idempotency_key: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: true,
      comment: "Prevents duplicate wallet credits for same payment/job",
    },
  },
  {
    timestamps: true,
    indexes: [
      { name: "idx_wallet_transactions_wallet_id", fields: ["wallet_id"] },
      { name: "idx_wallet_transactions_wallet_created", fields: ["wallet_id", "createdAt"] },
    ],
  },
);

export default WalletTransaction;
