/**
 * Script de prueba local para verificar la lógica de asociación Pasajero-Convenio
 * Simula el flujo del controlador araucana.controller.js
 */
const { Pasajero, Empresa, Convenio, ApiConsulta, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function testAssociation() {
    console.log('--- Iniciando prueba de asociación local ---');

    try {
        const testRut = '10520823-5';

        // 1. Simular búsqueda de Empresa
        const empresa = await Empresa.findOne({
            where: { nombre: { [Op.like]: '%Araucana%' } }
        });

        if (!empresa) {
            console.error('❌ Error: Empresa La Araucana no encontrada localmente.');
            return;
        }
        console.log(`✅ Empresa encontrada: ${empresa.nombre} (ID: ${empresa.id})`);

        // 2. Simular búsqueda/creación de Pasajero
        let [pasajero] = await Pasajero.findOrCreate({
            where: { rut: testRut },
            defaults: { nombres: 'Dorian', apellidos: 'Gonzalez', status: 'ACTIVO' }
        });
        console.log(`✅ Pasajero identificado: ${pasajero.rut} (ID: ${pasajero.id})`);

        // 3. Lógica de asociación de Convenio (Lo que corregimos)
        const convenioApi = await Convenio.findOne({
            where: {
                empresa_id: empresa.id,
                status: 'ACTIVO',
                tipo: 'API_EXTERNA'
            },
            include: [{
                model: ApiConsulta,
                as: 'apiConsulta',
                where: { endpoint: '/api/integraciones/araucana/validar' }
            }]
        });

        if (convenioApi) {
            pasajero.empresa_id = empresa.id;
            pasajero.convenio_id = convenioApi.id;
            await pasajero.save();
            console.log(`✅ Convenio asociado exitosamente: ${convenioApi.nombre} (ID: ${convenioApi.id})`);
        } else {
            console.warn('⚠️ No se encontró el convenio específico por endpoint.');

            // Fallback
            const conveniosActivos = await Convenio.findAll({
                where: { empresa_id: empresa.id, status: 'ACTIVO' }
            });
            if (conveniosActivos.length > 0) {
                pasajero.empresa_id = empresa.id;
                pasajero.convenio_id = conveniosActivos[0].id;
                await pasajero.save();
                console.log(`✅ Fallback: Asociado al primer convenio activo: ${conveniosActivos[0].nombre}`);
            }
        }

        // 4. Verificación final
        const pasajeroFinal = await Pasajero.findByPk(pasajero.id);
        console.log('\n--- Resultado Final ---');
        console.log(JSON.stringify({
            rut: pasajeroFinal.rut,
            empresa_id: pasajeroFinal.empresa_id,
            convenio_id: pasajeroFinal.convenio_id
        }, null, 2));

        if (pasajeroFinal.convenio_id) {
            console.log('\n🚀 LA PRUEBA FUE EXITOSA');
        } else {
            console.log('\n❌ LA PRUEBA FALLÓ: convenio_id es null');
        }

    } catch (error) {
        console.error('❌ Error durante la prueba:', error.message);
    } finally {
        await sequelize.close();
    }
}

testAssociation();
