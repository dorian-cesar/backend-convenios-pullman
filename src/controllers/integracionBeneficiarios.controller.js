const { Beneficiario, Convenio, Empresa } = require('../models');
const { formatRut } = require('../utils/rut.utils');
const pasajerosService = require('../services/pasajeros.service');
const ConvenioDTO = require('../dtos/convenio.dto');

const integracionBeneficiariosController = {
    async validar(req, res, next) {
        try {
            const { rut, convenio_id } = req.body;
            console.log(`[Beneficiarios Validar] Inicio - RUT: ${rut}, Convenio ID: ${convenio_id}`);

            if (!rut || !convenio_id) {
                console.log(`[Beneficiarios Validar] Faltan datos (rut o convenio_id)`);
                return res.status(400).json({ 
                    afiliado: false,
                    mensaje: 'El RUT y el convenio_id son requeridos' 
                });
            }

            const formattedRUT = formatRut(rut);
            console.log(`[Beneficiarios Validar] RUT Formateado: ${formattedRUT}`);

            const convenio = await Convenio.findByPk(convenio_id, {
                include: [{ model: Empresa, as: 'empresa' }]
            });

            if (!convenio) {
                console.log(`[Beneficiarios Validar] Convenio no encontrado (${convenio_id})`);
                return res.status(404).json({ 
                    afiliado: false,
                    mensaje: 'Convenio no encontrado' 
                });
            }

            const beneficiario = await Beneficiario.findOne({ 
                where: { rut: formattedRUT, convenio_id: convenio_id } 
            });

            if (!beneficiario) {
                console.log(`[Beneficiarios Validar] Beneficiario NO encontrado para RUT ${formattedRUT} en convenio ${convenio_id}`);
                return res.status(200).json({ 
                    afiliado: false,
                    mensaje: `El RUT ingresado no se encuentra registrado como beneficiario para este convenio.` 
                });
            }

            console.log(`[Beneficiarios Validar] Beneficiario Encontrado! Estado: ${beneficiario.status}`);

            if (beneficiario.status === 'INACTIVO') {
                console.log(`[Beneficiarios Validar] Beneficiario en revisión (INACTIVO)`);
                return res.status(200).json({ 
                    afiliado: false,
                    mensaje: `El beneficiario existe pero esta en revision` 
                });
            }

            if (beneficiario.status !== 'ACTIVO') {
                console.log(`[Beneficiarios Validar] Beneficiario rechazado o no apto (${beneficiario.status})`);
                return res.status(200).json({ 
                    afiliado: false,
                    mensaje: `El beneficiario existe pero no puede viajar porque su estado actual es: ${beneficiario.status}` 
                });
            }

            console.log(`[Beneficiarios Validar] Beneficiario ACTIVO, procediendo a verificar/registrar pasajero...`);

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
