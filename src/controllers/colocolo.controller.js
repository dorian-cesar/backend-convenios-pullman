const colocoloService = require('../services/colocolo.service');
const convenioService = require('../services/convenio.service');
const { Pasajero, Empresa, Convenio, ApiConsulta } = require('../models');
const { Op } = require('sequelize');

exports.validar = async (req, res, next) => {
    try {
        const { rut } = req.body;
        if (!rut) {
            return res.status(400).json({ message: 'RUT es obligatorio' });
        }

        // Limpiar el RUT para obtener solo números y K si hubiese (sin puntos ni guiones)
        // La API de Colo Colo requiere el rut en este formato (ej: 136626906)
        const rutLimpio = rut.replace(/[\.\-]/g, '').toUpperCase();

        // 1. Consultar API Externa de Colo Colo
        const resultadoExterno = await colocoloService.consultarAfiliacion(rutLimpio);

        // Validar respuesta según formato: { status: true, data: 'Cuotas al día', nombre_socio: '...' }
        const esSocioValido = resultadoExterno && resultadoExterno.status === true;

        if (esSocioValido) {
            // --- ES SOCIO ---
            
            // 2. Buscar Pasajero (NO crear automáticamente si no existe)
            let pasajero = await Pasajero.findOne({
                where: { rut: rut }
            });

            // 3. Buscar Empresa "Colo Colo"
            let empresa = await Empresa.findOne({
                where: {
                    [Op.or]: [
                        { nombre: { [Op.like]: '%Colo Colo%' } },
                        { nombre: { [Op.like]: '%Colocolo%' } },
                        { rut_empresa: 'ColoColo' }
                    ]
                }
            });

            let descuentosDisponibles = [];

            if (empresa) {
                if (pasajero) pasajero.empresa_id = empresa.id;

                // 4. Buscar el Convenio específico vinculado al endpoint de validación
                const convenioApi = await Convenio.findOne({
                    where: {
                        empresa_id: empresa.id,
                        status: 'ACTIVO',
                        tipo: 'API_EXTERNA'
                    },
                    include: [{
                        model: ApiConsulta,
                        as: 'apiConsulta',
                        where: { endpoint: '/api/integraciones/colocolo/validar' }
                    }]
                });

                if (convenioApi) {
                    if (pasajero) pasajero.convenio_id = convenioApi.id;
                    
                    // Validar Vigencia
                    const vigente = await convenioService.validarVigencia(convenioApi.id);
                    if (!vigente) {
                        return res.status(409).json({ message: 'El convenio Colo Colo no se encuentra vigente.' });
                    }
                    // Validar Límites
                    await convenioService.verificarLimites(convenioApi.id, 0);

                } else {
                    // Fallback a cualquier convenio activo de la empresa
                    const conveniosActivos = await Convenio.findAll({
                        where: { empresa_id: empresa.id, status: 'ACTIVO' }
                    });
                    if (conveniosActivos.length > 0) {
                        const conv = conveniosActivos[0];
                        if (pasajero) pasajero.convenio_id = conv.id;

                        const vigente = await convenioService.validarVigencia(conv.id);
                        if (!vigente) {
                            return res.status(409).json({ message: 'El convenio Colo Colo no se encuentra vigente.' });
                        }
                        await convenioService.verificarLimites(conv.id, 0);
                    }
                }

                if (pasajero) {
                    await pasajero.save();
                }

                // Buscar todos los convenios activos para mostrar descuentos
                const hoy = new Date();
                const todosLosConvenios = await Convenio.findAll({
                    where: {
                        empresa_id: empresa.id,
                        status: 'ACTIVO',
                        fecha_inicio: { [Op.lte]: hoy },
                        fecha_termino: { [Op.gte]: hoy }
                    }
                });

                todosLosConvenios.forEach(c => {
                    descuentosDisponibles.push({
                        id: c.id,
                        convenio: c.nombre,
                        porcentaje: c.porcentaje_descuento || 0,
                        tipo_descuento: c.tipo_descuento || 'Porcentaje',
                        valor_descuento: c.valor_descuento !== null ? c.valor_descuento : c.porcentaje_descuento
                    });
                });
            } else {
                console.warn('Empresa Colo Colo no encontrada en la base de datos.');
            }

            return res.status(200).json({
                afiliado: true,
                mensaje: 'Socio validado correctamente en Colo Colo.',
                pasajero: pasajero ? {
                    id: pasajero.id,
                    rut: pasajero.rut,
                    nombres: pasajero.nombres,
                    apellidos: pasajero.apellidos,
                    empresa_id: pasajero.empresa_id,
                    convenio_id: pasajero.convenio_id
                } : {
                    id: null,
                    rut: rut,
                    mensaje: 'Pasajero no registrado en base de datos local'
                },
                empresa: empresa ? empresa.nombre : 'No asignada',
                descuentos: descuentosDisponibles,
                data_externa: resultadoExterno
            });

        } else {
            // --- NO ES SOCIO o RESPUESTA NEGATIVA ---
            return res.status(200).json({
                afiliado: false,
                mensaje: 'El RUT consultado no registra afiliación activa en Colo Colo o sus cuotas no están al día.',
                data_externa: resultadoExterno
            });
        }

    } catch (error) {
        next(error);
    }
};
