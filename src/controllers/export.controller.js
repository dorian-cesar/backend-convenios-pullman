const exportService = require('../services/export.service');
const logger = require('../utils/logger');

/**
 * Exportar todos los Convenios
 */
exports.exportConvenios = async (req, res, next) => {
    try {
        const data = await exportService.exportConvenios();
        res.json(data);
    } catch (error) {
        logger.error('Error exportando convenios:', error);
        next(error);
    }
};

/**
 * Exportar todos los Beneficiarios
 */
exports.exportBeneficiarios = async (req, res, next) => {
    try {
        const data = await exportService.exportBeneficiarios();
        res.json(data);
    } catch (error) {
        logger.error('Error exportando beneficiarios:', error);
        next(error);
    }
};

/**
 * Exportar todos los Boletos (Eventos)
 */
exports.exportBoletos = async (req, res, next) => {
    try {
        const data = await exportService.exportBoletos();
        res.json(data);
    } catch (error) {
        logger.error('Error exportando boletos:', error);
        next(error);
    }
};

/**
 * Exportar todos los Pasajeros
 */
exports.exportPasajeros = async (req, res, next) => {
    try {
        const data = await exportService.exportPasajeros();
        res.json(data);
    } catch (error) {
        logger.error('Error exportando pasajeros:', error);
        next(error);
    }
};
