"use strict";

/**
 * Add auth_provider column to user_profiles table.
 *
 * Stores which OAuth provider was used to create/last-login the account.
 * Values: 'google', 'facebook', 'apple', null (email/password accounts).
 *
 * Nullable — existing rows get NULL (email/password users), which is correct.
 */

export async function up(queryInterface, Sequelize) {
  const tableDesc = await queryInterface.describeTable("user_profiles");

  // Idempotent — skip if column already exists
  if (tableDesc.auth_provider) return;

  await queryInterface.addColumn("user_profiles", "auth_provider", {
    type:         Sequelize.STRING(50),
    allowNull:    true,
    defaultValue: null,
    comment:      "OAuth provider used for account creation: google | facebook | apple | null",
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("user_profiles", "auth_provider").catch(() => {});
}
