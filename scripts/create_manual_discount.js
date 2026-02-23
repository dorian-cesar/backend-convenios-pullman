const { sequelize, Descuento, CodigoDescuento } = require('../src/models');

async function createDiscount() {
    try {
        await sequelize.authenticate();
        console.log('Validating connection...');

        const codigoId = 2; // "VERANO2026"
        const porcentaje = 20; // Default 20%

        const codigo = await CodigoDescuento.findByPk(codigoId);
        if (!codigo) {
            console.error(`CodigoDescuento ID ${codigoId} not found!`);
            process.exit(1);
        }

        console.log(`Creating discount for Codigo: ${codigo.codigo} (Convenio ID: ${codigo.convenio_id})`);

        const descuento = await Descuento.create({
            convenio_id: codigo.convenio_id,
            codigo_descuento_id: codigo.id,
            porcentaje_descuento: porcentaje,
            status: 'ACTIVO'
        });

        console.log('✅ Discount created successfully:');
        console.log(JSON.stringify(descuento, null, 2));

    } catch (error) {
        console.error('Error creating discount:', error);
    } finally {
        await sequelize.close();
    }
}

createDiscount();
