const convenioService = require('../services/convenio.service');
const ConvenioDTO = require('../dtos/convenio.dto');

/**
 * Crear convenio
 */
exports.crear = async (req, res, next) => {
    try {
        // Mapear tipo_consulta (JSON user) a tipo (Modelo interno)
        // Mapear api_url_id a api_consulta_id
        const { tipo_consulta, api_url_id, ...rest } = req.body;
        const data = {
            ...rest,
            tipo: tipo_consulta || rest.tipo,
            api_consulta_id: api_url_id || rest.api_consulta_id
        };
        const convenio = await convenioService.crearConvenio(data);
        res.status(201).json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Listar convenios
 */
exports.listar = async (req, res, next) => {
    try {
        const result = await convenioService.listarConvenios(req.query);
        const response = {
            ...result,
            rows: ConvenioDTO.fromArray(result.rows)
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Listar convenios ACTIVOS
 */
exports.listarActivos = async (req, res, next) => {
    try {
        const result = await convenioService.listarActivos(req.query);
        res.json(ConvenioDTO.fromArray(result.rows));
    } catch (error) {
        next(error);
    }
};

/**
 * Listar convenios COMPLETAMENTE DISPONIBLES (status + fecha + stock + plata)
 */
exports.listarDisponibles = async (req, res, next) => {
    try {
        const convenios = await convenioService.listarDisponibles();
        res.json(ConvenioDTO.fromArray(convenios));
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener convenio por ID
 */
exports.obtener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const convenio = await convenioService.obtenerConvenio(id);
        res.json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar convenio
 */
exports.actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tipo_consulta, api_url_id, ...rest } = req.body;
        const data = {
            ...rest,
            tipo: tipo_consulta || rest.tipo,
            api_consulta_id: api_url_id || rest.api_consulta_id
        };
        const convenio = await convenioService.actualizarConvenio(id, data);
        res.json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar convenio (soft delete)
 */
exports.eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;
        await convenioService.eliminarConvenio(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Validar convenio por CÓDIGO (Endpoint interno para autocompletar)
 */
exports.validarPorCodigo = async (req, res, next) => {
    try {
        const { codigo } = req.params;
        const convenio = await convenioService.validarPorCodigo(codigo);
        res.json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar consumo de un convenio manualmente
 */
exports.actualizarConsumo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { consumo_tickets, consumo_monto_descuento } = req.body;

        const convenio = await convenioService.actualizarConsumo(id, {
            consumo_tickets,
            consumo_monto_descuento
        });

        res.json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Validar si un código específico pertenece a un convenio por su ID
 */
exports.validarCodigoPorConvenio = async (req, res, next) => {
    try {
        const { codigo } = req.params;
        const { id, convenio_id } = req.body;
        const targetId = convenio_id || id;

        if (!targetId) {
            return res.json({
                valido: false,
                mensaje: "Se requiere un 'convenio_id' en el cuerpo de la petición (body)."
            });
        }

        const convenio = await convenioService.validarCodigoPorConvenio(targetId, codigo);
        res.json({
            valido: true,
            mensaje: `El código está activo y pertenece al convenio ${convenio.nombre}`,
            convenio: new ConvenioDTO(convenio)
        });
    } catch (error) {
        if (error.name === 'BusinessError' || error.name === 'NotFoundError') {
            res.json({
                valido: false,
                mensaje: error.message
            });
        } else {
            next(error);
        }
    }
};

/**
 * Verificar disponibilidad completa por ID de convenio
 */
exports.verificarDisponibilidad = async (req, res, next) => {
    try {
        const { id } = req.params;
        const disponibilidad = await convenioService.verificarDisponibilidadPorId(id);
        res.json(disponibilidad);
    } catch (error) {
        if (error.name === 'BusinessError' || error.name === 'NotFoundError') {
            res.json({
                valido: false,
                mensaje: error.message
            });
        } else {
            next(error);
        }
    }
};
