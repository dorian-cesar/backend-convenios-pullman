const sequelize = require('../src/config/sequelize');

async function migrate() {
  const tables = ['usuarios', 'convenios', 'empresas', 'beneficiarios', 'eventos'];
  
  for (const table of tables) {
    console.log(`Actualizando tabla: ${table}...`);
    try {
      // Usamos un bloque TRY individual para cada columna por si ya existe
      try { await sequelize.query(`ALTER TABLE ${table} ADD COLUMN created_by VARCHAR(255) NULL;`); } catch (e) {}
      try { await sequelize.query(`ALTER TABLE ${table} ADD COLUMN updated_by VARCHAR(255) NULL;`); } catch (e) {}
      try { await sequelize.query(`ALTER TABLE ${table} ADD COLUMN deleted_by VARCHAR(255) NULL;`); } catch (e) {}
      
      console.log(`✅ Tabla ${table} procesada.`);
    } catch (error) {
      console.error(`❌ Error general actualizando ${table}:`, error.message);
    }
  }
  
  console.log('Migración finalizada.');
  process.exit(0);
}

migrate();
