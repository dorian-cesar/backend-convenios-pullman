const kpiService = require('../services/kpi.service');
const BusinessError = require('../exceptions/BusinessError');

const ALLOWED_GRANULARITIES = ['diario', 'semanal', 'mensual', 'trimestral', 'semestral', 'anual', 'bienal', 'trienal', 'cuatrienal', 'quinquenal'];

const getParamsWithScope = (req) => {
    const params = { ...req.query };

    // Solo SISTEMA y SUPER_USUARIO pueden ver todas las empresas.
    // Los demás roles (como USUARIO) ven solo la suya.
    const rol = req.user?.rol?.toUpperCase();
    if (rol !== 'SUPER_USUARIO' && rol !== 'SISTEMA') {
        params.empresa_id = req.user.empresa_id;
    }

    return params;
};

exports.getResumen = async (req, res, next) => {
    try {
        const { granularidad } = req.query;

        if (granularidad && !ALLOWED_GRANULARITIES.includes(granularidad)) {
            throw new BusinessError(`Granularidad inválida. Permitidas: ${ALLOWED_GRANULARITIES.join(', ')}`);
        }

        const params = getParamsWithScope(req);
        const data = await kpiService.getResumenKpis(params);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

// Wrappers for specific KPI views (currently just aliases to resumen, but could filter columns in future)
exports.getVentas = async (req, res, next) => {
    exports.getResumen(req, res, next);
};

exports.getDevoluciones = async (req, res, next) => {
    exports.getResumen(req, res, next);
};

exports.getDescuentos = async (req, res, next) => {
    exports.getResumen(req, res, next);
};

exports.getPasajeros = async (req, res, next) => {
    exports.getResumen(req, res, next);
};

exports.getPorConvenio = async (req, res, next) => {
    try {
        const params = getParamsWithScope(req);
        const data = await kpiService.getPorConvenio(params);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.getPorCodigo = async (req, res, next) => {
    try {
        const params = getParamsWithScope(req);
        const data = await kpiService.getPorCodigo(params);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.getPorTipoPasajero = async (req, res, next) => {
    try {
        const params = getParamsWithScope(req);
        const data = await kpiService.getPorTipoPasajero(params);
        res.json(data);
    } catch (error) {
        next(error);
    }
};
