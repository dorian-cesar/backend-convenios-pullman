const sequelize = require('./src/config/sequelize.js');

async function run() {
  try {
    console.log('Adding columns to convenios...');
    try {
      await sequelize.query('ALTER TABLE convenios ADD COLUMN is_destacado TINYINT(1) DEFAULT 0 NOT NULL');
    } catch (e) {
      console.log('Error adding is_destacado (might already exist):', e.message);
    }
    
    try {
      await sequelize.query('ALTER TABLE convenios ADD COLUMN descripcion_destacado TEXT');
    } catch (e) {
      console.log('Error adding descripcion_destacado:', e.message);
    }
    
    try {
      await sequelize.query('ALTER TABLE convenios ADD COLUMN logo_destacado VARCHAR(255)');
    } catch (e) {
      console.log('Error adding logo_destacado:', e.message);
    }

    try {
      await sequelize.query('ALTER TABLE convenios ADD COLUMN orden_destacado INT DEFAULT 0 NOT NULL');
    } catch (e) {
      console.log('Error adding orden_destacado:', e.message);
    }

    console.log('Creating configuraciones table...');
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS configuraciones (
          clave VARCHAR(255) PRIMARY KEY,
          valor TEXT NOT NULL,
          descripcion TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      console.log('Created configuraciones table successfully.');
    } catch (e) {
      console.log('Error creating configuraciones:', e.message);
    }
    
    try {
      await sequelize.query(`
        INSERT IGNORE INTO configuraciones (clave, valor, descripcion, createdAt, updatedAt) 
        VALUES ('LIMITE_DESTACADOS', '4', 'Cantidad máxima de convenios destacados en carrusel', NOW(), NOW())
      `);
      console.log('Inserted default LIMITE_DESTACADOS');
    } catch (e) {
      console.log('Error inserting default:', e.message);
    }

    console.log('Done!');
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
