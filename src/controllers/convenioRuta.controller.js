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
