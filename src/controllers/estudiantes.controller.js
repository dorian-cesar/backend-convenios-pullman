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

        // --- Lógica de Pasajero y Convenio ---
        const { Pasajero, Convenio, Empresa } = require('../models'); // Lazy load models if needed or import at top

        // 1. Buscar Empresa y Convenio (Asumimos nombres por defecto para Estudiantes)
        // Puedes ajustar estos nombres según lo que tengas en BDD.
        // Si no existen debería dar error 500 o crearlos? Por seguridad, error.
        const empresa = await Empresa.findOne({ where: { nombre: 'PULLMAN BUS' } }); // O "ESTUDIANTES CHILE" si existe
        // NOTA: Usaré 'PULLMAN BUS' como default si no hay una empresa específica de estudiantes,
        // pero idealmente deberías tener una empresa asociada o usar la genérica.

        // Mejor buscamos el convenio 'ESTUDIANTE' o 'TNE'
        const convenio = await Convenio.findOne({ where: { nombre: 'ESTUDIANTE' } });

        if (!convenio) {
            // Fallback o Error
            if (!empresa) return res.status(500).json({ message: 'Configuración de Empresa/Convenio no encontrada' });
        }

        // Si no tenemos empresa especifica, usamos la del convenio si tiene, o la default.
        const empresaFinal = empresa; // Simplificación

        // 2. Crear/Actualizar Pasajero
        const nombreCompleto = estudiante.nombre || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const [pasajero, created] = await Pasajero.findOrCreate({
            where: { rut: estudiante.rut },
            defaults: {
                nombres,
                apellidos,
                correo: estudiante.correo,
                telefono: estudiante.telefono,
                fecha_nacimiento: null, // No lo tenemos
                empresa_id: empresaFinal ? empresaFinal.id : null,
                convenio_id: convenio ? convenio.id : null,
                tipo_pasajero_id: 3, // ID 3 = ESTUDIANTE (Asumption)
                status: 'ACTIVO'
            }
        });

        if (!created && convenio && empresaFinal) {
            await pasajero.update({
                convenio_id: convenio.id,
                empresa_id: empresaFinal.id,
                tipo_pasajero_id: 3
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
