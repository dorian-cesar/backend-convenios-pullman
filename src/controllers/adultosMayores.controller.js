const adultosMayoresService = require('../services/adultosMayores.service');

exports.crear = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.crear(req.body);
        res.status(201).json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.obtenerPorRut(req.params.rut);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.obtenerPorId(req.params.id);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const result = await adultosMayoresService.listar(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.actualizar(req.params.id, req.body);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await adultosMayoresService.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.activar = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.activar(req.params.id);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.validarRut = async (req, res, next) => {
    try {
        const { rut } = req.body;
        if (!rut) {
            return res.status(400).json({ message: 'El RUT es obligatorio' });
        }

        const adulto = await adultosMayoresService.obtenerPorRut(rut);

        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }

        if (adulto.status !== 'ACTIVO') {
            return res.status(409).json({ message: 'El Adulto Mayor se encuentra INACTIVO' });
        }

        // --- Lógica de Pasajero y Convenio ---
        const { Pasajero, Convenio, Empresa } = require('../models');

        const empresa = await Empresa.findOne({ where: { nombre: 'PULLMAN BUS' } });
        const convenio = await Convenio.findOne({ where: { nombre: 'ADULTO MAYOR' } });

        const empresaFinal = empresa;

        // 2. Crear/Actualizar Pasajero
        const nombreCompleto = adulto.nombre || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const [pasajero, created] = await Pasajero.findOrCreate({
            where: { rut: adulto.rut },
            defaults: {
                nombres,
                apellidos,
                correo: adulto.correo,
                telefono: adulto.telefono,
                fecha_nacimiento: null,
                empresa_id: empresaFinal ? empresaFinal.id : null,
                convenio_id: convenio ? convenio.id : null,
                tipo_pasajero_id: 4, // ID 4 = ADULTO MAYOR (Asumption)
                status: 'ACTIVO'
            }
        });

        if (!created && convenio && empresaFinal) {
            await pasajero.update({
                convenio_id: convenio.id,
                empresa_id: empresaFinal.id,
                tipo_pasajero_id: 4
            });
        }

        res.json({
            afiliado: true,
            mensaje: 'Validación exitosa',
            pasajero: pasajero,
            empresa: empresaFinal ? empresaFinal.nombre : 'SIN EMPRESA',
            descuentos: convenio ? [
                {
                    convenio: convenio.nombre,
                    porcentaje: convenio.porcentaje_descuento || 0
                }
            ] : []
        });

    } catch (error) {
        next(error);
    }
};
