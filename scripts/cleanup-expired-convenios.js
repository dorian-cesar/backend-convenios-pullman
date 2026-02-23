const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

// Ajustar según tu configuración de modelos
const db = require('../src/models');
const { Convenio } = db;

const cleanupExpiredConvenios = async () => {
    try {
        console.log('Iniciando limpieza de convenios expirados...');

        // Conectar a la BD
        await db.sequelize.authenticate();
        console.log('Conexión a base de datos exitosa.');

        const hoy = new Date();
        console.log(`Fecha actual de referencia: ${hoy.toISOString()}`);

        // 1. Buscar convenios que están ACTIVO pero tienen fecha_termino < hoy
        // Nota: fecha_termino se asume hasta el final del día, así que comparamos con start of day? 
        // En el servicio usamos: termino.setHours(23, 59, 59, 999); if (hoy > termino) ...
        // Para SQL simple: fecha_termino < NOW() (aprox)

        // Opción A: Buscar y actualizar uno por uno para aplicar la lógica exacta de JS
        const convenios = await Convenio.findAll({
            where: {
                status: 'ACTIVO',
                [Op.or]: [
                    { fecha_termino: { [Op.ne]: null } },
                    { fecha_inicio: { [Op.ne]: null } }
                ]
            }
        });

        let count = 0;
        for (const convenio of convenios) {
            let shouldDeactivate = false;

            // Validar Inicio
            if (convenio.fecha_inicio) {
                const inicio = new Date(convenio.fecha_inicio);
                if (hoy < inicio) {
                    shouldDeactivate = true;
                    console.log(`Convenio ID ${convenio.id} (${convenio.nombre}) INACTIVO por inicio futuro: ${inicio.toISOString()}`);
                }
            }

            // Validar Término
            if (convenio.fecha_termino) {
                const termino = new Date(convenio.fecha_termino);
                termino.setHours(23, 59, 59, 999);
                if (hoy > termino) {
                    shouldDeactivate = true;
                    console.log(`Convenio ID ${convenio.id} (${convenio.nombre}) INACTIVO por término pasado: ${termino.toISOString()}`);
                }
            }

            if (shouldDeactivate) {
                convenio.status = 'INACTIVO';
                await convenio.save();
                count++;
            }
        }

        console.log(`Limpieza completada. ${count} convenios fueron actualizados a INACTIVO.`);
    } catch (error) {
        console.error('Error durante la limpieza:', error);
    } finally {
        process.exit();
    }
};

cleanupExpiredConvenios();
