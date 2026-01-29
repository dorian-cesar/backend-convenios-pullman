require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('🗄️ Conectado a la base de datos');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    // Obtener todas las tablas existentes y borrarlas una por una
    const [results] = await sequelize.query("SHOW TABLES");
    for (const row of results) {
      const tableName = Object.values(row)[0];
      console.log(`🗑️ Borrando tabla: ${tableName}`);
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
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
