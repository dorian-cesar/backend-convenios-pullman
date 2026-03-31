const { Beneficiario, Carabinero, Fach, Convenio, Empresa } = require('../models');

/**
 * Genera un archivo CSV con todos los beneficiarios activos.
 * Formato: RUT;Email;Convenio;Empresa
 */
exports.exportarTodosLosBeneficiarios = async () => {
    // 1. Obtener beneficiarios (Adulto Mayor, Estudiante, Pasajero Frecuente)
    const beneficiariosBase = await Beneficiario.findAll({
        include: [{
            model: Convenio,
            as: 'convenio',
            include: [{ model: Empresa, as: 'empresa' }]
        }],
        where: { status: 'ACTIVO' },
        attributes: ['rut', 'correo']
    });

    // 2. Obtener Carabineros
    const carabineros = await Carabinero.findAll({
        include: [
            { model: Empresa, as: 'empresa' },
            { model: Convenio, as: 'convenio' }
        ],
        where: { status: 'ACTIVO' },
        attributes: ['rut']
    });

    // 3. Obtener Fach
    const fach = await Fach.findAll({
        include: [
            { model: Empresa, as: 'empresa' },
            { model: Convenio, as: 'convenio' }
        ],
        where: { status: 'ACTIVO' },
        attributes: ['rut']
    });

    // 4. Consolidar datos
    const listaConsolidada = [];

    // Mapear beneficiarios base
    beneficiariosBase.forEach(b => {
        listaConsolidada.push({
            rut: b.rut,
            email: b.correo || '',
            convenio: b.convenio?.nombre || 'N/A',
            empresa: b.convenio?.empresa?.nombre || 'N/A'
        });
    });

    // Mapear carabineros
    carabineros.forEach(c => {
        listaConsolidada.push({
            rut: c.rut,
            email: '', 
            convenio: c.convenio?.nombre || 'CONVENIO CARABINEROS',
            empresa: c.empresa?.nombre || 'CARABINEROS DE CHILE'
        });
    });

    // Mapear fach
    fach.forEach(f => {
        listaConsolidada.push({
            rut: f.rut,
            email: '',
            convenio: f.convenio?.nombre || 'CONVENIO FACH',
            empresa: f.empresa?.nombre || 'FUERZA AEREA DE CHILE'
        });
    });

    // 5. Construir CSV
    const encabezados = 'RUT;Email;Convenio;Empresa';
    const filas = listaConsolidada.map(item => 
        `"${item.rut}";"${item.email}";"${item.convenio}";"${item.empresa}"`
    );

    // Unir todo con saltos de línea (Usamos \ufeff para que Excel detecte UTF-8)
    const csvContent = '\ufeff' + [encabezados, ...filas].join('\n');

    return csvContent;
};
