'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        // =========================
        // EXTENSIONS
        // =========================
        await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
        await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "postgis";`);

        // =========================
        // ENUM HANDLING (SAFE CREATE)
        // =========================
        const createEnum = async (name, values) => {
            await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "${name}" AS ENUM (${values.map(v => `'${v}'`).join(',')});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
        };

        await createEnum('enum_booking_status', [
            'CREATED',
            'MATCHING',
            'CONFIRMED',
            'PICKUP',
            'IN_TRANSIT',
            'DELIVERED',
            'CANCELLED'
        ]); await createEnum('enum_parcel_status', [
            'CREATED',
            'MATCHING',
            'PARTNER_SELECTED',
            'CONFIRMED',
            'PICKUP',
            'IN_TRANSIT',
            'DELIVERED',
            'CANCELLED',
            'AUTO_CANCELLED'
        ]); await createEnum('enum_payments_status', ['PENDING']);
        await createEnum('enum_withdrawals_status', ['PENDING']);
        await createEnum('enum_chat_messages_sender_role', ['USER', 'TRAVELLER', 'ADMIN']);
        await createEnum('enum_notifications_role', ['USER', 'TRAVELLER', 'ADMIN']);
        await createEnum('enum_disputes_status', ['OPEN']);
        await createEnum('enum_disputes_role', ['USER', 'TRAVELLER']);
        await createEnum('enum_disputes_resolution', ['REFUND', 'PARTIAL_REFUND', 'REJECT']);
        await createEnum('enum_parcel_requests_status', ['SENT']);
        await createEnum('enum_traveller_profiles_status', ['INCOMPLETE', 'ACTIVE']);
        await createEnum('enum_traveller_routes_transport_mode', ['private']);
        await createEnum('enum_address_type', ['HOME', 'OFFICE', 'OTHER']);
        await createEnum('enum_address_validation_status', ['VALID', 'INVALID', 'PENDING']);
        await createEnum('enum_booking_payment_mode', ['PAY_AFTER_DELIVERY', 'PREPAID']);
        await createEnum('enum_parcel_package_size', ['SMALL', 'MEDIUM', 'LARGE']);
        await createEnum('enum_parcel_trackings_status', ['initiated']);
        await createEnum('enum_parcel_trackings_vehicle_type', ['bike']);
        await createEnum('enum_referrals_status', ['PENDING', 'COMPLETED']);
        await createEnum('enum_delivery_attempts_reason', ['recipient_unavailable']);
        await createEnum('enum_traveller_kyc_status', ['PENDING', 'APPROVED', 'REJECTED']);

        // =========================
        // USERS
        // =========================
        await queryInterface.createTable('users', {
            id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
            email: { type: Sequelize.STRING, allowNull: false },
            password: { type: Sequelize.STRING, allowNull: false },
            phone_number: { type: Sequelize.STRING, allowNull: false },
            alternate_phone: Sequelize.STRING,
            password_changed_at: Sequelize.DATE,
            password_reset_otp: Sequelize.STRING,
            password_reset_otp_expires: Sequelize.DATE,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // USER PROFILE
        // =========================
        await queryInterface.createTable('user_profiles', {
            id: { type: Sequelize.UUID, primaryKey: true },
            user_id: Sequelize.UUID,
            first_name: Sequelize.STRING,
            last_name: Sequelize.STRING,
            referral_code: Sequelize.STRING,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            pincode: Sequelize.STRING,
            lat: Sequelize.DECIMAL,
            lng: Sequelize.DECIMAL,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // ROLES
        // =========================
        await queryInterface.createTable('roles', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: Sequelize.STRING
        });

        await queryInterface.createTable('user_roles', {
            id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
            user_id: Sequelize.UUID,
            role_id: Sequelize.INTEGER,
            assigned_at: Sequelize.DATE
        });

        // =========================
        // ADDRESS
        // =========================
        await queryInterface.createTable('address', {
            id: { type: Sequelize.UUID, primaryKey: true },
            user_profile_id: Sequelize.UUID,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            pincode: Sequelize.STRING,
            latitude: Sequelize.DECIMAL,
            longitude: Sequelize.DECIMAL,
            type: { type: Sequelize.ENUM('HOME', 'OFFICE', 'OTHER') },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // PARCEL
        // =========================
        await queryInterface.createTable('parcel', {
            id: { type: Sequelize.UUID, primaryKey: true },
            user_id: Sequelize.UUID,
            parcel_ref: Sequelize.STRING,
            weight: Sequelize.FLOAT,
            description: Sequelize.TEXT,
            pickup_address_id: Sequelize.UUID,
            delivery_address_id: Sequelize.UUID,
            status: Sequelize.ENUM('CREATED'),
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // BOOKING
        // =========================
        await queryInterface.createTable('booking', {
            id: { type: Sequelize.UUID, primaryKey: true },
            parcel_id: Sequelize.UUID,
            traveller_id: Sequelize.UUID,
            user_id: Sequelize.UUID,
            status: Sequelize.ENUM('CREATED'),
            amount: Sequelize.DECIMAL,
            booking_ref: Sequelize.STRING,
            tracking_ref: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // PAYMENTS
        // =========================
        await queryInterface.createTable('payments', {
            id: { type: Sequelize.UUID, primaryKey: true },
            booking_id: Sequelize.UUID,
            user_id: Sequelize.UUID,
            amount: Sequelize.DECIMAL,
            status: Sequelize.ENUM('PENDING'),
            payment_method: Sequelize.STRING,
            razorpay_order_id: Sequelize.STRING,
            razorpay_payment_id: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // WALLET
        // =========================
        await queryInterface.createTable('wallets', {
            id: { type: Sequelize.UUID, primaryKey: true },
            user_id: Sequelize.UUID,
            balance: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
            currency: { type: Sequelize.STRING, defaultValue: 'INR' },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        await queryInterface.createTable('wallet_transactions', {
            id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
            wallet_id: Sequelize.UUID,
            type: Sequelize.STRING,
            amount: Sequelize.DECIMAL,
            reason: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // NOTIFICATIONS
        // =========================
        await queryInterface.createTable('notifications', {
            id: { type: Sequelize.UUID, primaryKey: true },
            user_id: Sequelize.UUID,
            role: Sequelize.STRING,
            title: Sequelize.STRING,
            message: Sequelize.TEXT,
            is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE
        });

        // =========================
        // CHAT
        // =========================
        await queryInterface.createTable('chat_messages', {
            id: { type: Sequelize.UUID, primaryKey: true },
            booking_id: Sequelize.UUID,
            sender_id: Sequelize.UUID,
            sender_role: Sequelize.STRING,
            message: Sequelize.TEXT,
            is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // DISPUTES
        // =========================
        await queryInterface.createTable('disputes', {
            id: { type: Sequelize.UUID, primaryKey: true },
            booking_id: Sequelize.UUID,
            raised_by: Sequelize.UUID,
            role: Sequelize.STRING,
            dispute_type: Sequelize.STRING,
            status: Sequelize.STRING,
            description: Sequelize.TEXT,
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE
        });

        // =========================
        // TRAVELLER PROFILE (with GIS)
        // =========================
        await queryInterface.createTable('traveller_profiles', {
            id: { type: Sequelize.UUID, primaryKey: true },
            user_id: Sequelize.UUID,
            bio: Sequelize.TEXT,
            rating: Sequelize.FLOAT,
            is_available: Sequelize.BOOLEAN,
            last_known_location: Sequelize.GEOMETRY('POINT'),
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });

        // =========================
        // ROUTES (GIS LINESTRING)
        // =========================
        await queryInterface.createTable('traveller_routes', {
            id: { type: Sequelize.UUID, primaryKey: true },
            traveller_profile_id: Sequelize.UUID,
            origin_address_id: Sequelize.UUID,
            dest_address_id: Sequelize.UUID,
            vehicle_type: Sequelize.STRING,
            route_geom: Sequelize.GEOMETRY('LINESTRING', 4326),
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('traveller_routes');
        await queryInterface.dropTable('traveller_profiles');
        await queryInterface.dropTable('disputes');
        await queryInterface.dropTable('chat_messages');
        await queryInterface.dropTable('notifications');
        await queryInterface.dropTable('wallet_transactions');
        await queryInterface.dropTable('wallets');
        await queryInterface.dropTable('payments');
        await queryInterface.dropTable('booking');
        await queryInterface.dropTable('parcel');
        await queryInterface.dropTable('address');
        await queryInterface.dropTable('user_roles');
        await queryInterface.dropTable('roles');
        await queryInterface.dropTable('user_profiles');
        await queryInterface.dropTable('users');
    }
};
