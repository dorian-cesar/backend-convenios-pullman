require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('🗄️ Conectado a la base de datos');

    await sequelize.sync();
    logger.info('🗄️ Modelos sincronizados');

    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    logger.error(`❌ Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
}


startServer();
