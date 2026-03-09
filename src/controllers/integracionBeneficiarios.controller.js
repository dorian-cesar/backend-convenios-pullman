const { Beneficio, Convenio, Empresa } = require('../models');
const { formatRut } = require('../utils/rut.utils');
const pasajerosService = require('../services/pasajeros.service');

const integracionBeneficiariosController = {
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
