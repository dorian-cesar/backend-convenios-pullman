
require('dotenv').config();
const { sequelize, Convenio, Empresa } = require('../models');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('--- Probando campos beneficio e imagenes en Convenio ---');

        // 1. Crear Empresa dummy si no existe
        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '88.888.888-8' },
            defaults: { nombre: 'Empresa Test Fields', status: 'ACTIVO' }
        });

        // 2. Crear Convenio con nuevos campos
        const convenio = await Convenio.create({
            nombre: 'Convenio Test Fields ' + Date.now(),
            empresa_id: empresa.id,
            beneficio: true,
            imagenes: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
            status: 'ACTIVO'
        });

        console.log('✅ Convenio creado ID:', convenio.id);
        console.log('   Beneficio:', convenio.beneficio);
        console.log('   Imagenes:', convenio.imagenes);

        if (convenio.beneficio !== true) throw new Error('Beneficio no se guardó correctamente');
        if (!Array.isArray(convenio.imagenes) || convenio.imagenes.length !== 2) throw new Error('Imagenes no se guardó correctamente');

        // 3. Actualizar
        await convenio.update({
            beneficio: false,
            imagenes: ['https://example.com/img3.jpg']
        });

        await convenio.reload();
        console.log('✅ Convenio actualizado');
        console.log('   Beneficio:', convenio.beneficio);
        console.log('   Imagenes:', convenio.imagenes);

        if (convenio.beneficio !== false) throw new Error('Beneficio no se actualizó correctamente');
        if (convenio.imagenes.length !== 1) throw new Error('Imagenes no se actualizó correctamente');

        // Clean up
        await convenio.destroy({ force: true });
        console.log('--- Test completado exitosamente ---');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en test:', error);
        process.exit(1);
    }
}

test();
