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
        console.log('Checking columns for limits...');
        const tableInfo = await queryInterface.describeTable('convenios');

        if (!tableInfo.tope_monto_ventas) {
            console.log('Adding column "tope_monto_ventas"...');
            await queryInterface.addColumn('convenios', 'tope_monto_ventas', {
                type: DataTypes.INTEGER,
                allowNull: true
            });
        } else {
            console.log('Column "tope_monto_ventas" already exists.');
        }

        if (!tableInfo.tope_cantidad_tickets) {
            console.log('Adding column "tope_cantidad_tickets"...');
            await queryInterface.addColumn('convenios', 'tope_cantidad_tickets', {
                type: DataTypes.INTEGER,
                allowNull: true
            });
        } else {
            console.log('Column "tope_cantidad_tickets" already exists.');
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

run();
