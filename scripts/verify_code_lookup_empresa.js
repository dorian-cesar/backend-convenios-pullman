const { sequelize, CodigoDescuento, Convenio, Empresa } = require('../src/models');
const codigoDescuentoService = require('../src/services/codigoDescuento.service');
const CodigoDescuentoDTO = require('../src/dtos/codigoDescuento.dto');

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection OK');

        console.log('Convenio Associations (Script Context):', Object.keys(Convenio.associations));

        // Find existing data or create for test
        let empresaRaw = await Empresa.findOne();
        if (!empresaRaw) {
            empresaRaw = await Empresa.create({ nombre: 'Test Ent', rut_empresa: '11111111-1', status: 'ACTIVO' });
        }

        let convenioRaw = await Convenio.findOne({ where: { empresa_id: empresaRaw.id } });
        if (!convenioRaw) {
            convenioRaw = await Convenio.create({ empresa_id: empresaRaw.id, nombre: 'Test Conv', status: 'ACTIVO' });
        }

        const testCode = 'TEST-ENT-' + Date.now();
        const codigo = await CodigoDescuento.create({
            convenio_id: convenioRaw.id,
            codigo: testCode,
            fecha_inicio: new Date(),
            fecha_termino: new Date(new Date().getTime() + 10000000),
            status: 'ACTIVO'
        });

        console.log(`Created Code: ${testCode}`);

        // Call Service
        try {
            const foundCode = await codigoDescuentoService.buscarPorCodigo(testCode);

            // Convert to DTO
            const dto = new CodigoDescuentoDTO(foundCode);

            console.log('DTO Result:', JSON.stringify(dto, null, 2));

            if (dto.convenio && dto.convenio.empresa && dto.convenio.empresa.nombre) {
                console.log('SUCCESS: Empresa found in DTO');
            } else {
                console.log('FAILURE: Empresa MISSING in DTO');
            }
        } catch (svcError) {
            console.error('Service Error:', svcError);
        }

        // Cleanup
        await codigo.destroy();

    } catch (error) {
        console.error('Script Error:', error);
    } finally {
        await sequelize.close();
    }
}

verify();
