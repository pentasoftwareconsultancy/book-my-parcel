/**
 * Performance Indexes Migration
 * Safe version (handles missing columns + tables properly)
 */

async function tableExists(queryInterface, tableName) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = :name
     LIMIT 1`,
    {
      replacements: { name: tableName },
      type: queryInterface.sequelize.QueryTypes.SELECT,
    }
  );

  return rows.length > 0;
}

async function safeAddIndex(queryInterface, table, fields, options) {
  try {
    if (!(await tableExists(queryInterface, table))) {
      console.warn(`⚠️ Skipping index ${options.name}: table ${table} not found`);
      return;
    }

    await queryInterface.addIndex(table, fields, options);
  } catch (err) {
    console.warn(`⚠️ Index skip ${options.name}: ${err.message}`);
  }
}

export const up = async (queryInterface) => {
  // ───────────────────────── BOOKING ─────────────────────────
  await safeAddIndex(queryInterface, "booking", ["traveller_id"], {
    name: "idx_bookings_traveller_id",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "booking", ["parcel_id"], {
    name: "idx_bookings_parcel_id",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "booking", ["status"], {
    name: "idx_bookings_status",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "booking", ["createdAt"], {
    name: "idx_bookings_created_at",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "booking", [
    "traveller_id",
    "status",
    "createdAt",
  ], {
    name: "idx_bookings_traveller_status_created",
    ifNotExists: true,
  });

  // ───────────────────────── PARCEL ─────────────────────────
  await safeAddIndex(queryInterface, "parcel", ["user_id"], {
    name: "idx_parcels_user_id",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "parcel", ["user_id", "createdAt"], {
    name: "idx_parcels_user_id_created",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "parcel", ["status"], {
    name: "idx_parcels_status",
    ifNotExists: true,
  });

  // 🔥 SAFE: check table and column first
  const tables = await queryInterface.showAllTables();
  
  if (tables.includes("parcel")) {
    const parcelTable = await queryInterface.describeTable("parcel");

    if (parcelTable.selected_partner_id) {
      await safeAddIndex(queryInterface, "parcel", ["selected_partner_id"], {
        name: "idx_parcels_selected_partner_id",
        ifNotExists: true,
      });
    } else {
      console.warn(
        "⚠️ Skipping selected_partner_id index: column does not exist"
      );
    }
  } else {
    console.warn("⚠️ Skipping parcel table indexes: table does not exist yet");
  }

  // ───────────────────── PARCEL REQUESTS ─────────────────────
  await safeAddIndex(queryInterface, "parcel_requests", [
    "traveller_id",
    "status",
    "created_at",
  ], {
    name: "idx_parcel_requests_traveller_status_created",
    ifNotExists: true,
  });

  // ───────────────────────── USERS ─────────────────────────
  await safeAddIndex(queryInterface, "users", ["createdAt"], {
    name: "idx_users_created_at",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "users", ["phone_number"], {
    name: "idx_users_phone_number",
    ifNotExists: true,
  });

  // ───────────────────── USER ROLES ─────────────────────
  await safeAddIndex(queryInterface, "user_roles", ["user_id"], {
    name: "idx_user_roles_user_id",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "user_roles", ["role_id"], {
    name: "idx_user_roles_role_id",
    ifNotExists: true,
  });

  // ───────────────────── KYC ─────────────────────
  await safeAddIndex(queryInterface, "traveller_kyc", ["status"], {
    name: "idx_traveller_kyc_status",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "traveller_kyc", ["user_id"], {
    name: "idx_traveller_kyc_user_id",
    ifNotExists: true,
  });

  await safeAddIndex(queryInterface, "traveller_kyc", ["created_at"], {
    name: "idx_traveller_kyc_created_at",
    ifNotExists: true,
  });

  console.log("✅ All performance indexes created successfully");
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
    ["parcel_requests", "idx_parcel_requests_traveller_status_created"],
    ["users", "idx_users_created_at"],
    ["users", "idx_users_phone_number"],
    ["user_roles", "idx_user_roles_user_id"],
    ["user_roles", "idx_user_roles_role_id"],
    ["traveller_kyc", "idx_traveller_kyc_status"],
    ["traveller_kyc", "idx_traveller_kyc_user_id"],
    ["traveller_kyc", "idx_traveller_kyc_created_at"],
  ];

  for (const [table, name] of indexes) {
    try {
      await queryInterface.removeIndex(table, name);
    } catch (err) {
      console.warn(`⚠️ Could not remove ${name}: ${err.message}`);
    }
  }

  console.log("✅ All performance indexes removed");
};