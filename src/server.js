process.env.TZ = 'America/Santiago';
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('🗄️ Conectado a la base de datos');

    // Sincronizar modelos (Seguro para producción: no altera tablas automáticamente)
    await sequelize.sync({ alter: false, force: false });
    logger.info('🗄️ Modelos sincronizados');

    // Cargar modelos dinámicos registrados
    const { RegistroTablaClienteCorporativo } = require('./models');
    const definirModeloDinamico = require('./utils/definirModeloDinamico');
    const tablasDinamicas = await RegistroTablaClienteCorporativo.findAll({ where: { status: 'ACTIVO' } });
    tablasDinamicas.forEach(t => {
      definirModeloDinamico(sequelize, t.nombre_tabla);
    });
    if (tablasDinamicas.length > 0) {
      logger.info(`📋 ${tablasDinamicas.length} modelos dinámicos de clientes corporativos cargados`);
    }

    // Job: Limpieza de convenios vencidos (cada 1 hora)
    const convenioService = require('./services/convenio.service');
    setInterval(async () => {
      try {
        logger.info('⏰ Ejecutando limpieza de convenios vencidos...');
        const result = await convenioService.desactivarConveniosVencidos();
        if (result.total > 0) {
          logger.info(`✅ Cleaned ${result.total} expired conventions.`);
        }
      } catch (err) {
        logger.error('❌ Error en job de limpieza:', err);
      }
    }, 60 * 60 * 1000); // 1 hora

    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    logger.error(`❌ Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
}


startServer();
