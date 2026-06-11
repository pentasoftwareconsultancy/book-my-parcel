'use strict';

export async function up(queryInterface, Sequelize) {
  console.log('🕒 Adding missing time columns...');

  const tables = await queryInterface.showAllTables();

  // 1. Add missing time columns to traveller_routes
  if (tables.includes('traveller_routes')) {
    const routeTableDesc = await queryInterface.describeTable('traveller_routes');
    
    if (!routeTableDesc.departure_time) {
      await queryInterface.addColumn('traveller_routes', 'departure_time', {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '09:00:00', // Default departure time
      });
      console.log('✅ Added departure_time to traveller_routes');
    } else {
      console.log('ℹ️  departure_time already exists in traveller_routes');
    }

    if (!routeTableDesc.arrival_time) {
      await queryInterface.addColumn('traveller_routes', 'arrival_time', {
        type: Sequelize.TIME,
        allowNull: true,
      });
      console.log('✅ Added arrival_time to traveller_routes');
    } else {
      console.log('ℹ️  arrival_time already exists in traveller_routes');
    }

    // Add other missing columns from the model
    const missingColumns = [
      { name: 'is_recurring', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'recurring_days', type: Sequelize.JSONB, allowNull: true },
      { name: 'recurring_start_date', type: Sequelize.DATEONLY, allowNull: true },
      { name: 'recurring_end_date', type: Sequelize.DATEONLY, allowNull: true },
      { name: 'vehicle_type', type: Sequelize.STRING, allowNull: true }, // Make nullable temporarily
      { name: 'vehicle_number', type: Sequelize.STRING, allowNull: true },
      { name: 'max_weight_kg', type: Sequelize.INTEGER, allowNull: true }, // Make nullable temporarily
      { name: 'available_capacity_kg', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'accepted_parcel_types', type: Sequelize.JSONB, allowNull: true },
      { name: 'min_earning_per_delivery', type: 'DECIMAL(10, 2)', allowNull: true },
      { name: 'route_geometry', type: Sequelize.TEXT, allowNull: true },
      { name: 'total_distance_km', type: 'DECIMAL(10, 2)', allowNull: true },
      { name: 'total_duration_minutes', type: 'DECIMAL(10, 2)', allowNull: true },
      { name: 'localities_passed', type: Sequelize.JSONB, allowNull: true },
      { name: 'pincodes_covered', type: Sequelize.JSONB, allowNull: true },
      { name: 'talukas_passed', type: Sequelize.JSONB, allowNull: true },
      { name: 'cities_passed', type: Sequelize.JSONB, allowNull: true },
      { name: 'landmarks_nearby', type: Sequelize.JSONB, allowNull: true },
      { name: 'transport_mode', type: Sequelize.ENUM('private', 'public'), defaultValue: 'private' },
      { name: 'stops_passed', type: Sequelize.JSONB, allowNull: true },
      { name: 'transit_details', type: Sequelize.JSONB, allowNull: true }
    ];

    for (const col of missingColumns) {
      if (!routeTableDesc[col.name]) {
        try {
          await queryInterface.addColumn('traveller_routes', col.name, {
            type: col.type,
            allowNull: col.allowNull !== false,
            defaultValue: col.defaultValue
          });
          console.log(`✅ Added ${col.name} to traveller_routes`);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.log(`⚠️  Warning adding ${col.name}:`, error.message);
          }
        }
      }
    }
  }

  // 2. Add missing assigned_date column to booking
  if (tables.includes('booking')) {
    const bookingTableDesc = await queryInterface.describeTable('booking');
    
    if (!bookingTableDesc.assigned_date) {
      await queryInterface.addColumn('booking', 'assigned_date', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
      console.log('✅ Added assigned_date to booking');
    } else {
      console.log('ℹ️  assigned_date already exists in booking');
    }

    // Add other potentially missing booking columns
    const missingBookingColumns = [
      { name: 'booking_ref', type: Sequelize.STRING(20), allowNull: true },
      { name: 'tracking_ref', type: Sequelize.STRING(20), allowNull: true },
      { name: 'traveller_id', type: Sequelize.UUID, allowNull: true },
      { name: 'trip_id', type: Sequelize.UUID, allowNull: true },
      { name: 'user_id', type: Sequelize.UUID, allowNull: true },
      { name: 'amount', type: 'DECIMAL(10, 2)', allowNull: true },
      { name: 'payment_mode', type: Sequelize.ENUM('PAY_AFTER_DELIVERY', 'PREPAID'), allowNull: true },
      { name: 'pickup_otp', type: Sequelize.STRING(6), allowNull: true },
      { name: 'delivery_otp', type: Sequelize.STRING(6), allowNull: true },
      { name: 'pickup_otp_expires', type: Sequelize.DATE, allowNull: true },
      { name: 'delivery_otp_expires', type: Sequelize.DATE, allowNull: true }
    ];

    for (const col of missingBookingColumns) {
      if (!bookingTableDesc[col.name]) {
        try {
          await queryInterface.addColumn('booking', col.name, {
            type: col.type,
            allowNull: col.allowNull !== false,
            defaultValue: col.defaultValue
          });
          console.log(`✅ Added ${col.name} to booking`);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.log(`⚠️  Warning adding ${col.name}:`, error.message);
          }
        }
      }
    }
  }

  // 3. Create missing ENUMs
  try {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_traveller_routes_transport_mode AS ENUM ('private', 'public');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_traveller_routes_status AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ Created missing ENUM types for traveller_routes');
  } catch (error) {
    console.log('⚠️  ENUM creation warning:', error.message);
  }

  console.log('🎉 Added all missing time columns successfully');
}

export async function down(queryInterface, Sequelize) {
  console.log('⚠️  This migration cannot be safely reversed (columns may contain data)');
  // Note: We don't remove columns in down() for safety
}