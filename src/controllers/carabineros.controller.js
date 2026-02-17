const { Carabinero, Convenio, Empresa, Pasajero } = require('../models');
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

        // 1. Consultar tabla carabineros
        const carabinero = await Carabinero.findOne({
            where: { rut: formattedRut }
        });

        if (!carabinero) {
            return res.status(404).json({ message: 'RUT no encontrado en registros de Carabineros' });
        }

        // Verificar estado
        if (!carabinero.status || carabinero.status.toUpperCase() !== 'ACTIVO') {
            return res.status(403).json({ message: 'El funcionario no se encuentra activo' });
        }

        // 2. Buscar IDs de Convenio y Empresa dinámicamente
        const convenio = await Convenio.findOne({ where: { nombre: 'CARABINEROS' } });
        const empresa = await Empresa.findOne({ where: { nombre: 'CARABINEROS DE CHILE' } });

        // Si no existen, continuamos con valores por defecto (null) o logueamos warning
        if (!convenio || !empresa) {
            console.warn('Advertencia: No se encontró Convenio CARABINEROS o Empresa CARABINEROS DE CHILE');
        }

        // 3. Crear o Actualizar Pasajero con el RUT completo
        const nombreCompleto = carabinero.nombre_completo || '';
        // Intento básico de separar nombre y apellido
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        let pasajero = null;
        try {
            // Asumiendo ID 1 para ADULTO o similar, ajustar si es necesario
            const [p, created] = await Pasajero.findOrCreate({
                where: { rut: formattedRut },
                defaults: {
                    nombres: nombres,
                    apellidos: apellidos,
                    empresa_id: empresa ? empresa.id : null,
                    convenio_id: convenio ? convenio.id : null,
                    tipo_pasajero_id: 1,
                    status: 'ACTIVO'
                }
            });
            pasajero = p;

            if (!created) {
                // Si ya existe, actualizamos la asociación si tenemos datos nuevos
                const updateData = {};
                if (empresa) updateData.empresa_id = empresa.id;
                if (convenio) updateData.convenio_id = convenio.id;
                updateData.status = 'ACTIVO';

                await pasajero.update(updateData);
            }
        } catch (dbError) {
            console.error('Error al procesar Pasajero en Carabineros:', dbError);
            // Fallback object construction
            pasajero = {
                rut: formattedRut,
                nombres,
                apellidos,
                tipo_pasajero_id: 1,
                status: 'ACTIVO'
            };
        }

        let pasajeroResponse = {};
        if (pasajero) {
            pasajeroResponse = pasajero.toJSON ? pasajero.toJSON() : pasajero;
            delete pasajeroResponse.imagen_base64;
        }

        return res.status(200).json({
            afiliado: true,
            mensaje: 'Validación exitosa',
            pasajero: pasajeroResponse,
            empresa: empresa ? empresa.nombre : 'SIN EMPRESA',
            descuentos: convenio ? [
                {
                    convenio: convenio.nombre,
                    porcentaje: convenio.porcentaje_descuento || 0
                }
            ] : []
        });

    } catch (error) {
        console.error('Error en validar carabinero:', error);
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
