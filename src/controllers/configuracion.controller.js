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
 * Obtener todas las configuraciones
 */
exports.obtenerTodas = async (req, res, next) => {
    try {
        const configuraciones = await Configuracion.findAll();
        const resultado = {};
        
        configuraciones.forEach(c => {
            resultado[c.clave] = c.valor;
        });

        // Asegurar valores por defecto si no existen
        if (!resultado['LIMITE_DESTACADOS']) resultado['LIMITE_DESTACADOS'] = '4';

        res.json(resultado);
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

/**
 * Guardar múltiples configuraciones a la vez
 */
exports.guardarMultiples = async (req, res, next) => {
    try {
        const configuraciones = req.body;
        
        if (!configuraciones || typeof configuraciones !== 'object') {
            return res.status(400).json({ message: 'Se requiere un objeto con configuraciones' });
        }

        const promesas = Object.entries(configuraciones).map(async ([clave, valor]) => {
            if (valor === undefined || valor === null) return;
            
            let config = await Configuracion.findOne({ where: { clave } });
            if (config) {
                config.valor = String(valor);
                return config.save();
            } else {
                return Configuracion.create({ clave, valor: String(valor) });
            }
        });

        await Promise.all(promesas);

        res.json({ message: 'Configuraciones guardadas correctamente' });
    } catch (error) {
        next(error);
    }
};

/**
 * Subir una imagen general de configuración
 */
exports.subirImagen = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }
        
        const path = `/uploads/${req.file.filename}`;
        
        res.json({ 
            message: 'Archivo subido exitosamente',
            path: path
        });
    } catch (error) {
        next(error);
    }
};
