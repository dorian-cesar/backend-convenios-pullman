const { Carabinero, Pasajero, Convenio, Empresa } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

exports.validar = async (req, res) => {
    try {
        const { rut } = req.body;

        if (!rut) {
            return res.status(400).json({ message: 'El RUT es requerido' });
        }

        // Limpiar el RUT (quitar puntos) y asegurar mayúsculas
        const cleanRut = rut.replace(/\./g, '').toUpperCase();

        // Separar cuerpo y dígito verificador
        // Asumimos formato XXXXXXXX-Y
        const parts = cleanRut.split('-');
        if (parts.length !== 2) {
            return res.status(400).json({ message: 'Formato de RUT inválido. Debe ser 12345678-9' });
        }

        const rutBody = parts[0];
        // const dv = parts[1]; // No usado explícitamente pero extraído

        // 1. Consultar tabla carabineros
        // Buscamos exact match (con guión) O match solo por cuerpo (sin guión)
        // Esto permite que la BD tenga '12345678' o '12345678-9' y funcione igual.
        const carabinero = await Carabinero.findOne({
            where: {
                rut: {
                    [Op.or]: [rutBody, cleanRut]
                }
            }
        });

        if (!carabinero) {
            return res.status(404).json({ message: 'RUT no encontrado en registros de Carabineros' });
        }

        // Verificar estado (asumiendo que hay una columna status)
        if (!carabinero.status || carabinero.status.toUpperCase() !== 'ACTIVO') {
            return res.status(403).json({ message: 'El funcionario no se encuentra activo' });
        }

        // 2. Buscar IDs de Convenio y Empresa dinámicamente
        const convenio = await Convenio.findOne({ where: { nombre: 'CARABINEROS' } });
        const empresa = await Empresa.findOne({ where: { nombre: 'CARABINEROS DE CHILE' } });

        if (!convenio || !empresa) {
            console.error('Error de configuración: No se encontró Convenio CARABINEROS o Empresa CARABINEROS DE CHILE');
            return res.status(500).json({ message: 'Error de configuración en el sistema. Contacte al administrador.' });
        }

        // 3. Crear o Actualizar Pasajero con el RUT completo
        const nombreCompleto = carabinero.nombre_completo || '';
        // Intento básico de separar nombre y apellido
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const [pasajero, created] = await Pasajero.findOrCreate({
            where: { rut: cleanRut },
            defaults: {
                nombres: nombres,
                apellidos: apellidos,
                empresa_id: empresa.id,
                convenio_id: convenio.id,
                tipo_pasajero_id: 1, // Asumiendo ID 1 para ADULTO o similar, ajustar si es necesario
                status: 'ACTIVO'
            }
        });

        if (!created) {
            // Si ya existe, actualizamos la asociación
            await pasajero.update({
                empresa_id: empresa.id,
                convenio_id: convenio.id,
                status: 'ACTIVO'
                // Opcional: actualizar nombres si se desea sobrescribir lo que había
            });
        }

        return res.status(200).json({
            afiliado: true,
            mensaje: 'Validación exitosa',
            pasajero: pasajero,
            empresa: empresa.nombre,
            descuentos: [
                {
                    convenio: convenio.nombre,
                    porcentaje: convenio.porcentaje_descuento || 0
                }
            ]
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

        // Permitimos guardar el RUT tal cual viene (solo limpiando puntos y mayúsculas),
        // ya sea formato 12345678 o 12345678-K.
        const cleanRut = rut.replace(/\./g, '').toUpperCase();

        // Chequear si ya existe (en cualquiera de las dos formas para evitar duplicados lógicos)
        const parts = cleanRut.split('-');
        let rutBody = cleanRut;
        if (parts.length === 2) {
            rutBody = parts[0];
        }

        const existingCarabinero = await Carabinero.findOne({
            where: {
                rut: {
                    [Op.or]: [rutBody, cleanRut]
                }
            }
        });

        if (existingCarabinero) {
            return res.status(409).json({ message: 'El Carabinero ya existe (RUT o RUT base ya registrado)' });
        }

        const newCarabinero = await Carabinero.create({
            rut: cleanRut, // Guardamos lo que envió el usuario (limpio)
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
