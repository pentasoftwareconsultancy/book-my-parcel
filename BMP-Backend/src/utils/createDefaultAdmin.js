import bcrypt from "bcrypt";
import sequelize from "../config/database.config.js";
import User from "../modules/user/user.model.js";
import UserProfile from "../modules/user/userProfile.model.js";
import Role from "../modules/user/role.model.js";
import UserRole from "../modules/user/userRole.model.js";
import { ROLES } from "./constants.js";

/**
 * Creates the default admin account on first startup.
 *
 * Credentials are read from environment variables — never hardcoded.
 * Required env vars:
 *   DEFAULT_ADMIN_EMAIL    — admin login email
 *   DEFAULT_ADMIN_PASSWORD — admin login password (min 8 chars)
 *   DEFAULT_ADMIN_PHONE    — admin phone number
 *
 * If any of these are missing, the function logs a warning and skips creation.
 * This is intentional: in production you must explicitly set these vars.
 */
export const createDefaultAdmin = async () => {
  const adminEmail    = process.env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const adminPhone    = process.env.DEFAULT_ADMIN_PHONE;

  if (!adminEmail || !adminPassword || !adminPhone) {
    console.warn(
      "⚠️  [Admin] DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, and DEFAULT_ADMIN_PHONE " +
      "are not set — skipping default admin creation. " +
      "Set these in your .env file to create the initial admin account."
    );
    return;
  }

  if (adminPassword.length < 8) {
    console.error("❌ [Admin] DEFAULT_ADMIN_PASSWORD must be at least 8 characters.");
    return;
  }

  // Check if an admin already exists with this email or phone
  const { Op } = await import("sequelize");
  const existingAdmin = await User.findOne({
    where: { [Op.or]: [{ email: adminEmail }, { phone_number: adminPhone }] },
  });
  if (existingAdmin) {
    console.log("ℹ️  [Admin] Admin account already exists — skipping creation.");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await sequelize.transaction(async (t) => {
    const adminUser = await User.create({
      email:        adminEmail,
      password:     hashedPassword,
      phone_number: adminPhone,
    }, { transaction: t });

    // Create a matching UserProfile so admin dashboard queries don't break
    await UserProfile.create({
      user_id: adminUser.id,
      name: "Admin",
    }, { transaction: t });

    const adminRole = await Role.findOne({ where: { name: ROLES.ADMIN }, transaction: t });
    if (!adminRole) {
      throw new Error("ADMIN role not found in DB. Run seedRoles first.");
    }

    await UserRole.create({
      user_id: adminUser.id,
      role_id: adminRole.id,
    }, { transaction: t });
  });

  console.log(`✅ [Admin] Default admin created: ${adminEmail}`);
};
