const { sequelize } = require('../models');
const seedRoles = require('./rol.seed');
const seedUsuarios = require('./usuario.seed');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️ Conectado a la base de datos');

    await seedRoles();
    await seedUsuarios();

    console.log('🌱 Seeds ejecutados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  }
})();
