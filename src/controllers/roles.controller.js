const { Rol } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');

/**
 * Obtener todos los roles
 */
exports.getAll = async (req, res, next) => {
    try {
        const { page, limit, nombre } = req.query;
        const { offset, limit: limitVal } = getPagination(page, limit);
        const where = {};

        if (nombre) {
            where.nombre = nombre;
        }

        const data = await Rol.findAndCountAll({
            where,
            limit: limitVal,
            offset,
            order: [['id', 'ASC']]
        });

        const response = getPagingData(data, page, limitVal);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un rol por ID
 */
exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rol = await Rol.findByPk(id);

        if (!rol) {
            throw new NotFoundError('Rol no encontrado');
        }

        res.json(rol);
    } catch (error) {
        next(error);
    }
};

/**
 * Crear un rol
 */
exports.create = async (req, res, next) => {
    try {
        const { nombre, status } = req.body;

        if (!nombre) {
            throw new BusinessError('El nombre del rol es obligatorio');
        }

        const nuevoRol = await Rol.create({
            nombre: nombre.toUpperCase(), // Estandarizar a mayúsculas
            status: status || 'ACTIVO'
        });

        res.status(201).json(nuevoRol);
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar un rol
 */
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, status } = req.body;

        const rol = await Rol.findByPk(id);
        if (!rol) {
            throw new NotFoundError('Rol no encontrado');
        }

        if (nombre) rol.nombre = nombre.toUpperCase();
        if (status) rol.status = status;

        await rol.save();
        res.json(rol);
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un rol (Soft delete o físico según config global, aquí rol.model tiene paranoid: false por ahora, verificar)
 * La definición del modelo Rol tiene timestamps: true pero NO paranoid: true.
 * El usuario pidió soft delete para "tablas importantes". Si Rol es importante, debería tenerlo.
 * Por ahora haremos borrado físico o cambio de estado. Haremos cambio de estado a INACTIVO.
 */
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rol = await Rol.findByPk(id);

        if (!rol) {
            throw new NotFoundError('Rol no encontrado');
        }

        // Soft delete manual (cambio de estado) si no es paranoid, 
        // o destroy si queremos eliminarlo. Como es una tabla catálogo, mejor marcar INACTIVO.
        rol.status = 'INACTIVO';
        await rol.save();

        res.json({ message: 'Rol desactivado correctamente', rol });
    } catch (error) {
        next(error);
    }
};
