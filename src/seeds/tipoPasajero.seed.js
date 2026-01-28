const { TipoPasajero } = require('../models');

async function seedTipoPasajero() {
    const tipos = [
        { nombre: 'ESTUDIANTE', edad_min: 0, edad_max: 29, status: 'ACTIVO' },
        { nombre: 'ADULTO_MAYOR', edad_min: 60, edad_max: 150, status: 'ACTIVO' },
        { nombre: 'GENERAL', edad_min: 18, edad_max: 59, status: 'ACTIVO' }
    ];

    for (const tipo of tipos) {
        await TipoPasajero.findOrCreate({
            where: { nombre: tipo.nombre },
            defaults: tipo
        });
    }

    console.log('✅ TipoPasajero seed creados');
}

module.exports = seedTipoPasajero;
