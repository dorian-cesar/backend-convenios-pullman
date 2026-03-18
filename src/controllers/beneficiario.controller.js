const beneficiarioService = require('../services/beneficiario.service');
const pasajerosService = require('../services/pasajeros.service');
const BeneficiarioDTO = require('../dtos/beneficiario.dto');

exports.crear = async (req, res, next) => {
    try {
        const beneficiario = await beneficiarioService.crear(req.body);
        res.status(201).json(new BeneficiarioDTO(beneficiario));
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const { rut } = req.params;
        const { convenio_id } = req.query;
        const beneficiario = await beneficiarioService.obtenerPorRut(rut, convenio_id);
        if (!beneficiario) {
            return res.status(404).json({ message: 'Beneficiario no encontrado' });
        }
        res.json(new BeneficiarioDTO(beneficiario));
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const beneficiario = await beneficiarioService.obtenerPorId(req.params.id);
        if (!beneficiario) {
            return res.status(404).json({ message: 'Beneficiario no encontrado' });
        }
        res.json(new BeneficiarioDTO(beneficiario));
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const result = await beneficiarioService.listar(req.query);
        res.json({
            ...result,
            data: BeneficiarioDTO.list(result.data)
        });
    } catch (error) {
        next(error);
    }
};

exports.listarPorConvenio = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await beneficiarioService.listar({ ...req.query, convenio_id: id });
        res.json({
            ...result,
            data: BeneficiarioDTO.list(result.data)
        });
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const beneficiario = await beneficiarioService.actualizar(req.params.id, req.body);
        if (!beneficiario) {
            return res.status(404).json({ message: 'Beneficiario no encontrado' });
        }
        res.json(new BeneficiarioDTO(beneficiario));
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await beneficiarioService.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Beneficiario no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.activar = async (req, res, next) => {
    try {
        const beneficiario = await beneficiarioService.activar(req.params.id);
        if (!beneficiario) {
            return res.status(404).json({ message: 'Beneficiario no encontrado' });
        }
        res.json(new BeneficiarioDTO(beneficiario));
    } catch (error) {
        next(error);
    }
};
exports.rechazar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { razon_rechazo } = req.body;
        
        if (!razon_rechazo) {
            return res.status(400).json({ message: 'La razón de rechazo es obligatoria' });
        }

        const beneficiario = await beneficiarioService.rechazar(id, razon_rechazo);
        if (!beneficiario) {
            return res.status(404).json({ message: 'Beneficiario no encontrado' });
        }
        res.json(new BeneficiarioDTO(beneficiario));
    } catch (error) {
        next(error);
    }
};
