const { Beneficio, Estudiante, AdultoMayor, PasajeroFrecuente, Convenio, Empresa } = require('../models');
const { formatRut } = require('../utils/rut.utils');
const pasajerosService = require('../services/pasajeros.service');

const integracionBeneficiariosController = {
    /**
     * Helper genérico para validar contra Beneficio (nueva tabla) o tabla antigua (fallback)
     */
    async _validarBase(req, res, next, tipoBeneficioStr, ModeloAntiguo, errorMsg) {
        try {
            const { rut, convenioId } = req.body;
            if (!rut || !convenioId) {
                return res.status(400).json({ message: 'El RUT y el convenioId son requeridos' });
            }

            const formattedRUT = formatRut(rut);

            const convenio = await Convenio.findByPk(convenioId, {
                include: [{ model: Empresa, as: 'empresa' }]
            });

            if (!convenio) {
                return res.status(404).json({ message: 'Convenio no encontrado' });
            }

            // Prioridad: Buscar en la nueva tabla unificada Beneficios (vinculado 100% al convenio)
            let dataBeneficio = await Beneficio.findOne({ 
                where: { rut: formattedRUT, convenio_id: convenioId } 
            });

            // Fallback: Buscar en la tabla antigua (Estudiante, AdultoMayor, etc.)
            if (!dataBeneficio) {
                dataBeneficio = await ModeloAntiguo.findOne({ where: { rut: formattedRUT } });
            }

            if (!dataBeneficio) {
                return res.status(404).json({ message: errorMsg });
            }

            if (dataBeneficio.status !== 'ACTIVO') {
                return res.status(403).json({ message: `El beneficio asociado al convenio no se encuentra activo para este usuario` });
            }

            const nombresPartes = (dataBeneficio.nombre || dataBeneficio.nombre_completo || '').split(' ');
            const nombres = nombresPartes[0] || 'Sin Nombre';
            const apellidos = nombresPartes.slice(1).join(' ') || 'Sin Apellido';

            const registroResult = await pasajerosService.validarYRegistrarPasajero({
                rut: formattedRUT,
                nombres,
                apellidos,
                correo: dataBeneficio.correo,
                telefono: dataBeneficio.telefono,
                convenio_id: convenio.id,
                empresa_id: convenio.empresa_id
            });

            return res.status(200).json({
                afiliado: true,
                mensaje: 'Validación exitosa',
                pasajero: registroResult.pasajero,
                empresa: convenio.empresa ? convenio.empresa.nombre : 'N/A',
                convenio: convenio
            });
        } catch (error) {
            next(error);
        }
    },

    async validarEstudiante(req, res, next) {
        return integracionBeneficiariosController._validarBase(req, res, next, 'ESTUDIANTE', Estudiante, 'Estudiante no encontrado');
    },

    async validarAdultoMayor(req, res, next) {
        return integracionBeneficiariosController._validarBase(req, res, next, 'ADULTO_MAYOR', AdultoMayor, 'Adulto Mayor no encontrado');
    },

    async validarPasajeroFrecuente(req, res, next) {
        return integracionBeneficiariosController._validarBase(req, res, next, 'PASAJERO_FRECUENTE', PasajeroFrecuente, 'Pasajero Frecuente no encontrado');
    },

    /**
     * Valida contra la tabla unificada de Beneficios usando la data directamente.
     * En el futuro, si Empresa tiene ApiConsulta definida para validación externa,
     * podemos proxy-arla aquí usando `convenioId` -> `Empresa`.
     */
    async validar(req, res, next) {
        try {
            const { rut, convenioId } = req.body;
            if (!rut || !convenioId) {
                return res.status(400).json({ message: 'El RUT y el convenioId son requeridos' });
            }

            const formattedRUT = formatRut(rut);

            const convenio = await Convenio.findByPk(convenioId, {
                include: [{ model: Empresa, as: 'empresa' }]
            });

            if (!convenio) {
                return res.status(404).json({ message: 'Convenio no encontrado' });
            }

            const beneficio = await Beneficio.findOne({ 
                where: { rut: formattedRUT, convenio_id: convenioId } 
            });

            if (!beneficio) {
                return res.status(404).json({ message: `El RUT ingresado no se encuentra registrado para este beneficio o convenio.` });
            }

            if (beneficio.status !== 'ACTIVO') {
                return res.status(403).json({ message: `El beneficio se encuentra ${beneficio.status}` });
            }

            const nombreParts = (beneficio.nombre || '').split(' ');
            const nombres = nombreParts[0] || 'Sin Nombre';
            const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

            const registroResult = await pasajerosService.validarYRegistrarPasajero({
                rut: beneficio.rut,
                nombres,
                apellidos,
                correo: beneficio.correo,
                telefono: beneficio.telefono,
                convenio_id: convenio.id,
                empresa_id: convenio.empresa_id
            });

            return res.status(200).json({
                afiliado: true,
                mensaje: `Validación exitosa`,
                pasajero: registroResult.pasajero,
                empresa: convenio.empresa ? convenio.empresa.nombre : 'N/A',
                convenio: convenio
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = integracionBeneficiariosController;
