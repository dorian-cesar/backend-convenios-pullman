require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function migrate() {
    console.log("🚀 VERIFICANDO ESQUEMA DE BASE DE DATOS...");

    try {
        // 1. Añadir categoria_id a convenios si no existe
        await seq.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('convenios') AND name = 'categoria_id')
            BEGIN
                ALTER TABLE convenios ADD categoria_id INT NULL;
                PRINT '✅ Columna categoria_id añadida a convenios.';
            END
            ELSE
            BEGIN
                PRINT 'ℹ️ La columna categoria_id ya existe en convenios.';
            END
        `);

        // 2. La tabla categorias ya debería existir según tus archivos, pero por si acaso la creamos si falta
        await seq.query(`
            IF OBJECT_ID('categorias', 'U') IS NULL
            BEGIN
                CREATE TABLE categorias (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    nombre NVARCHAR(255) NOT NULL,
                    empresa_id INT NOT NULL,
                    descripcion NVARCHAR(MAX) NULL,
                    status NVARCHAR(50) DEFAULT 'ACTIVO',
                    createdAt DATETIME2 NOT NULL,
                    updatedAt DATETIME2 NOT NULL,
                    deletedAt DATETIME2 NULL
                );
                PRINT '✅ Tabla categorias creada.';
            END
            ELSE
            BEGIN
                PRINT 'ℹ️ La tabla categorias ya existe.';
            END
        `);

    } catch (e) {
        console.error("❌ ERROR EN MIGRACIÓN:", e.message);
    }

    process.exit(0);
}

migrate();
