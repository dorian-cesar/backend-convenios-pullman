require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('🗄️ Conectado a la base de datos');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Lista de tablas sospechosas que podrían estar chocando
    const tables = [
      'usuario_roles', 'tipos_pasajero', 'codigos_descuento', 'convenios', 'descuentos', 'eventos', 'pasajeros', 'usuarios', 'roles', 'empresas',
      'USUARIO_ROLES', 'TIPOS_PASAJERO', 'CODIGOS_DESCUENTO', 'CONVENIOS', 'DESCUENTOS', 'EVENTOS', 'PASAJEROS', 'USUARIOS', 'ROLES', 'EMPRESAS',
      'documentos_convenio'
    ];

    for (const table of tables) {
      await sequelize.query(`DROP TABLE IF EXISTS \`${table}\``);
    }

    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗄️ Modelos sincronizados');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
