const { Empresa, Convenio, Descuento, sequelize } = require('../src/models');

async function run() {
    try {
        console.log('--- Seeding/Updating Araucana Config ---');

        // 1. Ensure Empresa exists
        const [emp, createdEmp] = await Empresa.findOrCreate({
            where: { rut_empresa: '60101000-1' }, // RUT ficticio válido o real si lo tuvieran
            defaults: {
                nombre: 'Caja La Araucana',
                status: 'ACTIVO'
            }
        });
        console.log(`Empresa: ${emp.nombre} (ID: ${emp.id})`);

        // 2. Ensure Convenio exists and is configured correctly
        const [conv, createdConv] = await Convenio.findOrCreate({
            where: {
                empresa_id: emp.id,
                nombre: 'Convenio La Araucana'
            },
            defaults: {
                tipo: 'API_EXTERNA',
                endpoint: '/api/integraciones/araucana/validar',
                fecha_inicio: new Date(),
                fecha_termino: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 año
                status: 'ACTIVO'
            }
        });

        // Always update to ensure correct config
        conv.tipo = 'API_EXTERNA';
        conv.endpoint = '/api/integraciones/araucana/validar';
        await conv.save();

        console.log(`Convenio: ${conv.nombre} (ID: ${conv.id})`);
        console.log(`  - Tipo: ${conv.tipo}`);
        console.log(`  - Endpoint: ${conv.endpoint}`);

        // 3. Ensure a default discount exists (optional but good for testing)
        const [desc] = await Descuento.findOrCreate({
            where: { convenio_id: conv.id },
            defaults: {
                porcentaje_descuento: 15,
                fecha_inicio: new Date(),
                fecha_termino: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                status: 'ACTIVO'
            }
        });
        console.log(`Descuento: ${desc.porcentaje_descuento}% (ID: ${desc.id})`);

        console.log('--- Configuration Complete ---');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await sequelize.close();
    }
}

run();
