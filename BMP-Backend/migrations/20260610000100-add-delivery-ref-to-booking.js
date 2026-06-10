'use strict';

export async function up(queryInterface, Sequelize) {
  console.log('📦 Adding delivery_ref column to booking...');

  const tables = await queryInterface.showAllTables();

  if (tables.includes('booking')) {
    const bookingTableDesc = await queryInterface.describeTable('booking');
    
    if (!bookingTableDesc.delivery_ref) {
      await queryInterface.addColumn('booking', 'delivery_ref', {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      });
      console.log('✅ Added delivery_ref to booking');
    } else {
      console.log('ℹ️  delivery_ref already exists in booking');
    }

    // Also check for other potentially missing booking columns from the model
    const missingColumns = [
      { name: 'tracking_ref', type: Sequelize.STRING(20), unique: true, allowNull: true }
    ];

    for (const col of missingColumns) {
      if (!bookingTableDesc[col.name]) {
        try {
          await queryInterface.addColumn('booking', col.name, {
            type: col.type,
            allowNull: col.allowNull !== false,
            unique: col.unique || false
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

  console.log('🎉 Booking columns migration completed');
}

export async function down(queryInterface, Sequelize) {
  console.log('⚠️  This migration cannot be safely reversed (columns may contain data)');
}