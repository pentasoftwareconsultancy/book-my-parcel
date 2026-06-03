import sequelize from '../src/config/database.config.js';

const [roles] = await sequelize.query("SELECT id, name FROM roles ORDER BY id");
console.log('Roles in DB:', roles);

const [userRolesSample] = await sequelize.query("SELECT * FROM user_roles LIMIT 3");
console.log('Sample user_roles:', userRolesSample);

await sequelize.close();
