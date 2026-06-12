'use strict';

export async function up(queryInterface, Sequelize) {
  const createEnum = async (name, values) => {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "${name}" AS ENUM (${values.map(v => `'${v}'`).join(',')});
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  };

  // Create ENUMs for missing table status fields
  await createEnum('enum_pending_payment_status', ['PENDING_RECEIPT', 'RECEIVED', 'WITHDRAWN']);
  await createEnum('enum_parcel_trackings_vehicle_type_extended', ['car', 'bike', 'truck', 'walk']);
  await createEnum('enum_parcel_trackings_status_extended', ['initiated', 'picked_up', 'in_transit', 'delivered', 'failed']);
  
  console.log('✅ Created missing ENUMs for table status fields');
}

export async function down(queryInterface, Sequelize) {
  // Drop ENUMs in reverse order
  const enumsToDrop = [
    'enum_parcel_trackings_status_extended',
    'enum_parcel_trackings_vehicle_type_extended', 
    'enum_pending_payment_status'
  ];

  for (const enumName of enumsToDrop) {
    try {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE;`);
      console.log(`✅ Dropped ${enumName}`);
    } catch (error) {
      console.log(`⚠️  Could not drop ${enumName}: ${error.message}`);
    }
  }
}