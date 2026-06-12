'use strict';

async function tableExists(queryInterface, tableName) {
  const [result] = await queryInterface.sequelize.query(
    `SELECT to_regclass('public."${tableName}"') as exists`
  );
  return !!result[0].exists;
}

async function columnExists(queryInterface, tableName, columnName) {
  const [result] = await queryInterface.sequelize.query(
    `SELECT column_name 
     FROM information_schema.columns 
     WHERE table_name = '${tableName}' AND column_name = '${columnName}'`
  );
  return result.length > 0;
}

async function safeAddIndex(queryInterface, table, fields, options) {
  try {
    const exists = await tableExists(queryInterface, table);
    if (!exists) {
      console.warn(`⚠️ Table missing: ${table} → skipping index ${options.name}`);
      return;
    }

    await queryInterface.addIndex(table, fields, options);
  } catch (err) {
    console.warn(`⚠️ Index skip ${options.name}: ${err.message}`);
  }
}

export const up = async (queryInterface) => {

  // ───────── BOOKINGS ─────────
  await safeAddIndex(queryInterface, "booking", ["traveller_id"], {
    name: "idx_bookings_traveller_id",
  });

  await safeAddIndex(queryInterface, "booking", ["parcel_id"], {
    name: "idx_bookings_parcel_id",
  });

  await safeAddIndex(queryInterface, "booking", ["status"], {
    name: "idx_bookings_status",
  });

  await safeAddIndex(queryInterface, "booking", ["createdAt"], {
    name: "idx_bookings_created_at",
  });

  await safeAddIndex(queryInterface, "booking",
    ["traveller_id", "status", "createdAt"],
    { name: "idx_bookings_traveller_status_created" }
  );

  // ───────── PARCEL (SAFE CHECK) ─────────
  const parcelExists = await tableExists(queryInterface, "parcel");

  if (parcelExists) {
    await safeAddIndex(queryInterface, "parcel", ["user_id"], {
      name: "idx_parcels_user_id",
    });

    await safeAddIndex(queryInterface, "parcel", ["user_id", "createdAt"], {
      name: "idx_parcels_user_id_created",
    });

    await safeAddIndex(queryInterface, "parcel", ["status"], {
      name: "idx_parcels_status",
    });

    // IMPORTANT FIX: column check before index
    const hasColumn = await columnExists(queryInterface, "parcel", "selected_partner_id");

    if (hasColumn) {
      await safeAddIndex(queryInterface, "parcel", ["selected_partner_id"], {
        name: "idx_parcels_selected_partner_id",
      });
    }
  } else {
    console.warn("⚠️ parcel table not found → skipping parcel indexes");
  }

  console.log("✅ Performance indexes migration completed safely");
};

export const down = async (queryInterface) => {
  const indexes = [
    ["booking", "idx_bookings_traveller_id"],
    ["booking", "idx_bookings_parcel_id"],
    ["booking", "idx_bookings_status"],
    ["booking", "idx_bookings_created_at"],
    ["booking", "idx_bookings_traveller_status_created"],
    ["parcel", "idx_parcels_user_id"],
    ["parcel", "idx_parcels_user_id_created"],
    ["parcel", "idx_parcels_status"],
    ["parcel", "idx_parcels_selected_partner_id"],
  ];

  for (const [table, name] of indexes) {
    try {
      await queryInterface.removeIndex(table, name);
    } catch (e) {
      console.warn(`Skip remove ${name}: ${e.message}`);
    }
  }

  console.log("✅ Index rollback completed");
};