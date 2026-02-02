const { Descuento, Convenio } = require('../src/models');
const service = require('../src/services/descuento.service');

async function verify() {
    console.log('--- Listing All Discounts ---');

    // Call Service with no status filter (should return all)
    const result = await service.listarDescuentos({ limit: 100 });

    // Check for our seeded values
    const rows = result.rows;
    const inactiveDiscount = rows.find(d => d.porcentaje_descuento === 5 && d.status === 'INACTIVO');
    const expiredConvDiscount = rows.find(d => d.porcentaje_descuento === 90 && d.status === 'ACTIVO');

    console.log(`Total Discounts: ${rows.length}`);

    if (inactiveDiscount) {
        console.log('SUCCESS: Found Inactive Discount (5%)');
    } else {
        console.error('FAILURE: Inactive Discount (5%) NOT found');
    }

    if (expiredConvDiscount) {
        console.log('SUCCESS: Found Discount from Expired Convenio (90%)');
    } else {
        console.error('FAILURE: Discount from Expired Convenio NOT found');
    }
}

const { sequelize } = require('../src/models');
sequelize.authenticate().then(() => verify().finally(() => sequelize.close()));
