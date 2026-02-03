const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.NOMBRE_BD,
    process.env.USUARIO_BD,
    process.env.CLAVE_BD,
    {
        host: process.env.HOST_BD,
        port: process.env.PORT_BD,
        dialect: 'mysql',
        logging: console.log
    }
);

const queryInterface = sequelize.getQueryInterface();

async function run() {
    try {
        console.log('--- Migrating Endpoint to Table ---');

        // 1. Create apis_consulta table
        console.log('Creating table apis_consulta...');
        await queryInterface.createTable('apis_consulta', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            nombre: {
                type: DataTypes.STRING,
                allowNull: false
            },
            endpoint: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'ACTIVO'
            }
        });

        // 2. Add api_consulta_id to convenios
        const tableInfo = await queryInterface.describeTable('convenios');
        if (!tableInfo.api_consulta_id) {
            console.log('Adding column api_consulta_id to convenios...');
            await queryInterface.addColumn('convenios', 'api_consulta_id', {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'apis_consulta',
                    key: 'id'
                }
            });
        }

        // 3. Migrate Data
        console.log('Migrating data...');
        // Raw query to find convenios with endpoint
        const [results] = await sequelize.query("SELECT id, nombre, endpoint FROM convenios WHERE endpoint IS NOT NULL AND endpoint != ''");

        for (const row of results) {
            console.log(`Processing Convenio ID ${row.id}: ${row.endpoint}`);

            // Create ApiConsulta entry
            // Check if exists to avoid dupes (simple logic based on endpoint)
            const [apis] = await sequelize.query(`SELECT id FROM apis_consulta WHERE endpoint = '${row.endpoint}' LIMIT 1`);

            let apiId;
            if (apis.length > 0) {
                apiId = apis[0].id;
                console.log(`  -> Found existing API ID ${apiId}`);
            } else {
                // Insert new
                const apiName = `API para ${row.nombre}`;
                const [insertRes] = await sequelize.query(`INSERT INTO apis_consulta (nombre, endpoint, status) VALUES ('${apiName}', '${row.endpoint}', 'ACTIVO')`);
                apiId = insertRes; // mysql returns insertId
                console.log(`  -> Created new API ID ${apiId}`);
            }

            // Update Convenio
            await sequelize.query(`UPDATE convenios SET api_consulta_id = ${apiId} WHERE id = ${row.id}`);
        }

        // 4. Drop endpoint column
        if (tableInfo.endpoint) {
            console.log('Dropping column endpoint from convenios...');
            await queryInterface.removeColumn('convenios', 'endpoint');
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

run();
