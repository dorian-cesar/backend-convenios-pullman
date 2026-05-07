require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function migrate() {
    console.log("🚀 VERIFICANDO ESQUEMA DE BASE DE DATOS (MySQL)...");

    try {
        // 1. Crear tabla categorias si no existe
        await seq.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nombre VARCHAR(255) NOT NULL,
                empresa_id INT NOT NULL,
                descripcion TEXT NULL,
                status ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                deletedAt DATETIME NULL
            ) ENGINE=InnoDB;
        `);
        console.log("✅ Tabla categorias verificada/creada.");

        // 2. Añadir categoria_id a convenios si no existe
        const [columns] = await seq.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'convenios' 
            AND COLUMN_NAME = 'categoria_id' 
            AND TABLE_SCHEMA = DATABASE()
        `);

        if (columns.length === 0) {
            await seq.query("ALTER TABLE convenios ADD COLUMN categoria_id INT NULL AFTER empresa_id");
            console.log("✅ Columna categoria_id añadida a convenios.");
        } else {
            console.log("ℹ️ La columna categoria_id ya existe.");
        }

    } catch (e) {
        console.error("❌ ERROR EN MIGRACIÓN:", e.message);
    }

    process.exit(0);
}

migrate();
