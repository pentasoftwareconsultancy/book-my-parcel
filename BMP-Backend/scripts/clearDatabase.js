#!/usr/bin/env node

import dotenv from "dotenv";
import sequelize from "../src/config/database.config.js";

dotenv.config();

const PROTECTED_TABLES = new Set([
  "SequelizeMeta",
  "sequelize_migrations",
]);

async function clearDatabase() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("🧹 DATABASE CLEAR COMMAND");
    console.log("=".repeat(70));
    console.log("⚠️  This will remove all data from application tables in the public schema.");
    console.log("⚠️  Schema will be preserved and identity counters will be reset.");
    console.log("⚠️  Migration bookkeeping tables are kept intact.");
    console.log();

    await sequelize.authenticate();
    console.log("✅ Database connected");

    const [tables] = await sequelize.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const targetTables = tables
      .map((row) => row.tablename)
      .filter((tableName) => !PROTECTED_TABLES.has(tableName));

    if (targetTables.length === 0) {
      console.log("ℹ️  No application tables found to clear.");
      return;
    }

    const quotedTables = targetTables
      .map((tableName) => `"${String(tableName).replace(/"/g, '""')}"`)
      .join(", ");

    await sequelize.query(`TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE;`);

    console.log(`✅ Cleared ${targetTables.length} table(s)`);
    console.log(`   Preserved: ${Array.from(PROTECTED_TABLES).join(", ")}`);
    console.log("\n🎉 Database data cleared successfully. Schema remains intact.\n");
  } catch (error) {
    console.error("\n❌ Failed to clear database:");
    console.error(`   ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

clearDatabase();