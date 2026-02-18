const { Carabinero, Convenio, Empresa, Pasajero } = require('../models');
const pasajerosService = require('../services/pasajeros.service');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const { Op } = require('sequelize');
const { formatRut } = require('../utils/rut.utils');

exports.validar = async (req, res) => {
    try {
        const { rut } = req.body;

        if (!rut) {
            return res.status(400).json({ message: 'El RUT es requerido' });
        }

        const formattedRut = formatRut(rut);

        // Extraer cuerpo para búsqueda amplia (si el input tiene guion, usalo como separador, si no, usa logic de formatRut)
        let rutBody = null;
        if (rut.includes('-')) {
            const clean = rut.replace(/\./g, '').replace(/[^0-9kK\-]/g, '');
            rutBody = clean.split('-')[0];
        } else {
            // Si no tiene guion, asumimos que formatRut hizo lo correcto separando el último dígito
            rutBody = formattedRut.split('-')[0];
        }

        // 1. Consultar tabla carabineros (Búsqueda flexible)
        // Buscamos exacto por formateado, o que empiece por el cuerpo (ignorando DV)
        const carabinero = await Carabinero.findOne({
            where: {
                [Op.or]: [
                    { rut: formattedRut }, // Match exacto estándar
                    { rut: { [Op.like]: `${rutBody}-%` } }, // Match por cuerpo + cualquier DV
                    { rut: rutBody } // Match por cuerpo exacto (si en BD está sin formato)
                ]
            }
        });

        if (!carabinero) {
            return res.status(404).json({ message: 'RUT no encontrado en registros de Carabineros' });
        }

        // Verificar estado
        if (!carabinero.status || carabinero.status.toUpperCase() !== 'ACTIVO') {
            return res.status(403).json({ message: 'El funcionario no se encuentra activo' });
        }

        // 3. Crear o Actualizar Pasajero usando servicio compartido
        const nombreCompleto = carabinero.nombre_completo || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const result = await pasajerosService.validarYRegistrarPasajero({
            rut: formattedRut,
            nombres,
            apellidos,
            tipo_pasajero_id: 1, // Default ID (ajustar si es necesario)
            empresa_nombre_defecto: 'CARABINEROS DE CHILE',
            convenio_nombre_defecto: 'CARABINEROS'
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error en validar carabinero:', error);
        // Si el error es de negocio, devolver 400 o 409 según corresponda, o dejar que el middleware de error lo maneje si existiera.
        // Por compatibilidad con estructura actual:
        if (error.name === 'BusinessError') {
            return res.status(400).json({ message: error.message });
        }
        if (error.name === 'NotFoundError') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// CRUD Operations

exports.getAll = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { offset, limit: limitVal } = getPagination(page, limit);

        const data = await Carabinero.findAndCountAll({
            limit: limitVal,
            offset: offset,
            order: [['rut', 'ASC']]
        });

        const response = getPagingData(data, page, limitVal);
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error al obtener carabineros:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.getOne = async (req, res) => {
    try {
        const { rut } = req.params;
        // Normalizamos la búsqueda: intentamos buscar exacto, o si viene con guión, buscar sin guión, y viceversa si fuera necesario.
        // Pero getOne por PK suele ser exacto. 
        // Si el usuario pasa 12345678-9 y en la BD está 12345678, findByPk no lo hallará si la PK es string exacto.
        // Haremos una búsqueda más flexible similar a validar.

        const cleanRut = rut.replace(/\./g, '').toUpperCase();
        const parts = cleanRut.split('-');
        let rutBody = cleanRut;
        if (parts.length === 2) {
            rutBody = parts[0];
        }

        const carabinero = await Carabinero.findOne({
            where: {
                rut: {
                    [Op.or]: [rutBody, cleanRut]
                }
            }
        });

        if (!carabinero) {
            return res.status(404).json({ message: 'Carabinero no encontrado' });
        }

        return res.status(200).json(carabinero);
    } catch (error) {
        console.error('Error al obtener carabinero:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.create = async (req, res) => {
    try {
        const { rut, nombre_completo, status } = req.body;

        if (!rut) {
            return res.status(400).json({ message: 'El RUT es requerido' });
        }

        const formattedRut = formatRut(rut);

        const existingCarabinero = await Carabinero.findByPk(formattedRut);

        if (existingCarabinero) {
            return res.status(409).json({ message: 'El Carabinero ya existe' });
        }

        const newCarabinero = await Carabinero.create({
            rut: formattedRut,
            nombre_completo,
            status: status || 'ACTIVO'
        });

        return res.status(201).json(newCarabinero);
    } catch (error) {
        console.error('Error al crear carabinero:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.update = async (req, res) => {
    try {
        const { rut } = req.params;
        const { nombre_completo, status } = req.body;

        // Búsqueda flexible para update
        const cleanRut = rut.replace(/\./g, '').toUpperCase();
        const parts = cleanRut.split('-');
        let rutBody = cleanRut;
        if (parts.length === 2) {
            rutBody = parts[0];
        }

        const carabinero = await Carabinero.findOne({
            where: {
                rut: {
                    [Op.or]: [rutBody, cleanRut]
                }
            }
        });

        if (!carabinero) {
            return res.status(404).json({ message: 'Carabinero no encontrado' });
        }

        await carabinero.update({
            nombre_completo: nombre_completo !== undefined ? nombre_completo : carabinero.nombre_completo,
            status: status !== undefined ? status : carabinero.status
        });

        return res.status(200).json(carabinero);
    } catch (error) {
        console.error('Error al actualizar carabinero:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { rut } = req.params;

        // Búsqueda flexible para delete
        const cleanRut = rut.replace(/\./g, '').toUpperCase();
        const parts = cleanRut.split('-');
        let rutBody = cleanRut;
        if (parts.length === 2) {
            rutBody = parts[0];
        }

        const carabinero = await Carabinero.findOne({
            where: {
                rut: {
                    [Op.or]: [rutBody, cleanRut]
                }
            }
        });

        if (!carabinero) {
            return res.status(404).json({ message: 'Carabinero no encontrado' });
        }

        await carabinero.destroy();
        return res.status(200).json({ message: 'Carabinero eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar carabinero:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
