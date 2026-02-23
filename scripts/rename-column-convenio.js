const { sequelize } = require('../src/models');

async function renameColumn() {
    try {
        console.log('Renaming column tope_monto_ventas to tope_monto_descuento in convenios table...');
        const queryInterface = sequelize.getQueryInterface();

        // Verificar si la columna existe antes de renombrar
        const tableDescription = await queryInterface.describeTable('convenios');

        if (tableDescription.tope_monto_ventas) {
            await queryInterface.renameColumn('convenios', 'tope_monto_ventas', 'tope_monto_descuento');
            console.log('Column renamed successfully.');
        } else if (tableDescription.tope_monto_descuento) {
            console.log('Column already renamed.');
        } else {
            console.error('Column tope_monto_ventas not found.');
        }

    } catch (error) {
        console.error('Error renaming column:', error);
    } finally {
        await sequelize.close();
    }
}

renameColumn();
