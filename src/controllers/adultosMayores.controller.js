const adultosMayoresService = require('../services/adultosMayores.service');
const pasajerosService = require('../services/pasajeros.service');

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

exports.rechazar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { razon_rechazo, status } = req.body;

        if (!razon_rechazo) {
            return res.status(400).json({ message: 'La razón de rechazo es obligatoria.' });
        }

        const adulto = await adultosMayoresService.actualizar(id, {
            status: status || 'RECHAZADO',
            razon_rechazo
        });

        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }

        res.json({ message: 'Adulto Mayor rechazado y notificado exitosamente.', adulto });
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

        const nombreCompleto = adulto.nombre || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const result = await pasajerosService.validarYRegistrarPasajero({
            rut: adulto.rut,
            nombres,
            apellidos,
            correo: adulto.correo,
            telefono: adulto.telefono,
            tipo_pasajero_id: 4, // ADULTO MAYOR
            empresa_nombre_defecto: 'PULLMAN BUS',
            convenio_nombre_defecto: 'ADULTO MAYOR'
        });

        res.json(result);

    } catch (error) {
        next(error);
    }
};
