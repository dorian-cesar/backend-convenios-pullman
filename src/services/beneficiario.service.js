const { Beneficiario, Empresa, Convenio } = require('../models');
const { formatRut } = require('../utils/rut.utils');
const emailService = require('./email.service');
const AppError = require('../exceptions/AppError');


exports.crear = async (data) => {
    if (data.rut) {
        data.rut = formatRut(data.rut);
    }
    
    // Convertir correo vacío a null para evitar problemas
    if (data.correo === '') {
        data.correo = null;
    }

    // Verificar si ya existe un registro para este convenio
    const existente = await Beneficiario.findOne({
        where: { rut: data.rut, convenio_id: data.convenio_id }
    });

    if (existente) {
        throw new AppError('Usted ya se encuentra registrado en este convenio', 400);
    }


    // Forzar estado inicial INACTIVO para enrolamiento
    data.status = 'INACTIVO';

    let beneficiario;
    try {
        beneficiario = await Beneficiario.create(data);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError('Usted ya se encuentra registrado en este convenio', 400);
        }
        throw error;
    }

    // Obtener info del convenio para el correo
    const convenio = await Convenio.findByPk(beneficiario.convenio_id);
    if (beneficiario.correo) {
        await emailService.enviarCorreoEnrolamiento(
            beneficiario.correo,
            beneficiario.nombre,
            convenio ? convenio.nombre : 'Programa de Beneficios'
        );
    }

    return beneficiario;
};

exports.obtenerPorRut = async (rut, convenio_id = null) => {
    const formattedRUT = formatRut(rut);
    const where = { rut: formattedRUT };
    if (convenio_id) {
        where.convenio_id = convenio_id;
    }
    return await Beneficiario.findOne({
        where,
        include: [
            { model: Convenio, as: 'convenio' }
        ]
    });
};

exports.obtenerPorId = async (id) => {
    return await Beneficiario.findByPk(id, {
        include: [
            { model: Convenio, as: 'convenio' }
        ]
    });
};

exports.listar = async (query = {}) => {
    // También volvemos a incluir id y correo que se habían perdido en el archivo local

    const { limit = 10, page = 1, convenio_id, status, rut, empresa_id, id, correo } = query;
    const offset = (page - 1) * limit;
    const where = {};
    const includeConvenioWhere = {};

    // Helper para permitir tanto strings separados por coma como arrays directamente (?empresa_id=1&empresa_id=2 o ?empresa_id=1,2)
    const parseArrayParam = (param) => {
        if (!param) return param;
        if (Array.isArray(param)) return param;
        if (typeof param === 'string' && param.includes(',')) return param.split(',');
        return param;
    };

    if (id) where.id = parseArrayParam(id);
    if (correo) where.correo = parseArrayParam(correo);
    if (convenio_id) where.convenio_id = parseArrayParam(convenio_id);
    if (status) where.status = parseArrayParam(status);

    if (rut) where.rut = formatRut(rut);
    if (empresa_id) includeConvenioWhere.empresa_id = parseArrayParam(empresa_id);

    const includeConvenio = {
        model: Convenio,
        as: 'convenio',
        attributes: ['id', 'nombre'],
        where: Object.keys(includeConvenioWhere).length > 0 ? includeConvenioWhere : undefined
    };

    // 1. Contar el total de registros (sin order ni limit para no saturar memoria)
    const count = await Beneficiario.count({
        where,
        include: [includeConvenio]
    });

    // 2. Obtener solo los IDs ordenados
    const rowsIds = await Beneficiario.findAll({
        attributes: ['id'],
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [{
            model: Convenio,
            as: 'convenio',
            attributes: [], // No cargar columnas, solo para el INNER JOIN
            where: Object.keys(includeConvenioWhere).length > 0 ? includeConvenioWhere : undefined
        }],
        raw: true
    });

    const ids = rowsIds.map(row => row.id);

    // 3. Traer los registros completos filtrados por los IDs encontrados (sin forzar sort en BD)
    let rows = [];
    if (ids.length > 0) {
        rows = await Beneficiario.findAll({
            where: { id: ids },
            include: [includeConvenio],
            attributes: { exclude: ['imagenes'] }
        });


        // 4. Ordenar en memoria (Node.js) para evadir las limitaciones del sort_buffer de MySQL
        rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }

    return {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        data: rows
    };
};

exports.actualizar = async (id, data) => {
    const beneficiario = await Beneficiario.findByPk(id, {
        include: [{ model: Convenio, as: 'convenio' }]
    });
    if (!beneficiario) return null;

    if (data.correo === '') {
        data.correo = null;
    }

    const oldStatus = beneficiario.status;
    const updated = await beneficiario.update(data);

    // Disparar correos según cambio de estado
    if (updated.correo) {
        const nombreConvenio = updated.convenio ? updated.convenio.nombre : 'Programa de Beneficios';

        // Caso Aceptación: Pasa de cualquier estado a ACTIVO
        if (oldStatus !== 'ACTIVO' && updated.status === 'ACTIVO') {
            await emailService.enviarCorreoAceptacion(updated.correo, updated.nombre, nombreConvenio);
        }
        // Caso Rechazo: El nuevo estado es RECHAZADO y se provee una razón (obligatoria para el correo)
        else if (updated.status === 'RECHAZADO' && updated.razon_rechazo && updated.razon_rechazo !== beneficiario.razon_rechazo) {
            await emailService.enviarCorreoRechazo(updated.correo, updated.nombre, updated.razon_rechazo, nombreConvenio);
        }
    }

    return updated;
};

exports.eliminar = async (id) => {
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) return null;
    await beneficiario.destroy();
    return true;
};

exports.activar = async (id) => {
    const beneficiario = await Beneficiario.findByPk(id, {
        include: [{ model: Convenio, as: 'convenio' }]
    });
    if (!beneficiario) return null;

    const updated = await beneficiario.update({ status: 'ACTIVO' });

    if (updated.correo) {
        const nombreConvenio = beneficiario.convenio ? beneficiario.convenio.nombre : 'Programa de Beneficios';
        await emailService.enviarCorreoAceptacion(updated.correo, updated.nombre, nombreConvenio);
    }

    return updated;
};
exports.rechazar = async (id, razon_rechazo) => {
    const beneficiario = await Beneficiario.findByPk(id, {
        include: [{ model: Convenio, as: 'convenio' }]
    });
    if (!beneficiario) return null;

    const updated = await beneficiario.update({
        status: 'RECHAZADO',
        razon_rechazo: razon_rechazo
    });

    if (updated.correo) {
        const nombreConvenio = beneficiario.convenio ? beneficiario.convenio.nombre : 'Programa de Beneficios';
        await emailService.enviarCorreoRechazo(updated.correo, updated.nombre, razon_rechazo, nombreConvenio);
    }

    return updated;
};
