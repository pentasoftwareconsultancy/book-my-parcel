'use strict';

export async function up(queryInterface, Sequelize) {
  console.log('🔧 Fixing missing ENUM values and columns...');

  // 1. Check if departure_date and arrival_date columns exist
  const tables = await queryInterface.showAllTables();
  if (tables.includes('traveller_routes')) {
    const tableDesc = await queryInterface.describeTable('traveller_routes');
    
    if (!tableDesc.departure_date) {
      await queryInterface.addColumn('traveller_routes', 'departure_date', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
      console.log('✅ Added departure_date to traveller_routes');
    } else {
      console.log('ℹ️  departure_date already exists in traveller_routes');
    }

    if (!tableDesc.arrival_date) {
      await queryInterface.addColumn('traveller_routes', 'arrival_date', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
      console.log('✅ Added arrival_date to traveller_routes');
    } else {
      console.log('ℹ️  arrival_date already exists in traveller_routes');
    }
  }

  // 2. Add missing booking status ENUM values
  try {
    const bookingStatusValues = [
      'CREATED',
      'MATCHING', 
      'CONFIRMED',
      'PICKUP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED'
    ];

    for (const status of bookingStatusValues) {
      try {
        await queryInterface.sequelize.query(`
          ALTER TYPE enum_booking_status ADD VALUE IF NOT EXISTS '${status}';
        `);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`⚠️  Warning adding ${status}:`, error.message);
        }
      }
    }
    console.log('✅ Updated enum_booking_status with all required values');

    // 3. Add missing parcel status ENUM values
    const parcelStatusValues = [
      'CREATED',
      'MATCHING',
      'PARTNER_SELECTED', 
      'CONFIRMED',
      'PICKUP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED'
    ];

    for (const status of parcelStatusValues) {
      try {
        await queryInterface.sequelize.query(`
          ALTER TYPE enum_parcel_status ADD VALUE IF NOT EXISTS '${status}';
        `);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`⚠️  Warning adding parcel ${status}:`, error.message);
        }
      }
    }
    console.log('✅ Updated enum_parcel_status with all required values');

    // 4. Add missing payment status ENUM values
    const paymentStatusValues = [
      'CREATED',
      'PENDING',
      'SUCCESS', 
      'FAILED',
      'REFUNDED'
    ];

    for (const status of paymentStatusValues) {
      try {
        await queryInterface.sequelize.query(`
          ALTER TYPE enum_payments_status ADD VALUE IF NOT EXISTS '${status}';
        `);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`⚠️  Warning adding payment ${status}:`, error.message);
        }
      }
    }
    console.log('✅ Updated enum_payments_status with all required values');

  } catch (error) {
    console.error('❌ Error updating ENUM values:', error.message);
    throw error;
  }

  console.log('🎉 Fixed missing ENUM values and columns successfully');
}

export async function down(queryInterface, Sequelize) {
  console.log('⚠️  This migration cannot be safely reversed (ENUM values cannot be removed safely)');
  // Note: PostgreSQL doesn't support removing ENUM values easily
  // The columns can be removed if needed, but we'll skip for safety
}