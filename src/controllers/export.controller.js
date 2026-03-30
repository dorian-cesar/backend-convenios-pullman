const exportService = require('../services/export.service');

/**
 * Descarga masiva de todos los beneficiarios en formato CSV.
 */
exports.descargarTodosLosBeneficiarios = async (req, res, next) => {
    try {
        const csvContent = await exportService.exportarTodosLosBeneficiarios();

        // Configuración de cabeceras para la descarga del archivo
        const fileName = `todos_los_beneficiarios_${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Enviar el contenido del CSV directamente
        return res.status(200).send(csvContent);

    } catch (error) {
        console.error('Error al generar exportación de beneficiarios:', error);
        next(error);
    }
};
