const araucanaService = require('../services/araucana.service');
const { Pasajero, Empresa, Convenio, Descuento } = require('../models');
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
            // Parsear nombre: "NOMBRE1 NOMBRE2 APELLIDO1 APELLIDO2" 
            // Esto es heurístico, asumiremos el último token es apellido2, penúltimo apellido1, resto nombres.
            const nombreCompleto = resultadoExterno.nombre || '';
            const partes = nombreCompleto.trim().split(/\s+/);

            let nombres = '';
            let apellidos = '';

            if (partes.length >= 2) {
                // Últimos 2 son apellidos
                const ap2 = partes.pop();
                const ap1 = partes.pop();
                apellidos = `${ap1} ${ap2}`;
                nombres = partes.join(' ');
            } else {
                nombres = nombreCompleto; // Fallback
            }

            // Find or Create Pasajero (sin empresa/convenio aun)
            let [pasajero] = await Pasajero.findOrCreate({
                where: { rut: rut },
                defaults: {
                    nombres: nombres,
                    apellidos: apellidos,
                    status: 'ACTIVO'
                }
            });

            // 3. Buscar Empresa "La Araucana" (o configurada)
            // Idealmente buscar por RUT de La Araucana si lo tuviéramos, o por nombre exacto.
            // O usaremos alguna convención.
            let empresa = await Empresa.findOne({
                where: {
                    [Op.or]: [
                        { nombre: { [Op.like]: '%Araucana%' } },
                        { rut_empresa: 'LaAraucana' } // Placeholder si no existe
                    ]
                }
            });

            let descuentosDisponibles = [];

            if (empresa) {
                // Asociar pasajero a esta empresa temporalmente o permanentemente?
                // El requerimiento dice: "la empresa que sera la araucana se le asignara"
                pasajero.empresa_id = empresa.id;
                await pasajero.save();

                // 4. Buscar Convenios y Descuentos Activos
                const hoy = new Date();
                const convenios = await Convenio.findAll({
                    where: {
                        empresa_id: empresa.id,
                        status: 'ACTIVO',
                        fecha_inicio: { [Op.lte]: hoy },
                        fecha_termino: { [Op.gte]: hoy }
                    },
                    include: [{
                        model: Descuento,
                        as: 'descuentos',
                        where: { status: 'ACTIVO' },
                        required: false
                    }]
                });

                // Aplanar descuentos
                convenios.forEach(c => {
                    if (c.descuentos && c.descuentos.length > 0) {
                        c.descuentos.forEach(d => {
                            descuentosDisponibles.push({
                                convenio: c.nombre,
                                porcentaje: d.porcentaje_descuento
                            });
                        });
                    }
                });
            } else {
                console.warn('Empresa La Araucana no encontrada en BD interna.');
            }

            return res.status(200).json({
                afiliado: true,
                mensaje: 'Afiliado validado correctamente.',
                pasajero: {
                    rut: pasajero.rut,
                    nombres: pasajero.nombres,
                    apellidos: pasajero.apellidos
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
