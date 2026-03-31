const exportService = require('../services/export.service');

/**
 * Descarga masiva de todos los beneficiarios en formato CSV.
 */
exports.descargarTodosLosBeneficiarios = async (req, res, next) => {
    try {
        const csvContent = await exportService.exportarTodosLosBeneficiarios();

        const fileName = `todos_los_beneficiarios_${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        return res.status(200).send(csvContent);

    } catch (error) {
        console.error('Error al generar exportación de beneficiarios:', error);
        next(error);
    }
};

/**
 * Descarga masiva de todos los convenios activos en formato CSV.
 */
exports.descargarConveniosActivos = async (req, res, next) => {
    try {
        const csvContent = await exportService.exportarConveniosActivos();

        const fileName = `convenios_activos_${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        return res.status(200).send(csvContent);

    } catch (error) {
        console.error('Error al generar exportación de convenios:', error);
        next(error);
    }
};
