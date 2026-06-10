/**
 * Migration: Create booking table (safe - only if missing)
 * This migration is placed before OTP expansion migrations.
 */

export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('booking')) {
        console.log('[Migration] booking table already exists - skipping create');
        return;
    }

    await queryInterface.createTable('booking', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
        parcel_id: { type: Sequelize.UUID },
        traveller_id: { type: Sequelize.UUID },
        user_id: { type: Sequelize.UUID },
        status: {
            type: Sequelize.ENUM(
                'CREATED',
                'MATCHING',
                'CONFIRMED',
                'PICKUP',
                'IN_TRANSIT',
                'DELIVERED',
                'CANCELLED'
            ),
            allowNull: true
        },
        amount: { type: Sequelize.DECIMAL },
        booking_ref: { type: Sequelize.STRING },
        tracking_ref: { type: Sequelize.STRING },
        pickup_otp: { type: Sequelize.STRING(4), allowNull: true },
        delivery_otp: { type: Sequelize.STRING(4), allowNull: true },
        createdAt: { type: Sequelize.DATE },
        updatedAt: { type: Sequelize.DATE }
    });

    console.log('✅ Created booking table (or skipped if existed)');
}

export async function down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('booking')) {
        console.log('[Migration] booking table not present - skipping drop');
        return;
    }
    await queryInterface.dropTable('booking');
    console.log('✅ Dropped booking table');
}
