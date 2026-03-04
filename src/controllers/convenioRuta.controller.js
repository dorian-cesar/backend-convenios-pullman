const convenioRutaService = require('../services/convenioRuta.service');
const { Convenio } = require('../models');

const convenioRutaController = {
    /**
     * Obtener todas las rutas de un convenio
     */
    async listarRutas(req, res, next) {
        try {
            const { id } = req.params;
            const convenio = await Convenio.findByPk(id);

            if (!convenio) {
                return res.status(404).json({ error: 'Convenio no encontrado' });
            }

            const rutas = await convenioRutaService.obtenerRutasPorConvenio(id);
            return res.status(200).json(rutas);
        } catch (error) {
            next(error);
        }
    },

    /**
     * Agrega un arreglo masivo de rutas a un convenio
     */
    async agregarRutas(req, res, next) {
        try {
            const { id } = req.params;
            const { rutas } = req.body;

            const convenio = await Convenio.findByPk(id);

            if (!convenio) {
                return res.status(404).json({ error: 'Convenio no encontrado' });
            }

            if (convenio.tipo_alcance !== 'Rutas Especificas') {
                return res.status(400).json({ error: 'Este convenio es Global, debe cambiar su tipo_alcance primero.' });
            }

            // Validar congruencia estricta entre tipo de descuento del padre y los "precios" enviados en las configuraciones
            for (const ruta of rutas) {
                for (const config of ruta.configuraciones) {
                    if (convenio.tipo_descuento === 'Porcentaje') {
                        if (config.precio_solo_ida > 100 || (config.precio_ida_vuelta && config.precio_ida_vuelta > 100)) {
                            return res.status(400).json({
                                error: 'Incongruencia: El convenio es de tipo Porcentaje. Las configuraciones de ruta no pueden tener valores mayores a 100.'
                            });
                        }
                    } else if (convenio.tipo_descuento === 'Tarifa Plana' || convenio.tipo_descuento === 'Monto Fijo') {
                        // Verificamos de forma general que no estén enviando tarifas con lógica de %
                        if (config.precio_solo_ida > 0 && config.precio_solo_ida <= 100) {
                            return res.status(400).json({
                                error: `Incongruencia: El convenio es de tipo ${convenio.tipo_descuento}. Las configuraciones enviadas (ej: ${config.precio_solo_ida}) parecen ser valores porcentuales. Debe enviar el monto real.`
                            });
                        }
                    }
                }
            }

            await convenioRutaService.agregarRutasAConvenio(id, rutas);

            // Return updated state
            const rutasActualizadas = await convenioRutaService.obtenerRutasPorConvenio(id);
            return res.status(201).json(rutasActualizadas);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'Ya existe una ruta configurada para este origen y destino en el convenio' });
            }
            next(error);
        }
    },

    /**
     * Eliminar ruta específica de un convenio
     */
    async eliminarRuta(req, res, next) {
        try {
            const { id, ruta_id } = req.params;

            await convenioRutaService.eliminarRutaDeConvenio(id, ruta_id);

            return res.status(204).send();
        } catch (error) {
            if (error.message.includes('no pertenece al convenio')) {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }
};

module.exports = convenioRutaController;
