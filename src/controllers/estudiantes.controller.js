const estudiantesService = require('../services/estudiantes.service');
const pasajerosService = require('../services/pasajeros.service');

exports.crear = async (req, res, next) => {
    try {
        const estudiante = await estudiantesService.crear(req.body);
        res.status(201).json(estudiante);
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const estudiante = await estudiantesService.obtenerPorRut(req.params.rut);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.json(estudiante);
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const estudiante = await estudiantesService.obtenerPorId(req.params.id);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.json(estudiante);
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const result = await estudiantesService.listar(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const estudiante = await estudiantesService.actualizar(req.params.id, req.body);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.json(estudiante);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await estudiantesService.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.activar = async (req, res, next) => {
    try {
        const estudiante = await estudiantesService.activar(req.params.id);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.json(estudiante);
    } catch (error) {
        next(error);
    }
};

exports.rechazar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { razon_rechazo } = req.body;

        if (!razon_rechazo) {
            return res.status(400).json({ message: 'La razón de rechazo es obligatoria.' });
        }

        const estudiante = await estudiantesService.actualizar(id, {
            status: 'RECHAZADO',
            razon_rechazo
        });

        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        res.json({ message: 'Estudiante rechazado y notificado exitosamente.', estudiante });
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

        const estudiante = await estudiantesService.obtenerPorRut(rut);

        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        if (estudiante.status !== 'ACTIVO') {
            return res.status(409).json({ message: 'El Estudiante se encuentra INACTIVO' });
        }

        const nombreCompleto = estudiante.nombre || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const result = await pasajerosService.validarYRegistrarPasajero({
            rut: estudiante.rut,
            nombres,
            apellidos,
            correo: estudiante.correo,
            telefono: estudiante.telefono,
            tipo_pasajero_id: 3, // ESTUDIANTE
            empresa_nombre_defecto: 'PULLMAN BUS',
            convenio_nombre_defecto: 'ESTUDIANTE'
        });

        res.json(result);

    } catch (error) {
        next(error);
    }
};
