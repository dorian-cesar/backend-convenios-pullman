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
        // 1. Buscar Empresa y Convenio
        // Usamos nombres por defecto o genéricos
        const empresa = await Empresa.findOne({ where: { nombre: 'PULLMAN BUS' } });
        const convenio = await Convenio.findOne({ where: { nombre: 'ESTUDIANTE' } });

        // Si no existen, continuamos con valores por defecto (null)
        const empresaFinal = empresa;

        // 2. Crear/Actualizar Pasajero (Siempre intentamos registrarlo o buscarlo)
        let pasajero = null;
        const nombreCompleto = estudiante.nombre || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        try {
            const [p, created] = await Pasajero.findOrCreate({
                where: { rut: estudiante.rut },
                defaults: {
                    nombres,
                    apellidos,
                    correo: estudiante.correo,
                    telefono: estudiante.telefono,
                    fecha_nacimiento: null,
                    empresa_id: empresaFinal ? empresaFinal.id : null,
                    convenio_id: convenio ? convenio.id : null,
                    tipo_pasajero_id: 3, // ESTUDIANTE
                    status: 'ACTIVO'
                }
            });
            pasajero = p;

            // Si ya existía y encontramos info nueva de convenio/empresa, actualizamos
            if (!created && (convenio || empresaFinal)) {
                const updateData = {};
                if (convenio) updateData.convenio_id = convenio.id;
                if (empresaFinal) updateData.empresa_id = empresaFinal.id;
                // updateData.tipo_pasajero_id = 3; // Opcional: forzar tipo si se desea
                await pasajero.update(updateData);
            }
        } catch (error) {
            console.error('Error al procesar Pasajero en Estudiantes:', error);
            // Si falla la BDD, podemos fallar o devolver un objeto dummy
            // Preferimos devolver un objeto construido con los datos que tenemos
            pasajero = {
                rut: estudiante.rut,
                nombres,
                apellidos,
                correo: estudiante.correo,
                telefono: estudiante.telefono,
                tipo_pasajero_id: 3
            };
        }

        let pasajeroResponse = {};
        if (pasajero) {
            pasajeroResponse = pasajero.toJSON();
            delete pasajeroResponse.imagen_base64;
        }

        // Retornar formato estandarizado
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
