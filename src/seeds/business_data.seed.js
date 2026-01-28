const { Empresa, Convenio, Descuento, TipoPasajero } = require('../models');

async function seedBusinessData() {
    // 1. Crear Empresa
    const [empresa] = await Empresa.findOrCreate({
        where: { rut_empresa: '76.000.000-1' },
        defaults: {
            nombre: 'Empresa Test S.A.',
            status: 'ACTIVO'
        }
    });

    console.log('✅ Empresa seed creada');

    // 2. Crear Convenio
    const [convenio] = await Convenio.findOrCreate({
        where: { empresa_id: empresa.id, nombre: 'Convenio Verano 2026' },
        defaults: {
            status: 'ACTIVO'
        }
    });

    console.log('✅ Convenio seed creado');

    // 3. Crear Descuentos
    // Buscar tipos de pasajero
    const est = await TipoPasajero.findOne({ where: { nombre: 'ESTUDIANTE' } });
    const gral = await TipoPasajero.findOne({ where: { nombre: 'GENERAL' } });
    const am = await TipoPasajero.findOne({ where: { nombre: 'ADULTO_MAYOR' } });

    if (est) {
        await Descuento.findOrCreate({
            where: { convenio_id: convenio.id, tipo_pasajero_id: est.id },
            defaults: { porcentaje_descuento: 50, status: 'ACTIVO' }
        });
    }

    if (gral) {
        await Descuento.findOrCreate({
            where: { convenio_id: convenio.id, tipo_pasajero_id: gral.id },
            defaults: { porcentaje_descuento: 10, status: 'ACTIVO' }
        });
    }

    if (am) {
        await Descuento.findOrCreate({
            where: { convenio_id: convenio.id, tipo_pasajero_id: am.id },
            defaults: { porcentaje_descuento: 30, status: 'ACTIVO' }
        });
    }

    console.log('✅ Descuentos seed creados');
}

module.exports = seedBusinessData;
