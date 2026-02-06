const { Convenio, Empresa, ApiConsulta } = require('../models');

async function seedConvenios() {
    // Buscar empresas creadas previamente
    const empresaTest = await Empresa.findOne({ where: { nombre: 'Empresa Test S.A.' } });
    const araucana = await Empresa.findOne({ where: { nombre: 'Caja La Araucana' } });

    if (!empresaTest || !araucana) {
        console.error('❌ Error: Empresas no encontradas para convenios.');
        return;
    }

    // 1. Convenio de Código Genérico (Template unificado)
    const templatePath = '/api/convenios/validar/{codigo}';
    const [apiPromo] = await ApiConsulta.findOrCreate({
        where: { endpoint: templatePath },
        defaults: { nombre: 'Validación de Códigos Internos', status: 'ACTIVO' }
    });

    await Convenio.findOrCreate({
        where: { codigo: 'PROMO2026' },
        defaults: {
            nombre: 'Convenio Descuento Directo',
            empresa_id: empresaTest.id,
            tipo: 'CODIGO_DESCUENTO',
            api_consulta_id: apiPromo.id,
            porcentaje_descuento: 20,
            limitar_por_stock: false,
            limitar_por_monto: false,
            status: 'ACTIVO'
        }
    });

    // 2. Convenio La Araucana (API EXTERNA - RUTA RELATIVA)
    const endpointAraucana = '/api/integraciones/araucana/validar';
    const [apiAraucana] = await ApiConsulta.findOrCreate({
        where: { endpoint: endpointAraucana },
        defaults: { nombre: 'API La Araucana', status: 'ACTIVO' }
    });

    await Convenio.findOrCreate({
        where: { nombre: 'Convenio Caja La Araucana' },
        defaults: {
            empresa_id: araucana.id,
            tipo: 'API_EXTERNA',
            api_consulta_id: apiAraucana.id,
            porcentaje_descuento: 15,
            codigo: null,
            limitar_por_stock: true,
            tope_cantidad_tickets: 100,
            status: 'ACTIVO'
        }
    });

    console.log('✅ Convenios seed creados (Esquema Unificado)');
}

module.exports = seedConvenios;
