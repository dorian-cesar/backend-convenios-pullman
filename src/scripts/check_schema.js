
const { sequelize } = require('../models');

async function checkSchema() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const table = await queryInterface.describeTable('eventos');
        if (table.tipo_pago) {
            console.log('✅ La columna tipo_pago EXISTE en la tabla eventos.');
            process.exit(0);
        } else {
            console.error('❌ La columna tipo_pago NO EXISTE en la tabla eventos.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
