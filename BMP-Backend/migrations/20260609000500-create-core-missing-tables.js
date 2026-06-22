'use strict';

export async function up(queryInterface, Sequelize) {
  console.log('🏗️  Creating core missing tables...');

  const tables = await queryInterface.showAllTables();
  console.log(`📊 Current tables (${tables.length}):`, tables.join(', '));

  // Create extensions first
  await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Create ENUMs
  const createEnum = async (name, values) => {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "${name}" AS ENUM (${values.map(v => `'${v}'`).join(',')});
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  };

  await createEnum('enum_booking_status', ['CREATED', 'MATCHING', 'CONFIRMED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']);
  await createEnum('enum_parcel_status', ['CREATED', 'MATCHING', 'PARTNER_SELECTED', 'CONFIRMED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'AUTO_CANCELLED']);
  await createEnum('enum_payments_status', ['CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']);
  await createEnum('enum_withdrawals_status', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);
  await createEnum('enum_chat_messages_sender_role', ['USER', 'TRAVELLER', 'ADMIN']);
  await createEnum('enum_notifications_role', ['USER', 'TRAVELLER', 'ADMIN']);
  await createEnum('enum_address_type', ['HOME', 'OFFICE', 'OTHER']);
  await createEnum('enum_traveller_profiles_status', ['INCOMPLETE', 'ACTIVE', 'INACTIVE']);
  await createEnum('enum_traveller_routes_status', ['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']);
  await createEnum('enum_traveller_kyc_status', ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED']);

  // 1. Users table
  if (!tables.includes('users')) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      email: { type: Sequelize.STRING, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      phone_number: { type: Sequelize.STRING, allowNull: false },
      alternate_phone: Sequelize.STRING,
      password_changed_at: Sequelize.DATE,
      password_reset_otp: Sequelize.STRING,
      password_reset_otp_expires: Sequelize.DATE,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created users');
  }

  // 2. Roles table
  if (!tables.includes('roles')) {
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created roles');
  }

  // 3. User roles
  if (!tables.includes('user_roles')) {
    await queryInterface.createTable('user_roles', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      role_id: { type: Sequelize.UUID, allowNull: false },
      assigned_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created user_roles');
  }

  // 4. User profiles
  if (!tables.includes('user_profiles')) {
    await queryInterface.createTable('user_profiles', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      name: Sequelize.STRING,
      address: Sequelize.TEXT,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      pincode: Sequelize.STRING,
      referral_code: { type: Sequelize.STRING, unique: true },
      lat: Sequelize.DECIMAL,
      lng: Sequelize.DECIMAL,
      avatar_url: Sequelize.STRING,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created user_profiles');
  }

  // 5. Address table
  if (!tables.includes('address')) {
    await queryInterface.createTable('address', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_profile_id: Sequelize.UUID,
      name: Sequelize.STRING,
      address: Sequelize.TEXT,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      pincode: Sequelize.STRING,
      phone: Sequelize.STRING,
      latitude: Sequelize.DECIMAL,
      longitude: Sequelize.DECIMAL,
      type: { type: Sequelize.ENUM('HOME','OFFICE','OTHER'), defaultValue: 'HOME' },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created address');
  }

  // 6. Parcel table - THIS WAS MISSING!
  if (!tables.includes('parcel')) {
    await queryInterface.createTable('parcel', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      parcel_ref: { type: Sequelize.STRING(20), unique: true },
      package_size: { type: Sequelize.ENUM('small', 'medium', 'large', 'extra_large'), allowNull: false },
      weight: { type: Sequelize.FLOAT, allowNull: false },
      length: Sequelize.FLOAT,
      width: Sequelize.FLOAT,
      height: Sequelize.FLOAT,
      description: Sequelize.TEXT,
      parcel_type: Sequelize.STRING,
      value: Sequelize.FLOAT,
      vehicle_type: Sequelize.STRING,
      notes: Sequelize.TEXT,
      photos: Sequelize.JSONB,
      pickup_address_id: { type: Sequelize.UUID, allowNull: false },
      pickup_date: Sequelize.DATEONLY,
      pickup_time: Sequelize.TIME,
      delivery_address_id: { type: Sequelize.UUID, allowNull: false },
      selected_partner_id: Sequelize.UUID,
      price_quote: Sequelize.FLOAT,
      form_step: { type: Sequelize.INTEGER, defaultValue: 1 },
      selected_acceptance_id: Sequelize.UUID,
      route_distance_km: Sequelize.FLOAT,
      route_duration_minutes: Sequelize.FLOAT,
      intermediate_cities: Sequelize.JSONB,
      route_geometry: Sequelize.TEXT,
      status: {
        type: Sequelize.ENUM('CREATED', 'MATCHING', 'PARTNER_SELECTED', 'CONFIRMED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'AUTO_CANCELLED'),
        defaultValue: 'CREATED'
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created parcel');
  }

  // 7. Traveller profiles
  if (!tables.includes('traveller_profiles')) {
    await queryInterface.createTable('traveller_profiles', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      bio: Sequelize.TEXT,
      vehicle_type: Sequelize.STRING,
      vehicle_number: Sequelize.STRING,
      vehicle_model: Sequelize.STRING,
      capacity_kg: Sequelize.INTEGER,
      rating: { type: Sequelize.FLOAT, defaultValue: 0 },
      total_ratings: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_deliveries: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_available: { type: Sequelize.BOOLEAN, defaultValue: true },
      status: { type: Sequelize.ENUM('INCOMPLETE', 'ACTIVE', 'INACTIVE'), defaultValue: 'INCOMPLETE' },
      location: Sequelize.STRING,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created traveller_profiles');
  }

  // 8. Booking table
  if (!tables.includes('booking')) {
    await queryInterface.createTable('booking', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      parcel_id: { type: Sequelize.UUID, allowNull: false },
      user_id: Sequelize.UUID,
      traveller_id: Sequelize.UUID,
      trip_id: Sequelize.UUID,
      status: { type: Sequelize.ENUM('CREATED','MATCHING','CONFIRMED','PICKUP','IN_TRANSIT','DELIVERED','CANCELLED'), defaultValue: 'CREATED' },
      assigned_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      booking_ref: { type: Sequelize.STRING(20), unique: true },
      tracking_ref: { type: Sequelize.STRING(20) },
      amount: 'DECIMAL(10, 2)',
      payment_mode: { type: Sequelize.ENUM('PAY_AFTER_DELIVERY', 'PREPAID') },
      pickup_otp: Sequelize.STRING(6),
      delivery_otp: Sequelize.STRING(6),
      pickup_otp_expires: Sequelize.DATE,
      delivery_otp_expires: Sequelize.DATE,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created booking');
  }

  // 9. Payments table
  if (!tables.includes('payments')) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      booking_id: { type: Sequelize.UUID, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false },
      amount: { type: 'DECIMAL(10, 2)', allowNull: false },
      status: { type: Sequelize.ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'), defaultValue: 'CREATED' },
      payment_method: Sequelize.STRING,
      razorpay_order_id: { type: Sequelize.STRING, unique: true },
      razorpay_payment_id: Sequelize.STRING,
      wallet_credit_released: { type: Sequelize.BOOLEAN, defaultValue: false },
      released_at: Sequelize.DATE,
      wallet_txn_id: Sequelize.UUID,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created payments');
  }

  // 10. Wallets
  if (!tables.includes('wallets')) {
    await queryInterface.createTable('wallets', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false, unique: true },
      balance: { type: 'DECIMAL(10,2)', defaultValue: 0 },
      currency: { type: Sequelize.STRING, defaultValue: 'INR' },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created wallets');
  }

  // 11. Wallet transactions
  if (!tables.includes('wallet_transactions')) {
    await queryInterface.createTable('wallet_transactions', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      wallet_id: { type: Sequelize.UUID, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      amount: { type: 'DECIMAL(10, 2)', allowNull: false },
      reason: Sequelize.STRING,
      reference_id: Sequelize.UUID,
      idempotency_key: Sequelize.STRING,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    console.log('✅ Created wallet_transactions');
  }

  const finalTables = await queryInterface.showAllTables();
  console.log(`🎉 Migration complete! Tables now: ${finalTables.length}`);
}

export async function down(queryInterface, Sequelize) {
  console.log('⚠️  This migration cannot be safely reversed');
}
