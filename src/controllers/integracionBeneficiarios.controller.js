const { Beneficiario, Convenio, Empresa } = require('../models');
const { formatRut } = require('../utils/rut.utils');
const pasajerosService = require('../services/pasajeros.service');
const ConvenioDTO = require('../dtos/convenio.dto');

const integracionBeneficiariosController = {
    /**
     * Valida contra la tabla unificada de Beneficios usando la data directamente.
     * En el futuro, si Empresa tiene ApiConsulta definida para validación externa,
     * podemos proxy-arla aquí usando `convenioId` -> `Empresa`.
     */
    async validar(req, res, next) {
        try {
            const { rut, convenio_id } = req.body;

            if (!rut || !convenio_id) {
                return res.status(400).json({ 
                    afiliado: false,
                    mensaje: 'El RUT y el convenio_id son requeridos' 
                });
            }

            const formattedRUT = formatRut(rut);

            const convenio = await Convenio.findByPk(convenio_id, {
                include: [{ model: Empresa, as: 'empresa' }]
            });

            if (!convenio) {
                return res.status(404).json({ 
                    afiliado: false,
                    mensaje: 'Convenio no encontrado' 
                });
            }

            const beneficiario = await Beneficiario.findOne({ 
                where: { rut: formattedRUT, convenio_id: convenio_id } 
            });

            if (!beneficiario) {
                return res.status(200).json({ 
                    afiliado: false,
                    mensaje: `El RUT ingresado no se encuentra registrado como beneficiario para este convenio.` 
                });
            }

            if (beneficiario.status === 'INACTIVO') {
                return res.status(200).json({ 
                    afiliado: false,
                    mensaje: `El beneficiario existe pero esta en revision` 
                });
            }

            if (beneficiario.status !== 'ACTIVO') {
                return res.status(200).json({ 
                    afiliado: false,
                    mensaje: `El beneficiario existe pero no puede viajar porque su estado actual es: ${beneficiario.status}` 
                });
            }

            const nombreParts = (beneficiario.nombre || '').split(' ');
            const nombres = nombreParts[0] || 'Sin Nombre';
            const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

            const registroResult = await pasajerosService.validarYRegistrarPasajero({
                rut: beneficiario.rut,
                nombres,
                apellidos,
                correo: beneficiario.correo,
                telefono: beneficiario.telefono,
                convenio_id: convenio.id,
                empresa_id: convenio.empresa_id
            });

            return res.status(200).json({
                afiliado: true,
                mensaje: `Validación exitosa`,
                pasajero: registroResult.pasajero,
                empresa: convenio.empresa ? convenio.empresa.nombre : 'N/A',
                convenio: new ConvenioDTO(convenio)
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = integracionBeneficiariosController;
