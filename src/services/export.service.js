const { Beneficiario, Carabinero, Fach, Convenio, Empresa } = require('../models');

/**
 * Genera un archivo CSV con todos los beneficiarios activos.
 * Formato: RUT;Email;ID_Convenio;ID_Empresa
 */
exports.exportarTodosLosBeneficiarios = async () => {
    // 1. Obtener beneficiarios (Adulto Mayor, Estudiante, Pasajero Frecuente)
    const beneficiariosBase = await Beneficiario.findAll({
        include: [{
            model: Convenio,
            as: 'convenio',
            attributes: ['id', 'empresa_id']
        }],
        where: { status: 'ACTIVO' },
        attributes: ['rut', 'correo']
    });

    // 2. Obtener Carabineros
    const carabineros = await Carabinero.findAll({
        where: { status: 'ACTIVO' },
        attributes: ['rut', 'convenio_id', 'empresa_id']
    });

    // 3. Obtener Fach
    const fach = await Fach.findAll({
        where: { status: 'ACTIVO' },
        attributes: ['rut', 'convenio_id', 'empresa_id']
    });

    // 4. Consolidar datos
    const listaConsolidada = [];

    // Mapear beneficiarios base
    beneficiariosBase.forEach(b => {
        listaConsolidada.push({
            rut: b.rut,
            email: b.correo || '',
            id_convenio: b.convenio?.id || '',
            id_empresa: b.convenio?.empresa_id || ''
        });
    });

    // Mapear carabineros
    carabineros.forEach(c => {
        listaConsolidada.push({
            rut: c.rut,
            email: '', // No disponible en esta tabla
            id_convenio: c.convenio_id || '',
            id_empresa: c.empresa_id || ''
        });
    });

    // Mapear fach
    fach.forEach(f => {
        listaConsolidada.push({
            rut: f.rut,
            email: '', // No disponible en esta tabla
            id_convenio: f.convenio_id || '',
            id_empresa: f.empresa_id || ''
        });
    });

    // 5. Construir CSV
    const encabezados = 'RUT;Email;ID_Convenio;ID_Empresa';
    const filas = listaConsolidada.map(item => 
        `"${item.rut}";"${item.email}";"${item.id_convenio}";"${item.id_empresa}"`
    );

    // Unir todo con saltos de línea (Usamos \ufeff para que Excel detecte UTF-8)
    const csvContent = '\ufeff' + [encabezados, ...filas].join('\n');

    return csvContent;
};
