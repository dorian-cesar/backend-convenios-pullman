const { Empresa, Convenio, Descuento, CodigoDescuento } = require('../models');

async function seed() {
    console.log('--- Seeding Demo Discounts ---');

    // 1. Ensure Empresa Demo
    let empresa = await Empresa.findOne({ where: { rut_empresa: '77777777-7' } });
    if (!empresa) {
        empresa = await Empresa.create({
            nombre: 'Empresa Demo Retails',
            rut_empresa: '77777777-7',
            status: 'ACTIVO'
        });
        console.log('Created Empresa:', empresa.nombre);
    } else {
        console.log('Using existing Empresa:', empresa.nombre);
    }

    // 2. Ensure Convenio Demo
    let convenio = await Convenio.findOne({ where: { nombre: 'Convenio Funcionarios Demo', empresa_id: empresa.id } });
    if (!convenio) {
        convenio = await Convenio.create({
            empresa_id: empresa.id,
            nombre: 'Convenio Funcionarios Demo',
            fecha_inicio: new Date(),
            fecha_termino: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'ACTIVO'
        });
        console.log('Created Convenio:', convenio.nombre);
    } else {
        console.log('Using existing Convenio:', convenio.nombre);
    }

    // 3. Create Direct Discount (10%)
    // Check if exists to avoid duplicates on re-run
    const existingDirect = await Descuento.findOne({ where: { convenio_id: convenio.id, codigo_descuento_id: null, porcentaje_descuento: 10 } });
    if (!existingDirect) {
        await Descuento.create({
            convenio_id: convenio.id,
            porcentaje_descuento: 10,
            status: 'ACTIVO'
        });
        console.log('Created Direct Discount: 10%');
    } else {
        console.log('Using existing Direct Discount: 10%');
    }

    // 4. Create Discount Code (DEMO2026)
    let codigo = await CodigoDescuento.findOne({ where: { codigo: 'DEMO2026' } });
    if (!codigo) {
        codigo = await CodigoDescuento.create({
            convenio_id: convenio.id,
            codigo: 'DEMO2026',
            fecha_inicio: new Date(),
            fecha_termino: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            max_usos: 100,
            status: 'ACTIVO'
        });
        console.log('Created Discount Code: DEMO2026');
    } else {
        console.log('Using existing Code:', codigo.codigo);
    }

    // 5. Create Discount for Code (20%)
    const existingCodeDiscount = await Descuento.findOne({ where: { codigo_descuento_id: codigo.id } });
    if (!existingCodeDiscount) {
        await Descuento.create({
            convenio_id: convenio.id,
            codigo_descuento_id: codigo.id,
            porcentaje_descuento: 20,
            status: 'ACTIVO'
        });
        console.log('Created Discount for Code: 20%');
    } else {
        console.log('Using existing Code Discount: 20%');
    }

    console.log('--- Seed Completed ---');
}

module.exports = seed;
