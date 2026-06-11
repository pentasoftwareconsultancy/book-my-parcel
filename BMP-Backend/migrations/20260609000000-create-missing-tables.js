'use strict';

export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();

  // 1. aadhaar_verifications
  if (!tables.includes('aadhaar_verifications')) {
    await queryInterface.createTable('aadhaar_verifications', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      traveller_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      aadhaar_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'PENDING',
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      verification_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created aadhaar_verifications');
  }

  // 2. booking_status_logs
  if (!tables.includes('booking_status_logs')) {
    await queryInterface.createTable('booking_status_logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      old_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      new_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      changed_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created booking_status_logs');
  }

  // 3. parcel_proofs
  if (!tables.includes('parcel_proofs')) {
    await queryInterface.createTable('parcel_proofs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING, // PICKUP / DELIVERY
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created parcel_proofs');
  }

  // 4. parcel_trackings
  if (!tables.includes('parcel_trackings')) {
    await queryInterface.createTable('parcel_trackings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      vehicle_type: {
        type: Sequelize.ENUM('car', 'bike', 'truck', 'walk'),
        defaultValue: 'bike',
      },
      pickup_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      pickup_lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      delivery_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      delivery_lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      encoded_polyline: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      distance_meters: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      duration_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      traveller_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      traveller_lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      speed: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      heading: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('initiated', 'picked_up', 'in_transit', 'delivered', 'failed'),
        defaultValue: 'initiated',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created parcel_trackings');
  }

  // 5. pending_payment
  if (!tables.includes('pending_payment')) {
    await queryInterface.createTable('pending_payment', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      traveller_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING_RECEIPT', 'RECEIVED', 'WITHDRAWN'),
        defaultValue: 'PENDING_RECEIPT',
      },
      delivery_ref: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      withdrawn_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created pending_payment');
  }

  // 6. refunds
  if (!tables.includes('refunds')) {
    await queryInterface.createTable('refunds', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING, // REQUESTED / COMPLETED
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created refunds');
  }

  // 7. traveller_kyc
  if (!tables.includes('traveller_kyc')) {
    await queryInterface.createTable('traveller_kyc', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      pan_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      aadhaar_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      driving_license: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_account_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_ifsc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'NOT_STARTED',
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      verification_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created traveller_kyc');
  }

  // 8. traveller_trips
  if (!tables.includes('traveller_trips')) {
    await queryInterface.createTable('traveller_trips', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      traveller_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      source_city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      destination_city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      available_weight: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ Created traveller_trips');
  }
}

export async function down(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();

  const tablesToDrop = [
    'traveller_trips',
    'traveller_kyc', 
    'refunds',
    'pending_payment',
    'parcel_trackings',
    'parcel_proofs',
    'booking_status_logs',
    'aadhaar_verifications'
  ];

  for (const tableName of tablesToDrop) {
    if (tables.includes(tableName)) {
      await queryInterface.dropTable(tableName);
      console.log(`✅ Dropped ${tableName}`);
    }
  }
}