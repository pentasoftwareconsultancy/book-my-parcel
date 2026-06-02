import sequelize from '../src/config/database.config.js';

const [r1] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='user_roles' AND column_name='role_id'");
const [r2] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='roles' AND column_name='id'");

console.log('user_roles.role_id type:', r1[0]?.data_type);
console.log('roles.id type         :', r2[0]?.data_type);

if (r1[0]?.data_type?.includes('int') && r2[0]?.data_type === 'uuid') {
  console.log('\n⚠️  MISMATCH — running fix...');
  await sequelize.query(`ALTER TABLE user_roles DROP COLUMN role_id`);
  await sequelize.query(`ALTER TABLE user_roles ADD COLUMN role_id UUID NOT NULL DEFAULT gen_random_uuid()`);
  console.log('✅ user_roles.role_id changed to UUID');
} else {
  console.log('\n✅ Types match — no fix needed');
}

await sequelize.close();
