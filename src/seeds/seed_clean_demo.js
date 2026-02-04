const { Empresa, Convenio, Descuento, CodigoDescuento, ApiConsulta } = require('../models');

async function seedCleanDemo() {
    console.log('🌱 Iniciando Seed Limpio (Fix Proxy URL)...');

    try {
        // 1. Crear Empresa Demo
        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '99999999-9' },
            defaults: { nombre: 'Empresa Demo SA', status: 'ACTIVO' }
        });

        // 2. Crear Configuración API (Araucana)
        // FIX: Usamos el PROXY URL para que el frontend consuama nuestra ruta interna
        const [apiAraucana] = await ApiConsulta.findOrCreate({
            where: { endpoint: '/api/integraciones/araucana/validar' },
            defaults: {
                nombre: 'La Araucana (Proxy)',
                status: 'ACTIVO'
            }
        });

        // Si existe pero tenía otro endpoint (el real), lo actualizamos
        if (apiAraucana.endpoint !== '/api/integraciones/araucana/validar') {
            apiAraucana.endpoint = '/api/integraciones/araucana/validar';
            apiAraucana.nombre = 'La Araucana (Proxy)';
            await apiAraucana.save();
        }

        // 3. Crear Empresa Araucana
        const [empresaAraucana] = await Empresa.findOrCreate({
            where: { rut_empresa: '60101000-1' },
            defaults: { nombre: 'Caja La Araucana', status: 'ACTIVO' }
        });

        // 4. Convenio Interno (Por Código)
        const [convCodigo] = await Convenio.findOrCreate({
            where: { nombre: 'Convenio Código Verano 2026' },
            defaults: {
                empresa_id: empresa.id,
                tipo: 'CODIGO_DESCUENTO',
                api_consulta_id: null,
                tope_monto_ventas: 1000000,
                tope_cantidad_tickets: 100,
                fecha_inicio: new Date(),
                fecha_termino: new Date('2026-12-31'),
                status: 'ACTIVO'
            }
        });

        // 5. Convenio Externo (Araucana)
        const [convAraucana] = await Convenio.findOrCreate({
            where: { nombre: 'Convenio Araucana 2026' },
            defaults: {
                empresa_id: empresaAraucana.id,
                tipo: 'API_EXTERNA',
                api_consulta_id: apiAraucana.id,
                tope_monto_ventas: 5000000,
                tope_cantidad_tickets: 500,
                fecha_inicio: new Date(),
                fecha_termino: new Date('2026-12-31'),
                status: 'ACTIVO'
            }
        });

        // Asegurar que use el API correcto si ya existía
        if (convAraucana.api_consulta_id !== apiAraucana.id) {
            convAraucana.api_consulta_id = apiAraucana.id;
            await convAraucana.save();
        }

        // 6. Códigos y Descuentos
        await CodigoDescuento.findOrCreate({
            where: { codigo: 'VERANO2026' },
            defaults: {
                convenio_id: convCodigo.id,
                status: 'ACTIVO',
                max_usos: 50
            }
        });

        await Descuento.findOrCreate({
            where: { convenio_id: convCodigo.id, tipo_pasajero_id: 1 },
            defaults: { porcentaje_descuento: 15, status: 'ACTIVO' }
        });

        await Descuento.findOrCreate({
            where: { convenio_id: convAraucana.id, tipo_pasajero_id: 1 },
            defaults: { porcentaje_descuento: 20, status: 'ACTIVO' }
        });

        console.log('✅ Seed Corregido Exitosamente.');

    } catch (error) {
        console.error('❌ Error en Seed:', error);
    }
}

if (require.main === module) {
    seedCleanDemo().then(() => process.exit());
}

module.exports = seedCleanDemo;
