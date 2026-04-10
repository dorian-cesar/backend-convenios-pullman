const losAndesService = require('../services/losAndes.service');
const convenioService = require('../services/convenio.service');
const { Pasajero, Empresa, Convenio, ApiConsulta } = require('../models');
const { Op } = require('sequelize');

exports.validar = async (req, res, next) => {
    try {
        const { rut } = req.body;
        if (!rut) {
            return res.status(400).json({ message: 'RUT es obligatorio' });
        }

        // Limpiar el RUT para obtener solo los números (sin puntos, sin guión, y sin DV)
        const limpio = rut.replace(/\./g, '').replace(/-/g, '');
        const rutNum = limpio.slice(0, -1); // Eliminamos el DV

        // 1. Consultar API Externa de Caja Los Andes
        const resultadoExterno = await losAndesService.consultarAfiliacion(rutNum);

        // Validar respuesta según formato: { ok: true, result: { estadoEnCaracterDeAfiliado: 'Afiliado' } }
        const esAfiliadoValido = resultadoExterno && 
                               resultadoExterno.ok === true && 
                               resultadoExterno.result && 
                               resultadoExterno.result.estadoEnCaracterDeAfiliado === 'Afiliado';

        if (esAfiliadoValido) {
            // --- ES AFILIADO ---
            
            // 2. Buscar o Crear Pasajero en base al RUT completo
            let [pasajero] = await Pasajero.findOrCreate({
                where: { rut: rut },
                defaults: {
                    status: 'ACTIVO'
                }
            });

            // 3. Buscar Empresa "Caja Los Andes"
            let empresa = await Empresa.findOne({
                where: {
                    [Op.or]: [
                        { nombre: { [Op.like]: '%Andes%' } },
                        { rut_empresa: 'CajaLosAndes' }
                    ]
                }
            });

            let descuentosDisponibles = [];

            if (empresa) {
                pasajero.empresa_id = empresa.id;

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
                        where: { endpoint: '/api/integraciones/los-andes/validar' }
                    }]
                });

                if (convenioApi) {
                    pasajero.convenio_id = convenioApi.id;
                    
                    // Validar Vigencia
                    const vigente = await convenioService.validarVigencia(convenioApi.id);
                    if (!vigente) {
                        return res.status(409).json({ message: 'El convenio Caja Los Andes no se encuentra vigente.' });
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
                        pasajero.convenio_id = conv.id;

                        const vigente = await convenioService.validarVigencia(conv.id);
                        if (!vigente) {
                            return res.status(409).json({ message: 'El convenio Caja Los Andes no se encuentra vigente.' });
                        }
                        await convenioService.verificarLimites(conv.id, 0);
                    }
                }

                await pasajero.save();

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
                console.warn('Empresa Caja Los Andes no encontrada en la base de datos.');
            }

            return res.status(200).json({
                afiliado: true,
                mensaje: 'Afiliado validado correctamente en Caja Los Andes.',
                pasajero: {
                    id: pasajero.id,
                    rut: pasajero.rut,
                    nombres: pasajero.nombres,
                    apellidos: pasajero.apellidos,
                    empresa_id: pasajero.empresa_id,
                    convenio_id: pasajero.convenio_id
                },
                empresa: empresa ? empresa.nombre : 'No asignada',
                descuentos: descuentosDisponibles,
                data_externa: resultadoExterno
            });

        } else {
            // --- NO ES AFILIADO o RESPUESTA NEGATIVA ---
            return res.status(200).json({
                afiliado: false,
                mensaje: 'El RUT consultado no registra afiliación activa en Caja Los Andes.',
                data_externa: resultadoExterno
            });
        }

    } catch (error) {
        next(error);
    }
};
