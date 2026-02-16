const { Empresa, Convenio, ApiConsulta } = require('../models');

async function seedCarabineros() {
    console.log('👮 Sembrando datos para Carabineros...');

    // 1. Crear Empresa
    const [empresa] = await Empresa.findOrCreate({
        where: { nombre: 'CARABINEROS DE CHILE' },
        defaults: {
            rut_empresa: '60101000-K', // RUT Genérico/Dummy (Sin puntos)
            status: 'ACTIVO'
        }
    });

    // 2. Crear API Consulta (Endpoint interno)
    const endpointCarabineros = '/api/carabineros/validar';
    const [apiCarabineros] = await ApiConsulta.findOrCreate({
        where: { endpoint: endpointCarabineros },
        defaults: {
            nombre: 'Validación Carabineros',
            status: 'ACTIVO'
        }
    });

    // 3. Crear Convenio
    await Convenio.findOrCreate({
        where: { nombre: 'CARABINEROS' },
        defaults: {
            empresa_id: empresa.id,
            tipo: 'API_EXTERNA', // O 'RUTA_INTERNA', dependiendo de cómo se clasifique, pero usa un endpoint
            api_consulta_id: apiCarabineros.id,
            porcentaje_descuento: 15, // Valor por defecto
            codigo: null,
            limitar_por_stock: false,
            limitar_por_monto: false,
            status: 'ACTIVO'
        }
    });

    console.log('✅ Datos de Carabineros creados/verificados');
}

module.exports = seedCarabineros;
