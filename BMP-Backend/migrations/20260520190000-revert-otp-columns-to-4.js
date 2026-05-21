/**
 * Migration: Revert OTP columns back to VARCHAR(4)
 * OTP_LENGTH is set to 4 in .env — columns should match.
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn("booking", "pickup_otp", {
    type: Sequelize.STRING(4),
    allowNull: true,
  });

  await queryInterface.changeColumn("booking", "delivery_otp", {
    type: Sequelize.STRING(4),
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn("booking", "pickup_otp", {
    type: Sequelize.STRING(6),
    allowNull: true,
  });

  await queryInterface.changeColumn("booking", "delivery_otp", {
    type: Sequelize.STRING(6),
    allowNull: true,
  });
}
