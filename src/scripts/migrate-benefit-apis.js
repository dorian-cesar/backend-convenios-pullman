const { Convenio, ApiConsulta, Empresa, sequelize } = require('../models');

/**
 * Migration script:
 * 1. Find all Unique Empresas that have at least one Convenio where beneficio = true.
 * 2. For each Empresa, ensure there is an ApiConsulta with the generic benefit validation endpoint.
 * 3. Update those Convenios to point to this api_consulta_id.
 */
async function migrate() {
    const t = await sequelize.transaction();
    try {
        console.log('--- Starting Benefit API Migration ---');

        // 1. Find the generic endpoint (or create it if it doesn't exist for 'Validación Genérica')
        // Actually, it's better to create one PER Empresa if we want to follow the existing pattern
        // where APIs can be company-specific, OR a global one if empresa_id is null.
        
        const genericEndpoint = '/api/integraciones/beneficiarios/validar';

        // 2. Find todos los convenios de beneficio
        const convenios = await Convenio.findAll({
            where: { beneficio: true },
            include: [{ model: Empresa, as: 'empresa' }]
        });

        console.log(`Found ${convenios.length} benefit convenios.`);

        for (const convenio of convenios) {
            console.log(`Processing Convenio: ${convenio.nombre} (ID: ${convenio.id})`);

            // Ensure ApiConsulta exists for this company and endpoint
            const [api] = await ApiConsulta.findOrCreate({
                where: { 
                    endpoint: genericEndpoint,
                    empresa_id: convenio.empresa_id 
                },
                defaults: {
                    nombre: `Validación de Beneficiarios - ${convenio.empresa.nombre}`,
                    status: 'ACTIVO'
                },
                transaction: t
            });

            // Update convenio to point to this API
            await convenio.update({
                api_consulta_id: api.id,
                tipo: 'API_EXTERNA' // Ensure it's marked as external so it uses the endpoint logic
            }, { transaction: t });

            console.log(`Updated Convenio ${convenio.id} to use ApiConsulta ${api.id}`);
        }

        await t.commit();
        console.log('--- Migration Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        await t.rollback();
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
