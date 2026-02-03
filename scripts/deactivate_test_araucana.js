const { Convenio } = require('../src/models');
const sequelize = require('../src/config/sequelize');

async function deactivate() {
    try {
        await sequelize.authenticate();
        console.log('Conectado a DB');

        const result = await Convenio.update(
            { status: 'INACTIVO' },
            {
                where: {
                    nombre: 'Convenio Araucana Test',
                    status: 'ACTIVO'
                }
            }
        );

        console.log(`Convenios desactivados: ${result[0]}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

deactivate();
