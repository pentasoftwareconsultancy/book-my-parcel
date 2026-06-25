export async function up(queryInterface, Sequelize) {
   console.log("🔥 Pricing breakdown migration running");
  console.log("🔥 Table = parcel");

 await queryInterface.addColumn(
  "parcel",
  "pricing_breakdown",
  {
    type: Sequelize.JSONB,
    allowNull: true,
  }
);
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("parcel", "pricing_breakdown");
}