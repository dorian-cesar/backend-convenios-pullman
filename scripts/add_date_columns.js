const { sequelize } = require('../src/models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('convenios');

        if (!tableInfo.fecha_inicio) {
            console.log('Adding fecha_inicio...');
            await queryInterface.addColumn('convenios', 'fecha_inicio', {
                type: sequelize.Sequelize.DATEONLY,
                allowNull: true
            });
        } else {
            console.log('fecha_inicio already exists.');
        }

        if (!tableInfo.fecha_termino) {
            console.log('Adding fecha_termino...');
            await queryInterface.addColumn('convenios', 'fecha_termino', {
                type: sequelize.Sequelize.DATEONLY,
                allowNull: true
            });
        } else {
            console.log('fecha_termino already exists.');
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
