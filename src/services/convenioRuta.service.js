const { ConvenioRuta, ConvenioRutaConfig, sequelize } = require('../models');

const convenioRutaService = {
    /**
     * Agrega un array de rutas con sus respectivas configuraciones a un convenio.
     * Utiliza transacciones para asegurar la integridad atómica.
     * @param {number} convenioId 
     * @param {Array} rutasData
     */
    async agregarRutasAConvenio(convenioId, rutasData) {
        const transaction = await sequelize.transaction();
        try {
            const rutasCreadas = [];

            for (const ruta of rutasData) {
                // Enforce uniqueness constraints programmatically 
                // Or let the DB handle it and catch but to gracefully process in batch, we can check via findOrCreate
                const [convenioRuta, created] = await ConvenioRuta.findOrCreate({
                    where: {
                        convenio_id: convenioId,
                        origen_codigo: ruta.origen_codigo,
                        destino_codigo: ruta.destino_codigo
                    },
                    defaults: {
                        convenio_id: convenioId,
                        origen_codigo: ruta.origen_codigo,
                        origen_ciudad: ruta.origen_ciudad,
                        destino_codigo: ruta.destino_codigo,
                        destino_ciudad: ruta.destino_ciudad
                    },
                    transaction
                });

                // If exists (not created), we could optionally skip or replace configs. Here we assume we want to append/overwrite configs.
                // First delete old configs for this route to prevent duplicates if appending.
                if (!created) {
                    await ConvenioRutaConfig.destroy({
                        where: { convenio_ruta_id: convenioRuta.id },
                        force: true, // Permanent deletion of old configurations
                        transaction
                    });
                }

                const configsToCreate = ruta.configuraciones.map(c => ({
                    ...c,
                    convenio_ruta_id: convenioRuta.id
                }));

                await ConvenioRutaConfig.bulkCreate(configsToCreate, { transaction });
                rutasCreadas.push(convenioRuta);
            }

            await transaction.commit();
            return rutasCreadas;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    /**
     * Obtiene todas las rutas y configuraciones de un convenio
     */
    async obtenerRutasPorConvenio(convenioId) {
        const rutas = await ConvenioRuta.findAll({
            where: { convenio_id: convenioId },
            include: [
                {
                    model: ConvenioRutaConfig,
                    as: 'configuraciones',
                    required: false
                }
            ]
        });
        return rutas;
    },

    /**
     * Elimina lógicamente una ruta (y sus configuraciones en cascada dependiendo de configuración sequelize)
     */
    async eliminarRutaDeConvenio(convenioId, rutaId) {
        const ruta = await ConvenioRuta.findOne({
            where: {
                id: rutaId,
                convenio_id: convenioId
            }
        });

        if (!ruta) {
            throw new Error(`Ruta ID ${rutaId} no pertenece al convenio ${convenioId} o no existe`);
        }

        await ruta.destroy();
        return true;
    }
};

module.exports = convenioRutaService;
