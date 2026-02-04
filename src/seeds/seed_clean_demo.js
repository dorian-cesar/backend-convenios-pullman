const { Empresa, Convenio, Descuento, CodigoDescuento, ApiConsulta, TipoPasajero } = require('../models');

async function seedCleanDemo() {
    console.log('🌱 Iniciando Seed Limpio...');

    // 1. Limpiar datos antiguos (Opcional, cuidado en prod)
    // await Descuento.destroy({ where: {} });
    // await CodigoDescuento.destroy({ where: {} });
    // await Convenio.destroy({ where: {} });
    // await Empresa.destroy({ where: {} });
    // await ApiConsulta.destroy({ where: {} });

    try {
        // 2. Crear Empresa Demo
        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '99999999-9' },
            defaults: { nombre: 'Empresa Demo SA', status: 'ACTIVO' }
        });

        // 3. Crear API Configuración (Solo Araucana)
        const [apiAraucana] = await ApiConsulta.findOrCreate({
            where: { endpoint: 'https://api.laaraucana.cl/validar' },
            defaults: { nombre: 'La Araucana', status: 'ACTIVO' }
        });

        // 4. Convenio Interno (Por Código)
        const [convCodigo] = await Convenio.findOrCreate({
            where: { nombre: 'Convenio Código Verano 2026' },
            defaults: {
                empresa_id: empresa.id,
                tipo: 'CODIGO_DESCUENTO',
                api_consulta_id: null, // Interno: DTO construye URL dinámicamente
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
                empresa_id: empresa.id,
                tipo: 'API_EXTERNA',
                api_consulta_id: apiAraucana.id,
                tope_monto_ventas: 5000000,
                tope_cantidad_tickets: 500,
                fecha_inicio: new Date(),
                fecha_termino: new Date('2026-12-31'),
                status: 'ACTIVO'
            }
        });

        // 6. Códigos de Descuento (Solo para el interno)
        await CodigoDescuento.findOrCreate({
            where: { codigo: 'VERANO2026' },
            defaults: {
                convenio_id: convCodigo.id,
                status: 'ACTIVO',
                max_usos: 50
            }
        });

        // 7. Descuentos (Reglas de negocio)
        // Asumiendo Tipo Pasajero ID 1 = Adulto
        await Descuento.findOrCreate({
            where: { convenio_id: convCodigo.id, tipo_pasajero_id: 1 },
            defaults: { porcentaje_descuento: 15, status: 'ACTIVO' }
        });

        await Descuento.findOrCreate({
            where: { convenio_id: convAraucana.id, tipo_pasajero_id: 1 },
            defaults: { porcentaje_descuento: 20, status: 'ACTIVO' }
        });

        console.log('✅ Seed Limpio Completado Exitosamente.');

    } catch (error) {
        console.error('❌ Error en Seed:', error);
    }
}

// Ejecutar si se llama directo
if (require.main === module) {
    seedCleanDemo().then(() => process.exit());
}

module.exports = seedCleanDemo;
