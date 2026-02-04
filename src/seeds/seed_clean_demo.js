const { Empresa, Convenio, Descuento, CodigoDescuento, ApiConsulta } = require('../models');

async function seedCleanDemo() {
    console.log('🌱 Iniciando Seed Limpio (Aligned with User JSON)...');

    try {
        // 1. Crear Empresa "Test Alarms Corp"
        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '99999999-9' },
            defaults: { nombre: 'Test Alarms Corp', status: 'ACTIVO' }
        });

        // 2. Crear Configuración API (Araucana)
        // Endpoint relativo como pide el usuario en su JSON de ejemplo
        const [apiAraucana] = await ApiConsulta.findOrCreate({
            where: { endpoint: 'https://convenios.dev-wit.com/api/integraciones/araucana/validar' },
            defaults: {
                nombre: 'La Araucana (External)',
                status: 'ACTIVO'
            }
        });

        // 3. Empresa "Test Alarms Corp" (User wants this entreprise for BOTH convenios in the example?)
        // In the JSON, BOTH convenios have "Test Alarms Corp" (id 75).
        // Let's use the same 'empresa' variable.

        // 4. Convenio Interno (Por Código)
        const [convCodigo] = await Convenio.findOrCreate({
            where: { nombre: 'Convenio Código Verano 2026' },
            defaults: {
                empresa_id: empresa.id,
                tipo: 'CODIGO_DESCUENTO',
                api_consulta_id: null,
                tope_monto_ventas: 1000000,
                tope_cantidad_tickets: 100,
                fecha_inicio: '2026-02-04T14:57:40.000Z',
                fecha_termino: '2026-12-31T00:00:00.000Z',
                status: 'ACTIVO'
            }
        });

        // 5. Convenio Externo (Araucana)
        const [convAraucana] = await Convenio.findOrCreate({
            where: { nombre: 'Convenio Araucana 2026' },
            defaults: {
                empresa_id: empresa.id, // User JSON shows SAME company for both
                tipo: 'API_EXTERNA',
                api_consulta_id: apiAraucana.id,
                tope_monto_ventas: 5000000,
                tope_cantidad_tickets: 500,
                fecha_inicio: '2026-02-04T14:57:41.000Z',
                fecha_termino: '2026-12-31T00:00:00.000Z',
                status: 'ACTIVO'
            }
        });

        // Asegurar que use el API correcto
        if (convAraucana.api_consulta_id !== apiAraucana.id) {
            convAraucana.api_consulta_id = apiAraucana.id;
            await convAraucana.save();
        }

        // 6. Códigos y Descuentos
        // Descuento para Código (15%)
        await Descuento.findOrCreate({
            where: { convenio_id: convCodigo.id },
            defaults: {
                porcentaje_descuento: 15,
                tipo_pasajero_id: 1,
                status: 'ACTIVO'
            }
        });

        // Descuento para Araucana (20%)
        await Descuento.findOrCreate({
            where: { convenio_id: convAraucana.id },
            defaults: {
                porcentaje_descuento: 20,
                tipo_pasajero_id: 1,
                status: 'ACTIVO'
            }
        });

        console.log('✅ Seed Corregido Exitosamente con Estructura Solicitada.');

    } catch (error) {
        console.error('❌ Error en Seed:', error);
    }
}

if (require.main === module) {
    seedCleanDemo().then(() => process.exit());
}

module.exports = seedCleanDemo;
