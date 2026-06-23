'use strict';

export async function up(queryInterface) {
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      ALTER TYPE "enum_parcel_status" ADD VALUE IF NOT EXISTS 'AUTO_CANCELLED';
    EXCEPTION
      WHEN undefined_object THEN
        CREATE TYPE "enum_parcel_status" AS ENUM (
          'CREATED',
          'MATCHING',
          'PARTNER_SELECTED',
          'CONFIRMED',
          'PICKUP',
          'IN_TRANSIT',
          'DELIVERED',
          'CANCELLED',
          'AUTO_CANCELLED'
        );
    END $$;
  `);
}

export async function down() {
  console.log('AUTO_CANCELLED cannot be safely removed from enum_parcel_status');
}
