const { Beneficiario, Carabinero, Fach, Convenio, Empresa } = require('../models');

/**
 * Genera un archivo CSV con todos los beneficiarios de todas las tablas.
 * Formato: Empresa, Convenio, RUT
 */
exports.exportarTodosLosBeneficiarios = async () => {
    // 1. Obtener beneficiarios (Adulto Mayor, Estudiante, Pasajero Frecuente)
    const beneficiariosBase = await Beneficiario.findAll({
        include: [{
            model: Convenio,
            as: 'convenio',
            include: [{ model: Empresa, as: 'empresa' }]
        }],
        attributes: ['rut']
    });

    // 2. Obtener Carabineros
    const carabineros = await Carabinero.findAll({
        include: [
            { model: Empresa, as: 'empresa' },
            { model: Convenio, as: 'convenio' }
        ],
        attributes: ['rut']
    });

    // 3. Obtener Fach
    const fach = await Fach.findAll({
        include: [
            { model: Empresa, as: 'empresa' },
            { model: Convenio, as: 'convenio' }
        ],
        attributes: ['rut']
    });

    // 4. Consolidar datos
    const listaConsolidada = [];

    // Mapear beneficiarios base
    beneficiariosBase.forEach(b => {
        listaConsolidada.push({
            empresa: b.convenio?.empresa?.nombre || 'N/A',
            convenio: b.convenio?.nombre || 'N/A',
            rut: b.rut
        });
    });

    // Mapear carabineros
    carabineros.forEach(c => {
        listaConsolidada.push({
            empresa: c.empresa?.nombre || 'CARABINEROS DE CHILE',
            convenio: c.convenio?.nombre || 'CONVENIO CARABINEROS',
            rut: c.rut
        });
    });

    // Mapear fach
    fach.forEach(f => {
        listaConsolidada.push({
            empresa: f.empresa?.nombre || 'FUERZA AEREA DE CHILE',
            convenio: f.convenio?.nombre || 'CONVENIO FACH',
            rut: f.rut
        });
    });

    // 5. Construir CSV
    const encabezados = 'Empresa;Convenio;RUT';
    const filas = listaConsolidada.map(item => 
        `"${item.empresa}";"${item.convenio}";"${item.rut}"`
    );

    // Unir todo con saltos de línea (Usamos \ufeff para que Excel detecte UTF-8)
    const csvContent = '\ufeff' + [encabezados, ...filas].join('\n');

    return csvContent;
};
