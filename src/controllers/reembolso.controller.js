const reembolsoService = require('../services/reembolso.service');

/**
 * Crear reembolso
 */
exports.crear = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            created_by: req.user ? req.user.username : 'system'
        };
        const reembolso = await reembolsoService.crearReembolso(data);
        res.status(201).json(reembolso);
    } catch (error) {
        next(error);
    }
};

/**
 * Listar reembolsos
 */
exports.listar = async (req, res, next) => {
    try {
        const result = await reembolsoService.listarReembolsos(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener reembolso por ID
 */
exports.obtener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reembolso = await reembolsoService.obtenerReembolso(id);
        res.json(reembolso);
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar reembolso
 */
exports.actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = {
            ...req.body,
            updated_by: req.user ? req.user.username : 'system'
        };
        const reembolso = await reembolsoService.actualizarReembolso(id, data);
        res.json(reembolso);
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar reembolso
 */
exports.eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;
        await reembolsoService.eliminarReembolso(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener por token (público)
 */
exports.obtenerPorToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const reembolso = await reembolsoService.obtenerPorToken(token);
        if (!reembolso) return res.status(404).json({ message: 'Solicitud no hallada' });
        
        // Si ya tiene RUT o cuenta, significa que ya fue completada
        if (reembolso.rut && reembolso.numero_cuenta) {
            return res.status(403).json({ 
                message: 'Esta solicitud ya ha sido completada anteriormente.',
                completed: true 
            });
        }
        
        res.json(reembolso);
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar por token (público)
 */
exports.actualizarPorToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { correo, rut, numero_cuenta, banco, tipo_cuenta } = req.body;
        const reembolso = await reembolsoService.actualizarPorToken(token, {
            correo,
            rut,
            numero_cuenta,
            banco,
            tipo_cuenta
        });
        res.json(reembolso);
    } catch (error) {
        next(error);
    }
};
