require('dotenv').config();
const { sequelize } = require('./src/models');

async function check() {
  await sequelize.authenticate();
  const [results] = await sequelize.query(`
    SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = '${process.env.NOMBRE_BD}' AND TABLE_NAME = 'eventos'
    AND COLUMN_NAME IN ('fecha_viaje', 'fecha_evento');
  `);
  console.log(results);
  process.exit(0);
}
check().catch(console.error);
