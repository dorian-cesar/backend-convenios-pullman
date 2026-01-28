const { Convenio, Empresa } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');

/**
 * Crear convenio
 */
exports.crearConvenio = async ({ nombre, empresa_id }) => {
    if (!nombre || !empresa_id) {
        throw new BusinessError('Nombre y empresa_id son obligatorios');
    }

    // Verificar que la empresa existe
    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) {
        throw new NotFoundError('Empresa no encontrada');
    }

    const convenio = await Convenio.create({
        nombre,
        empresa_id,
        status: 'ACTIVO'
    });

    return convenio;
};

/**
 * Listar convenios
 */
exports.listarConvenios = async (filters = {}) => {
    const where = {};

    if (filters.empresa_id) {
        where.empresa_id = filters.empresa_id;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    const convenios = await Convenio.findAll({
        where,
        include: [{
            model: Empresa,
            attributes: ['id', 'nombre', 'rut_empresa']
        }]
    });

    return convenios;
};

/**
 * Obtener convenio por ID
 */
exports.obtenerConvenio = async (id) => {
    const convenio = await Convenio.findByPk(id, {
        include: [{
            model: Empresa,
            attributes: ['id', 'nombre', 'rut_empresa']
        }]
    });

    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    return convenio;
};

/**
 * Actualizar convenio
 */
exports.actualizarConvenio = async (id, datos) => {
    const convenio = await Convenio.findByPk(id);

    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    const { nombre, status, empresa_id } = datos;

    if (nombre) convenio.nombre = nombre;
    if (status) convenio.status = status;

    if (empresa_id) {
        const empresa = await Empresa.findByPk(empresa_id);
        if (!empresa) {
            throw new NotFoundError('Empresa no encontrada');
        }
        convenio.empresa_id = empresa_id;
    }

    await convenio.save();

    // Recargar con relaciones
    return await Convenio.findByPk(id, {
        include: [{
            model: Empresa,
            attributes: ['id', 'nombre', 'rut_empresa']
        }]
    });
};

/**
 * Eliminar convenio (soft delete)
 */
exports.eliminarConvenio = async (id) => {
    const convenio = await Convenio.findByPk(id);

    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    convenio.status = 'INACTIVO';
    await convenio.save();

    return convenio;
};
