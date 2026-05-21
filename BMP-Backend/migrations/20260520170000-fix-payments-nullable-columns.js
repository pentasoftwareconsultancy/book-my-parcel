/**
 * Migration: Fix payments table column constraints
 *
 * The payments table was originally created by sequelize.sync() with:
 *   - booking_id NOT NULL  (payment was always tied to a booking at creation)
 *   - user_id    NOT NULL  (old column, no longer in the model)
 *
 * The flow has since changed: a Payment is created BEFORE the booking exists
 * (at order creation time), and booking_id is linked later after verification.
 * user_id is no longer tracked on the payment row (it's on the parcel).
 *
 * Fixes:
 *  1. ALTER booking_id to allow NULL
 *  2. ALTER user_id to allow NULL (keeps the column, just stops blocking inserts)
 */

export async function up(queryInterface, Sequelize) {
  // 1. Make booking_id nullable
  await queryInterface.changeColumn("payments", "booking_id", {
    type: Sequelize.UUID,
    allowNull: true,
  });

  // 2. Make user_id nullable (column exists in DB but not in model)
  await queryInterface.changeColumn("payments", "user_id", {
    type: Sequelize.UUID,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  // Note: reverting to NOT NULL will fail if any rows have NULL values.
  await queryInterface.changeColumn("payments", "booking_id", {
    type: Sequelize.UUID,
    allowNull: false,
  });
  await queryInterface.changeColumn("payments", "user_id", {
    type: Sequelize.UUID,
    allowNull: false,
  });
}
