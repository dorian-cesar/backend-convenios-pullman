const { Empresa, Convenio, Descuento } = require('../models');

async function seed() {
    console.log('--- Seeding Mixed Status Data ---');

    // 1. Company
    const [empresa] = await Empresa.findOrCreate({
        where: { rut_empresa: '99991111-1' },
        defaults: {
            nombre: 'Empresa Mixed Status Test',
            rut_empresa: '99991111-1',
            status: 'ACTIVO'
        }
    });

    // 2. Active + Valid Dates (Should Show)
    const [convValid] = await Convenio.findOrCreate({
        where: { nombre: 'Convenio Valido', empresa_id: empresa.id },
        defaults: {
            status: 'ACTIVO',
            fecha_inicio: new Date(new Date().setDate(new Date().getDate() - 10)),
            fecha_termino: new Date(new Date().setDate(new Date().getDate() + 30))
        }
    });
    await Descuento.create({ convenio_id: convValid.id, porcentaje_descuento: 15, status: 'ACTIVO' });

    // 3. Inactive Convenio (Should Hide)
    const [convInactive] = await Convenio.findOrCreate({
        where: { nombre: 'Convenio Inactivo', empresa_id: empresa.id },
        defaults: {
            status: 'INACTIVO',
            fecha_inicio: new Date(),
            fecha_termino: new Date(new Date().setDate(new Date().getDate() + 30))
        }
    });
    await Descuento.create({ convenio_id: convInactive.id, porcentaje_descuento: 50, status: 'ACTIVO' });

    // 4. Expired Convenio (Should Hide)
    const [convExpired] = await Convenio.findOrCreate({
        where: { nombre: 'Convenio Expirado', empresa_id: empresa.id },
        defaults: {
            status: 'ACTIVO',
            fecha_inicio: new Date(new Date().setDate(new Date().getDate() - 60)),
            fecha_termino: new Date(new Date().setDate(new Date().getDate() - 30))
        }
    });
    await Descuento.create({ convenio_id: convExpired.id, porcentaje_descuento: 90, status: 'ACTIVO' });

    // 5. Future Convenio (Should Hide)
    const [convFuture] = await Convenio.findOrCreate({
        where: { nombre: 'Convenio Futuro', empresa_id: empresa.id },
        defaults: {
            status: 'ACTIVO',
            fecha_inicio: new Date(new Date().setDate(new Date().getDate() + 10)),
            fecha_termino: new Date(new Date().setDate(new Date().getDate() + 40))
        }
    });
    await Descuento.create({ convenio_id: convFuture.id, porcentaje_descuento: 25, status: 'ACTIVO' });

    // 6. Explicitly Inactive Discount (Active Convenio)
    await Descuento.create({ convenio_id: convValid.id, porcentaje_descuento: 5, status: 'INACTIVO' });

    console.log('--- Seed Complete ---');
}

module.exports = seed;
