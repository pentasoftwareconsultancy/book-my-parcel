'use strict';

export async function up(queryInterface, Sequelize) {
  console.log('📊 Adding status column to traveller_routes...');

  const tables = await queryInterface.showAllTables();

  if (tables.includes('traveller_routes')) {
    const tableDesc = await queryInterface.describeTable('traveller_routes');
    
    if (!tableDesc.status) {
      // First ensure the ENUM exists
      try {
        await queryInterface.sequelize.query(`
          DO $$ BEGIN
            CREATE TYPE enum_traveller_routes_status AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
        console.log('✅ Created enum_traveller_routes_status');
      } catch (error) {
        console.log('ℹ️  ENUM already exists or created');
      }

      // Add the status column
      await queryInterface.addColumn('traveller_routes', 'status', {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      });
      console.log('✅ Added status column to traveller_routes');
    } else {
      console.log('ℹ️  status column already exists in traveller_routes');
    }

    // Also ensure route_geom exists for PostGIS
    if (!tableDesc.route_geom) {
      try {
        await queryInterface.addColumn('traveller_routes', 'route_geom', {
          type: 'GEOMETRY(LINESTRING, 4326)',
          allowNull: true,
        });
        console.log('✅ Added route_geom column to traveller_routes');
      } catch (error) {
        console.log('⚠️  Could not add route_geom (PostGIS may not be available):', error.message);
      }
    }
  }

  console.log('🎉 Status column migration completed');
}

export async function down(queryInterface, Sequelize) {
  console.log('⚠️  This migration cannot be safely reversed (status column may contain data)');
}