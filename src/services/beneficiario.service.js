const { Beneficiario, Empresa, Convenio } = require('../models');
const { formatRut } = require('../utils/rut.utils');
const emailService = require('./email.service');

exports.crear = async (data) => {
    if (data.rut) {
        data.rut = formatRut(data.rut);
    }
    
    // Forzar estado inicial INACTIVO para enrolamiento
    data.status = 'INACTIVO';
    
    const beneficiario = await Beneficiario.create(data);
    
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
    const { limit = 10, page = 1, convenio_id, status, rut, empresa_id } = query;
    const offset = (page - 1) * limit;
    const where = {};
    const includeConvenioWhere = {};

    if (convenio_id) where.convenio_id = convenio_id;
    if (status) where.status = status;
    if (rut) where.rut = formatRut(rut);
    if (empresa_id) includeConvenioWhere.empresa_id = empresa_id;

    const { count, rows } = await Beneficiario.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        subQuery: false,
        distinct: true,
        include: [
            { 
                model: Convenio, 
                as: 'convenio',
                where: Object.keys(includeConvenioWhere).length > 0 ? includeConvenioWhere : undefined
            }
        ]
    });

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
