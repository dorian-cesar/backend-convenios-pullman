require('dotenv').config();
const { sequelize } = require('./src/models');

async function check() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  const tableInfo = await queryInterface.describeTable('eventos');
  console.log("fecha_viaje type:", tableInfo.fecha_viaje.type);
  console.log("fecha_evento type:", tableInfo.fecha_evento.type);
  process.exit(0);
}
check().catch(console.error);
