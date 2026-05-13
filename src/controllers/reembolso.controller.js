const reembolsoService = require('../services/reembolso.service');

/**
 * Crear reembolso
 */
exports.crear = async (req, res, next) => {
    try {
        console.log('[REEMBOLSO] Recibiendo datos para crear:', req.body);
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
        console.log('[REEMBOLSO] Datos recibidos para token:', token, req.body);
        const { correo, rut, numero_cuenta, banco, tipo_cuenta, nombre_beneficiario } = req.body;
        const reembolso = await reembolsoService.actualizarPorToken(token, {
            correo,
            rut,
            numero_cuenta,
            banco,
            tipo_cuenta,
            nombre_beneficiario,
            estado: 'Completado'
        });

        // Notificar a administradores
        try {
            const emailService = require('../services/email.service');
            await emailService.enviarNotificacionAdminReembolso(reembolso);
        } catch (emailError) {
            console.error('[REEMBOLSO] Error al notificar a admins:', emailError);
        }

        res.json(reembolso);
    } catch (error) {
        next(error);
    }
};

/**
 * Enviar email con el link
 */
exports.enviarEmailLink = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const reembolso = await reembolsoService.obtenerReembolso(id);
        
        if (!email && !reembolso.correo) {
            return res.status(400).json({ message: 'No se especificó un correo de destino' });
        }

        const correoDestino = email || reembolso.correo;
        const emailService = require('../services/email.service');
        
        const success = await emailService.enviarCorreoReembolso(correoDestino, reembolso.pnr, reembolso.token);
        
        if (success) {
            res.json({ message: 'Correo enviado exitosamente' });
        } else {
            res.status(500).json({ message: 'Error al enviar el correo' });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Sincronizar con Monday.com
 */
exports.sincronizarMonday = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mondayService = require('../services/monday.service');
        const reembolso = await reembolsoService.obtenerReembolso(id);
        
        const mondayItemId = await mondayService.crearItem(reembolso);
        
        res.json({ message: 'Sincronizado con Monday correctamente', mondayItemId });
    } catch (error) {
        next(error);
    }
};

/**
 * Reiniciar solicitud (limpiar datos y habilitar link)
 */
exports.reiniciarSolicitud = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reembolso = await reembolsoService.obtenerReembolso(id);
        
        await reembolso.update({
            rut: null,
            correo: null,
            numero_cuenta: null,
            banco: null,
            tipo_cuenta: null,
            nombre_beneficiario: null,
            estado: 'Pending',
            updated_by: req.user ? req.user.username : 'system'
        });
        
        res.json({ message: 'Solicitud reiniciada correctamente. El enlace público está habilitado de nuevo.' });
    } catch (error) {
        next(error);
    }
};
