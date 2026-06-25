/**
 * Migration: Revert OTP columns back to VARCHAR(4)
 * OTP_LENGTH is set to 4 in .env — columns should match.
 * 
 * This migration truncates existing OTP values to 4 characters before changing the column type.
 */

export async function up(queryInterface, Sequelize) {
  // First, truncate any OTP values longer than 4 characters
  await queryInterface.sequelize.query(
    `UPDATE "booking" SET pickup_otp = SUBSTRING(pickup_otp, 1, 4) WHERE LENGTH(pickup_otp) > 4;`
  );
  
  await queryInterface.sequelize.query(
    `UPDATE "booking" SET delivery_otp = SUBSTRING(delivery_otp, 1, 4) WHERE LENGTH(delivery_otp) > 4;`
  );

  // Now change the column type
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
