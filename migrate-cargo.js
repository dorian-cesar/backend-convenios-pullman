const { Sequelize } = require('sequelize');

async function migrate() {
  const sequelize = new Sequelize('convenios', 'admin', 'BIWEHB?NtOi6GPo.WaKD-Uvy[I9F', {
    host: 'convenios-pullman.c6xou04wqeof.us-east-1.rds.amazonaws.com',
    dialect: 'mysql',
    port: 3306
  });

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await sequelize.query('ALTER TABLE eventos ADD COLUMN cargo_servicio INT DEFAULT 0;');
    console.log('Column cargo_servicio added to eventos successfully.');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.error('Unable to connect to the database or alter table:', error);
    }
  } finally {
    await sequelize.close();
  }
}

migrate();
