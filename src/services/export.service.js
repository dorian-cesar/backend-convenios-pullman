const { Convenio, Beneficiario, Evento, Pasajero, Empresa } = require('../models');

/**
 * Exportación de todos los Convenios
 */
exports.exportConvenios = async () => {
    return await Convenio.findAll({
        attributes: { exclude: ['imagenes'] },
        include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['id', 'nombre', 'rut_empresa']
        }],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
    });
};

/**
 * Exportación de todos los Beneficiarios (sin imágenes)
 */
exports.exportBeneficiarios = async () => {
    return await Beneficiario.findAll({
        attributes: { exclude: ['imagenes'] },
        include: [{
            model: Convenio,
            as: 'convenio',
            attributes: ['id', 'nombre']
        }],
        order: [['id', 'ASC']],
        raw: true,
        nest: true
    });
};

/**
 * Exportación de todos los Boletos (Eventos)
 */
exports.exportBoletos = async () => {
    return await Evento.findAll({
        include: [
            {
                model: Pasajero,
                as: 'pasajero',
                attributes: ['id', 'rut', 'nombres', 'apellidos']
            },
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa']
            },
            {
                model: Convenio,
                as: 'convenio',
                attributes: ['id', 'nombre']
            }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
    });
};

/**
 * Exportación de todos los Pasajeros
 */
exports.exportPasajeros = async () => {
    return await Pasajero.findAll({
        order: [['id', 'ASC']],
        raw: true
    });
};
