const fachService = require('../services/fach.service');
const FachDTO = require('../dtos/fach.dto');
const { formatRut } = require('../utils/rut.utils');
exports.crear = async (req, res, next) => {
    try {
        const registro = await fachService.crear(req.body);
        res.status(201).json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};

exports.listarTodos = async (req, res, next) => {
    try {
        const result = await fachService.obtenerTodos(req.query);
        // Transformar los arrays mediante el DTO para limpiarlos
        const dtodata = result.data.map(item => new FachDTO(item));

        res.json({
            totalItems: result.totalItems,
            data: dtodata,
            totalPages: result.totalPages,
            currentPage: result.currentPage
        });
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const registro = await fachService.obtenerPorRut(req.params.rut);
        res.json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const registro = await fachService.actualizar(req.params.rut, req.body);
        res.json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const resultado = await fachService.eliminar(req.params.rut);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

exports.cambiarEstado = async (req, res, next) => {
    try {
        const registro = await fachService.cambiarEstado(req.params.rut);
        res.json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};

exports.validar = async (req, res, next) => {
    try {
        const { rut } = req.body;
        if (!rut) {
            return res.status(400).json({ message: 'El RUT es requerido' });
        }

        const formattedRut = formatRut(rut);
        const fachService = require('../services/fach.service');
        let fachReg;
        try {
            fachReg = await fachService.obtenerPorRut(formattedRut);
        } catch (e) {
            // Service throws Error if not found
            return res.status(404).json({ message: 'RUT no encontrado en registros FACH' });
        }

        if (!fachReg.status || fachReg.status.toUpperCase() !== 'ACTIVO') {
            return res.status(403).json({ message: 'El funcionario FACH no se encuentra activo' });
        }

        const pasajerosService = require('../services/pasajeros.service');
        const nombreCompleto = fachReg.nombre_completo || '';
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Funcionario';
        const apellidos = nombreParts.slice(1).join(' ') || 'FACH';

        const result = await pasajerosService.validarYRegistrarPasajero({
            rut: formattedRut,
            nombres,
            apellidos,
            tipo_pasajero_id: 1,
            empresa_nombre_defecto: 'FACH',
            convenio_nombre_defecto: 'FACH'
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en validar FACH:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
