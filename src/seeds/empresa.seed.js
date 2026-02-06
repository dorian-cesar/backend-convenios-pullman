const { Empresa } = require('../models');

async function seedEmpresas() {
    const empresas = [
        { nombre: 'Empresa Test S.A.', rut_empresa: '76000000-1', status: 'ACTIVO' },
        { nombre: 'Caja La Araucana', rut_empresa: '70000123-4', status: 'ACTIVO' },
        { nombre: 'Pullman Bus Corporativo', rut_empresa: '80123456-7', status: 'ACTIVO' }
    ];

    for (const emp of empresas) {
        await Empresa.findOrCreate({
            where: { nombre: emp.nombre },
            defaults: emp
        });
    }

    console.log('✅ Empresas seed creadas');
}

module.exports = seedEmpresas;
