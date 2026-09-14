const { Configuracion } = require('../models');

/**
 * Obtener una configuración por su clave
 */
exports.obtener = async (req, res, next) => {
    try {
        const { clave } = req.params;
        const config = await Configuracion.findOne({ where: { clave } });
        
        if (!config) {
            // Si no existe, podemos retornar un valor por defecto o 404.
            // Para LIMITE_DESTACADOS por defecto será 4
            if (clave === 'LIMITE_DESTACADOS') {
                return res.json({ clave, valor: '4' });
            }
            return res.status(404).json({ message: 'Configuración no encontrada' });
        }
        
        res.json(config);
    } catch (error) {
        next(error);
    }
};

/**
 * Crear o actualizar una configuración
 */
exports.guardar = async (req, res, next) => {
    try {
        const { clave } = req.params;
        const { valor } = req.body;

        if (valor === undefined || valor === null) {
            return res.status(400).json({ message: 'El campo valor es requerido' });
        }

        let config = await Configuracion.findOne({ where: { clave } });
        
        if (config) {
            config.valor = String(valor);
            await config.save();
        } else {
            config = await Configuracion.create({ clave, valor: String(valor) });
        }
        
        res.json(config);
    } catch (error) {
        next(error);
    }
};
