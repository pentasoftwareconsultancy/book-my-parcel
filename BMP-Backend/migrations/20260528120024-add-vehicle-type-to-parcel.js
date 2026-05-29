export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("parcel", "vehicle_type", {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("parcel", "vehicle_type");
}