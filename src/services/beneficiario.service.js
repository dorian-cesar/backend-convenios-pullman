const { Beneficiario, Empresa, Convenio, sequelize } = require('../models');
const { formatRut, validateRut } = require('../utils/rut.utils');
const emailService = require('./email.service');
const AppError = require('../exceptions/AppError');


exports.crear = async (data) => {
    console.log('[Beneficiario Service] Crear - Iniciando proceso para RUT:', data.rut);
    if (data.rut) {
        if (!validateRut(data.rut)) {
            throw new AppError(`El RUT ingresado (${data.rut}) es inválido matemáticamente (Dígito Verificador incorrecto).`, 400);
        }
        data.rut = formatRut(data.rut);
    }
    
    if (data.correo === '') {
        data.correo = null;
    }

    // Convertir imagenes vacías a null para evitar problemas con JSON
    if (data.imagenes === '') {
        data.imagenes = null;
    }

    // Automatización: Obtener empresa_id desde el convenio si no viene en el payload
    if (!data.empresa_id && data.convenio_id) {
        console.log('[Beneficiario Service] Buscando empresa para convenio:', data.convenio_id);
        const convenio = await Convenio.findByPk(data.convenio_id);
        if (convenio) {
            data.empresa_id = convenio.empresa_id;
        }
    }

    // Verificar si ya existe un registro para este convenio
    const existente = await Beneficiario.findOne({
        where: { rut: data.rut, convenio_id: data.convenio_id }
    });

    if (existente) {
        console.warn('[Beneficiario Service] Beneficiario ya existe:', data.rut);
        throw new AppError('Usted ya se encuentra registrado en este convenio', 400);
    }


    // Forzar estado inicial INACTIVO para enrolamiento
    data.status = 'INACTIVO';

    let beneficiario;
    try {
        console.log('[Beneficiario Service] Creando registro en BD...');
        beneficiario = await Beneficiario.create(data);
        console.log('[Beneficiario Service] Registro creado ID:', beneficiario.id);
    } catch (error) {
        console.error('[Beneficiario Service] Error al crear en BD:', error.message);
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError('Usted ya se encuentra registrado en este convenio', 400);
        }
        throw error;
    }

    // Obtener info del convenio para el correo
    try {
        const convenio = await Convenio.findByPk(beneficiario.convenio_id);
        if (beneficiario.correo) {
            console.log('[Beneficiario Service] Enviando correo de enrolamiento a:', beneficiario.correo);
            await emailService.enviarCorreoEnrolamiento(
                beneficiario.correo,
                beneficiario.nombre,
                convenio ? convenio.nombre : 'Programa de Beneficios'
            );
        }
    } catch (mailError) {
        console.error('[Beneficiario Service] Error (no fatal) enviando correo:', mailError.message);
    }

    return beneficiario;
};

exports.obtenerPorRut = async (rut, convenio_id = null) => {
    const formattedRUT = formatRut(rut);
    const cleanRUT = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    let where = { rut: formattedRUT };
    if (convenio_id) {
        where.convenio_id = convenio_id;
    }

    let beneficiario = await Beneficiario.findOne({
        where,
        include: [{ model: Convenio, as: 'convenio' }]
    });

    // Si no se encuentra con el formato XXXXXXXX-X, intentar con el formato limpio XXXXXXXXX
    if (!beneficiario && formattedRUT !== cleanRUT) {
        console.log(`[Beneficiario Service] No encontrado como ${formattedRUT}, reintentando como ${cleanRUT}`);
        where.rut = cleanRUT;
        beneficiario = await Beneficiario.findOne({
            where,
            include: [{ model: Convenio, as: 'convenio' }]
        });
    }

    return beneficiario;
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

    const { limit = 10, page = 1, convenio_id, status, rut, empresa_id, id, correo, categoria_id } = query;
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

    const { Op } = require('sequelize');

    if (id) where.id = parseArrayParam(id);
    if (correo) {
        where.correo = { [Op.like]: `%${correo}%` };
    }
    if (convenio_id) where.convenio_id = parseArrayParam(convenio_id);
    if (status) where.status = parseArrayParam(status);

    if (rut) {
        const cleanRutSearch = rut.replace(/[^0-9kK]/g, '');
        where.rut = sequelize.where(
            sequelize.fn('REPLACE', sequelize.fn('REPLACE', sequelize.col('Beneficiario.rut'), '.', ''), '-', ''),
            { [Op.eq]: cleanRutSearch }
        );
    }


    if (empresa_id) includeConvenioWhere.empresa_id = parseArrayParam(empresa_id);
    if (categoria_id) includeConvenioWhere.categoria_id = parseArrayParam(categoria_id);

    const includeConvenio = {
        model: Convenio,
        as: 'convenio',
        attributes: ['id', 'nombre', 'categoria_id', 'empresa_id'],
        where: Object.keys(includeConvenioWhere).length > 0 ? includeConvenioWhere : undefined,
        include: [
            {
                model: require('../models').Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']
            },
            {
                model: require('../models').Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre']
            }
        ]
    };

    // 1. Contar el total de registros (sin order ni limit para no saturar memoria)
    const count = await Beneficiario.count({
        where,
        include: [includeConvenio]
    });

    // 1.1 Calcular conteos por estado (excluyendo el filtro de status del where para el resumen)
    const summaryWhere = { ...where };
    delete summaryWhere.status;

    const statusCounts = await Beneficiario.findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('Beneficiario.id')), 'count']
        ],
        where: summaryWhere,
        include: [{
            model: Convenio,
            as: 'convenio',
            attributes: [],
            where: Object.keys(includeConvenioWhere).length > 0 ? includeConvenioWhere : undefined
        }],
        group: ['status'],
        raw: true
    });

    const summary = {
        activo: 0,
        inactivo: 0,
        rechazado: 0,
        total: 0 // El total para el resumen será la suma de todos los estados para los filtros aplicados
    };

    statusCounts.forEach(sc => {
        const val = parseInt(sc.count);
        if (sc.status === 'ACTIVO') summary.activo = val;
        if (sc.status === 'INACTIVO') summary.inactivo = val;
        if (sc.status === 'RECHAZADO') summary.rechazado = val;
        summary.total += val;
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
        summary,
        data: rows
    };
};

exports.actualizar = async (id, data) => {
    if (data.rut) {
        if (!validateRut(data.rut)) {
            throw new AppError(`El RUT ingresado (${data.rut}) es inválido matemáticamente (Dígito Verificador incorrecto).`, 400);
        }
        data.rut = formatRut(data.rut);
    }
    const beneficiario = await Beneficiario.findByPk(id, {
        include: [{ model: Convenio, as: 'convenio' }]
    });
    if (!beneficiario) return null;

    if (data.correo === '') {
        data.correo = null;
    }

    if (data.imagenes === '') {
        data.imagenes = null;
    }

    const oldStatus = beneficiario.status;
    
    // Si se envían imágenes, marcar el campo como cambiado para que Sequelize lo detecte
    if (data.imagenes) {
        beneficiario.set('imagenes', data.imagenes);
        beneficiario.changed('imagenes', true);
    }

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

exports.actualizarParcial = async (id, data) => {
    if (data.rut) {
        if (!validateRut(data.rut)) {
            throw new AppError(`El RUT ingresado (${data.rut}) es inválido matemáticamente (Dígito Verificador incorrecto).`, 400);
        }
        data.rut = formatRut(data.rut);
    }
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) return null;

    // Si se envían imágenes, las mezclamos con las existentes
    if (data.imagenes) {
        const imagenesExistentes = beneficiario.imagenes || {};
        const nuevasImagenes = { ...imagenesExistentes, ...data.imagenes };
        beneficiario.set('imagenes', nuevasImagenes);
        beneficiario.changed('imagenes', true);
        data.imagenes = nuevasImagenes; // Asegurar que update use el objeto mezclado
    }
    const updated = await beneficiario.update(data);
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

