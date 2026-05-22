/**
 * Migration: Add missing columns to address table
 *
 * The Address model defines several columns that are missing from the DB,
 * most critically `type` (NOT NULL ENUM) which breaks all address JOINs.
 */

export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('address')) return;
  const tableDesc = await queryInterface.describeTable("address");
  if (!tableDesc.type) {
    // Create the ENUM type first if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_address_type AS ENUM ('pickup', 'delivery', 'origin', 'destination');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryInterface.addColumn("address", "type", {
      type: Sequelize.ENUM("pickup", "delivery", "origin", "destination"),
      allowNull: true, // temporarily nullable so existing rows don't fail
    });
    // Default existing rows to 'pickup' then tighten constraint
    await queryInterface.sequelize.query(`UPDATE address SET type = 'pickup' WHERE type IS NULL`);
    await queryInterface.sequelize.query(`ALTER TABLE address ALTER COLUMN type SET NOT NULL`);
    console.log("✅ Added type to address");
  }

  const cols = [
    ["address",           { type: Sequelize.STRING, allowNull: true }],
    ["phone",             { type: Sequelize.STRING, allowNull: true }],
    ["place_id",          { type: Sequelize.STRING(500), allowNull: true, unique: false }],
    ["latitude",          { type: Sequelize.DECIMAL(10, 8), allowNull: true }],
    ["longitude",         { type: Sequelize.DECIMAL(11, 8), allowNull: true }],
    ["plus_code",         { type: Sequelize.STRING(20), allowNull: true }],
    ["validation_status", { type: Sequelize.ENUM("VALID", "PARTIAL", "INFERRED"), allowNull: true }],
    ["district",          { type: Sequelize.STRING(100), allowNull: true }],
    ["taluka",            { type: Sequelize.STRING(100), allowNull: true }],
    ["locality",          { type: Sequelize.STRING(200), allowNull: true }],
    ["landmarks",         { type: Sequelize.JSONB, allowNull: true }],
    ["sub_localities",    { type: Sequelize.JSONB, allowNull: true }],
    ["formatted_address", { type: Sequelize.TEXT, allowNull: true }],
    ["last_geocoded_at",  { type: Sequelize.DATE, allowNull: true }],
    ["usage_count",       { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 }],
    ["name",              { type: Sequelize.STRING, allowNull: true }],
    ["alt_phone",         { type: Sequelize.STRING, allowNull: true }],
    ["aadhar_no",         { type: Sequelize.STRING, allowNull: true }],
    ["user_profile_id",   { type: Sequelize.UUID, allowNull: true }],
  ];

  // Re-fetch after potential type addition
  const desc = await queryInterface.describeTable("address");

  for (const [col, def] of cols) {
    if (!desc[col]) {
      if (col === "validation_status") {
        await queryInterface.sequelize.query(`
          DO $$ BEGIN
            CREATE TYPE enum_address_validation_status AS ENUM ('VALID', 'PARTIAL', 'INFERRED');
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
        `);
      }
      await queryInterface.addColumn("address", col, def);
      console.log(`✅ Added ${col} to address`);
    }
  }

  console.log("✅ address table columns migration complete");
}

export async function down(queryInterface) {
  const cols = [
    "type", "place_id", "latitude", "longitude", "plus_code",
    "validation_status", "district", "taluka", "locality",
    "landmarks", "sub_localities", "formatted_address",
    "last_geocoded_at", "usage_count", "name", "alt_phone",
    "aadhar_no", "user_profile_id",
  ];

  const desc = await queryInterface.describeTable("address");
  for (const col of cols) {
    if (desc[col]) {
      await queryInterface.removeColumn("address", col);
    }
  }
}
