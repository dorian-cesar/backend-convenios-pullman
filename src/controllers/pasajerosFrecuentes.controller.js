const pasajerosFrecuentesService = require('../services/pasajerosFrecuentes.service');

exports.crear = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.crear(req.body);
        res.status(201).json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.obtenerPorRut(req.params.rut);
        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.obtenerPorId(req.params.id);
        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const result = await pasajerosFrecuentesService.listar(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.actualizar(req.params.id, req.body);
        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await pasajerosFrecuentesService.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.activar = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.activar(req.params.id);
        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.json(frecuente);
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

        const frecuente = await pasajerosFrecuentesService.obtenerPorRut(rut);

        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }

        if (frecuente.status !== 'ACTIVO') {
            return res.status(409).json({ message: 'El Pasajero Frecuente se encuentra INACTIVO' });
        }

        // --- Lógica de Pasajero y Convenio ---
        const { Pasajero, Convenio, Empresa } = require('../models');

        const empresa = await Empresa.findOne({ where: { nombre: 'PULLMAN BUS' } });
        const convenio = await Convenio.findOne({ where: { nombre: 'PASAJERO FRECUENTE' } });

        const empresaFinal = empresa;

        // 2. Crear/Actualizar Pasajero
        const nombreCompleto = frecuente.nombre || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const [pasajero, created] = await Pasajero.findOrCreate({
            where: { rut: frecuente.rut },
            defaults: {
                nombres,
                apellidos,
                correo: frecuente.correo,
                telefono: frecuente.telefono,
                fecha_nacimiento: null,
                empresa_id: empresaFinal ? empresaFinal.id : null,
                convenio_id: convenio ? convenio.id : null,
                tipo_pasajero_id: 2, // ID 2 = FRECUENTE (Assumption)
                status: 'ACTIVO'
            }
        });

        if (!created && convenio && empresaFinal) {
            await pasajero.update({
                convenio_id: convenio.id,
                empresa_id: empresaFinal.id,
                tipo_pasajero_id: 2
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
