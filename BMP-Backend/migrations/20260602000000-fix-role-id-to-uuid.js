/**
 * Migration: Fix role_id column type in user_roles from INTEGER to UUID
 *
 * Root cause: roles.id was always UUID in the DB but role.model.js declared
 * it as INTEGER. During signup, role.id (a UUID string) was being inserted
 * into user_roles.role_id typed as INTEGER → "invalid input syntax for type integer"
 */

export async function up(queryInterface, Sequelize) {
  const tableDesc = await queryInterface.describeTable("user_roles");
  const rolesDesc = await queryInterface.describeTable("roles");

  // Only run if roles.id is UUID but user_roles.role_id is still integer
  const roleIdType = String(tableDesc.role_id?.type || "").toLowerCase();
  const rolesIdType = String(rolesDesc.id?.type || "").toLowerCase();

  if (roleIdType.includes("int") && (rolesIdType.includes("uuid") || rolesIdType === "uuid")) {
    // Drop FK constraint if exists (ignore error if none)
    try {
      await queryInterface.sequelize.query(
        `ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey`
      );
    } catch { /* no FK to drop */ }

    // Drop old integer column and recreate as UUID
    await queryInterface.sequelize.query(`
      ALTER TABLE user_roles
        DROP COLUMN role_id,
        ADD COLUMN role_id UUID NOT NULL DEFAULT gen_random_uuid()
    `);

    // Re-add FK
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE user_roles
          ADD CONSTRAINT user_roles_role_id_fkey
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      `);
    } catch { /* FK optional */ }

    console.log("✅ user_roles.role_id changed from INTEGER to UUID");
  } else {
    console.log("ℹ️  user_roles.role_id is already UUID — skipping");
  }
}

export async function down(queryInterface) {
  // Intentionally not reversible — going back to INTEGER would break data
  console.log("↩️  down: no-op (UUID→INTEGER conversion not safe to reverse)");
}
