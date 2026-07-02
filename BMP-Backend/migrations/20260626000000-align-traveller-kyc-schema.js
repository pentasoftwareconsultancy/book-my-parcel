'use strict';

export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable('traveller_kyc').catch(() => null);
  if (!table) {
    console.log('traveller_kyc table not found; skipping schema alignment');
    return;
  }

  const addColumnIfMissing = async (columnName, definition) => {
    if (!table[columnName]) {
      await queryInterface.addColumn('traveller_kyc', columnName, definition);
      console.log(`✅ Added traveller_kyc.${columnName}`);
    }
  };

  await addColumnIfMissing('first_name', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('last_name', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('dob', { type: Sequelize.DATEONLY, allowNull: true });
  await addColumnIfMissing('gender', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('address', { type: Sequelize.TEXT, allowNull: true });
  await addColumnIfMissing('aadhar_number', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('pan_number', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('driving_number', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('aadhar_front', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('aadhar_back', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('pan_front', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('pan_back', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('driving_photo', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('selfie', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('account_number', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('account_holder', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('ifsc', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('bank_name', { type: Sequelize.STRING, allowNull: true });
  await addColumnIfMissing('bank_verified', { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false });

  if (table.aadhaar_number && !table.aadhar_number) {
    await queryInterface.sequelize.query(`
      UPDATE traveller_kyc
      SET aadhar_number = aadhaar_number
      WHERE aadhar_number IS NULL AND aadhaar_number IS NOT NULL
    `);
  }

  if (table.bank_account_number && !table.account_number) {
    await queryInterface.sequelize.query(`
      UPDATE traveller_kyc
      SET account_number = bank_account_number
      WHERE account_number IS NULL AND bank_account_number IS NOT NULL
    `);
  }

  if (table.bank_ifsc && !table.ifsc) {
    await queryInterface.sequelize.query(`
      UPDATE traveller_kyc
      SET ifsc = bank_ifsc
      WHERE ifsc IS NULL AND bank_ifsc IS NOT NULL
    `);
  }
}

export async function down(queryInterface) {
  // Intentionally left as no-op to avoid destructive rollback.
  await queryInterface.sequelize.query('SELECT 1');
}
