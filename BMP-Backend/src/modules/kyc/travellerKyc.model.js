import { DataTypes } from "sequelize";
import sequelize from "../../config/database.config.js";

const TravellerKyc = sequelize.define(
  "traveller_kyc",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    aadhar_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pan_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    driving_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    aadhar_front: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    aadhar_back: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pan_front: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pan_back: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    driving_photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    selfie: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    account_holder: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ifsc: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bank_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bank_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    status: {
      type: DataTypes.STRING(50),
      defaultValue: "NOT_STARTED",
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      { name: "idx_traveller_kyc_user_id", fields: ["user_id"] },
      { name: "idx_traveller_kyc_status", fields: ["status"] },
      { name: "idx_traveller_kyc_created_at", fields: ["created_at"] },
    ],
  }
);

// Mask Aadhaar (show only last 4) and PAN (show only last 4) before persisting
function maskSensitiveFields(instance) {
  if (instance.aadhar_number && instance.aadhar_number.length === 12 && !instance.aadhar_number.includes("X")) {
    instance.aadhar_number = "X".repeat(8) + instance.aadhar_number.slice(-4);
  }
  if (instance.pan_number && instance.pan_number.length === 10 && !instance.pan_number.includes("X")) {
    instance.pan_number = "X".repeat(6) + instance.pan_number.slice(-4);
  }
}

TravellerKyc.addHook("beforeCreate", maskSensitiveFields);
TravellerKyc.addHook("beforeUpdate", maskSensitiveFields);

export default TravellerKyc;