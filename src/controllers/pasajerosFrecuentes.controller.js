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

exports.rechazar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { razon_rechazo, status } = req.body;

        if (!razon_rechazo) {
            return res.status(400).json({ message: 'La razón de rechazo es obligatoria.' });
        }

        const frecuente = await pasajerosFrecuentesService.actualizar(id, {
            status: status || 'RECHAZADO',
            razon_rechazo
        });

        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }

        const { emailEnviado } = frecuente;

        let msg = 'Pasajero Frecuente rechazado exitosamente.';
        if (emailEnviado) {
            msg += ' Se envió un correo informando el motivo del rechazo.';
        } else {
            msg += ' (Aviso: No se pudo enviar el correo de notificación, revisar logs o API Key).';
        }

        res.json({ message: msg });
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

        if (!empresa && !convenio) {
            const frecuenteJSON = frecuente.toJSON();
            delete frecuenteJSON.imagen_cedula_identidad;
            return res.json(frecuenteJSON);
        }

        const empresaFinal = empresa;
        let pasajero = null;

        if (convenio) {
            const convenioService = require('../services/convenio.service');
            await convenioService.verificarLimites(convenio.id, 0);
        }

        if (convenio) {
            const convenioService = require('../services/convenio.service');
            await convenioService.verificarLimites(convenio.id, 0);
        }

        // if (empresaFinal || convenio) { // This block is removed as per the instruction's implied change
        const nombreCompleto = frecuente.nombre || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        try {
            const [p, created] = await Pasajero.findOrCreate({
                where: { rut: frecuente.rut },
                defaults: {
                    nombres,
                    apellidos,
                    correo: frecuente.correo,
                    telefono: frecuente.telefono,
                    fecha_nacimiento: null,
                    empresa_id: empresaFinal ? empresaFinal.id : null,
                    convenio_id: convenio ? convenio.id : null,
                    tipo_pasajero_id: 2, // FRECUENTE
                    status: 'ACTIVO'
                }
            });
            pasajero = p;

            if (!created && (convenio || empresaFinal)) {
                const updateData = {};
                if (convenio) updateData.convenio_id = convenio.id;
                if (empresaFinal) updateData.empresa_id = empresaFinal.id;
                // updateData.tipo_pasajero_id = 2; // This line is removed as per the instruction's implied change
                await pasajero.update(updateData);
            }
        } catch (e) {
            pasajero = {
                rut: frecuente.rut,
                nombres,
                apellidos,
                correo: frecuente.correo,
                telefono: frecuente.telefono,
                tipo_pasajero_id: 2
            };
        }
        // } // Closing brace for the removed if block

        let pasajeroResponse = {};
        if (pasajero) {
            pasajeroResponse = pasajero.toJSON();
            delete pasajeroResponse.imagen_cedula_identidad;
        }

        res.json({
            afiliado: true,
            mensaje: 'Validación exitosa',
            pasajero: pasajeroResponse,
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
