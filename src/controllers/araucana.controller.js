const araucanaService = require('../services/araucana.service');
const convenioService = require('../services/convenio.service');
const { Pasajero, Empresa, Convenio, ApiConsulta } = require('../models');
const { Op } = require('sequelize');

exports.validar = async (req, res, next) => {
    try {
        const { rut } = req.body;
        if (!rut) {
            return res.status(400).json({ message: 'RUT es obligatorio' });
        }

        // 1. Consultar API Externa
        const resultadoExterno = await araucanaService.consultarBeneficiario(rut);

        // resultadoExterno ejemplo: { estado: 1001, nombre: "SADIA GERALDINA MOSCOSO ROJAS", ... }

        if (resultadoExterno.estado === 1001) {
            // --- ES AFILIADO ---

            // 2. Buscar o Crear Pasajero
            const nombreCompleto = resultadoExterno.nombre || '';
            const partes = nombreCompleto.trim().split(/\s+/);

            let nombres = '';
            let apellidos = '';

            if (partes.length >= 2) {
                const ap2 = partes.pop();
                const ap1 = partes.pop();
                apellidos = `${ap1} ${ap2}`;
                nombres = partes.join(' ');
            } else {
                nombres = nombreCompleto;
            }

            let [pasajero] = await Pasajero.findOrCreate({
                where: { rut: rut },
                defaults: {
                    nombres: nombres,
                    apellidos: apellidos,
                    status: 'ACTIVO'
                }
            });

            // 3. Buscar Empresa "La Araucana"
            let empresa = await Empresa.findOne({
                where: {
                    [Op.or]: [
                        { nombre: { [Op.like]: '%Araucana%' } },
                        { rut_empresa: 'LaAraucana' }
                    ]
                }
            });

            let descuentosDisponibles = [];

            if (empresa) {
                // Asociar pasajero a esta empresa
                pasajero.empresa_id = empresa.id;

                // 4. Buscar el Convenio específico vinculado al endpoint de validación de Araucana
                const convenioApi = await Convenio.findOne({
                    where: {
                        empresa_id: empresa.id,
                        status: 'ACTIVO',
                        tipo: 'API_EXTERNA'
                    },
                    include: [{
                        model: ApiConsulta,
                        as: 'apiConsulta',
                        where: { endpoint: '/api/integraciones/araucana/validar' }
                    }]
                });

                if (convenioApi) {
                    pasajero.convenio_id = convenioApi.id;

                    // Validar Vigencia (Fechas)
                    const vigente = await convenioService.validarVigencia(convenioApi.id);
                    if (!vigente) {
                        return res.status(409).json({ message: 'El convenio La Araucana no se encuentra vigente por fecha.' });
                    }
                    // Validar Límites (Stock y Monto)
                    await convenioService.verificarLimites(convenioApi.id, 0);

                } else {
                    // Fallback: Si no hay uno específico de API, buscar cualquier activo para poblar descuentos
                    const conveniosActivos = await Convenio.findAll({
                        where: { empresa_id: empresa.id, status: 'ACTIVO' }
                    });
                    if (conveniosActivos.length > 0) {
                        const conv = conveniosActivos[0];
                        pasajero.convenio_id = conv.id;

                        // Validar Vigencia (Fechas)
                        const vigente = await convenioService.validarVigencia(conv.id);
                        if (!vigente) {
                            // Si el fallback tampoco es vigente, podríamos fallar o dejarlo pasar pero sin asignarlo?
                            // El requerimiento dice "que me valide". Si falla, fallamos.
                            return res.status(409).json({ message: 'El convenio La Araucana no se encuentra vigente por fecha.' });
                        }
                        // Validar Límites
                        await convenioService.verificarLimites(conv.id, 0);
                    }
                }

                await pasajero.save();

                // Buscar todos los convenios activos para mostrar descuentos en la respuesta
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
                        porcentaje: c.porcentaje_descuento || 0
                    });
                });
            } else {
                console.warn('Empresa La Araucana no encontrada en BD interna.');
            }

            return res.status(200).json({
                afiliado: true,
                mensaje: 'Afiliado validado correctamente.',
                pasajero: {
                    id: pasajero.id,
                    rut: pasajero.rut,
                    nombres: pasajero.nombres,
                    apellidos: pasajero.apellidos,
                    empresa_id: pasajero.empresa_id,
                    convenio_id: pasajero.convenio_id
                },
                empresa: empresa ? empresa.nombre : 'No asignada en BD',
                descuentos: descuentosDisponibles,
                data_externa: resultadoExterno
            });

        } else {
            // --- NO ES AFILIADO ---
            return res.status(200).json({
                afiliado: false,
                mensaje: 'El RUT consultado no pertenece a la Caja La Araucana.',
                data_externa: resultadoExterno // Para debugging o info extra
            });
        }

    } catch (error) {
        next(error);
    }
};
