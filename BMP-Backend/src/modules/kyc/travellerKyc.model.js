import { DataTypes } from "sequelize";
import sequelize from "../../config/database.config.js";

const TravellerKyc = sequelize.define(
  "traveller_kyc",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    pan_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aadhaar_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driving_license: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_ifsc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'NOT_STARTED',
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true, // Uses created_at, updated_at
    indexes: [
      { name: "idx_traveller_kyc_status", fields: ["status"] },
      { name: "idx_traveller_kyc_user_id", fields: ["user_id"] },
      { name: "idx_traveller_kyc_created_at", fields: ["created_at"] },
    ],
  },
);

export default TravellerKyc;