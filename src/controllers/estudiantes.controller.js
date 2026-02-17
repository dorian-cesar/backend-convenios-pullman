const estudiantesService = require('../services/estudiantes.service');

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

        res.json({
            id: estudiante.id,
            nombre: estudiante.nombre,
            rut: estudiante.rut,
            telefono: estudiante.telefono,
            correo: estudiante.correo,
            direccion: estudiante.direccion,
            carnet_estudiante: estudiante.carnet_estudiante, // Extra field for student
            fecha_vencimiento: estudiante.fecha_vencimiento,
            status: estudiante.status
        });
    } catch (error) {
        next(error);
    }
};
