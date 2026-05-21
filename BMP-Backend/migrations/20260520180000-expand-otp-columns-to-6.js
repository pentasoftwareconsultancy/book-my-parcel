/**
 * Migration: Expand OTP columns from VARCHAR(4) to VARCHAR(6)
 *
 * OTP_LENGTH is set to 6 in .env but the booking table columns
 * pickup_otp and delivery_otp were created as VARCHAR(4), causing
 * "value too long for type character varying(4)" on insert.
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn("booking", "pickup_otp", {
    type: Sequelize.STRING(6),
    allowNull: true,
  });

  await queryInterface.changeColumn("booking", "delivery_otp", {
    type: Sequelize.STRING(6),
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn("booking", "pickup_otp", {
    type: Sequelize.STRING(4),
    allowNull: true,
  });

  await queryInterface.changeColumn("booking", "delivery_otp", {
    type: Sequelize.STRING(4),
    allowNull: true,
  });
}
