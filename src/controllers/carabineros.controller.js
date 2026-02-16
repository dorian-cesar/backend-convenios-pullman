const { Carabinero, Pasajero, Convenio, Empresa } = require('../models');
const { Op } = require('sequelize');

exports.validar = async (req, res) => {
    try {
        const { rut } = req.body;

        if (!rut) {
            return res.status(400).json({ message: 'El RUT es requerido' });
        }

        // Limpiar el RUT (quitar puntos) y asegurar mayúsculas
        const cleanRut = rut.replace(/\./g, '').toUpperCase();

        // Separar cuerpo y dígito verificador
        // Asumimos formato XXXXXXXX-Y
        const parts = cleanRut.split('-');
        if (parts.length !== 2) {
            return res.status(400).json({ message: 'Formato de RUT inválido. Debe ser 12345678-9' });
        }

        const rutBody = parts[0];
        const dv = parts[1];

        // 1. Consultar tabla carabineros usando solo el cuerpo del RUT
        const carabinero = await Carabinero.findOne({
            where: { rut: rutBody }
        });

        if (!carabinero) {
            return res.status(404).json({ message: 'RUT no encontrado en registros de Carabineros' });
        }

        // Verificar estado (asumiendo que hay una columna status)
        if (!carabinero.status || carabinero.status.toUpperCase() !== 'ACTIVO') {
            return res.status(403).json({ message: 'El funcionario no se encuentra activo' });
        }

        // 2. Buscar IDs de Convenio y Empresa dinámicamente
        const convenio = await Convenio.findOne({ where: { nombre: 'CARABINEROS' } });
        const empresa = await Empresa.findOne({ where: { nombre: 'CARABINEROS DE CHILE' } });

        if (!convenio || !empresa) {
            console.error('Error de configuración: No se encontró Convenio CARABINEROS o Empresa CARABINEROS DE CHILE');
            return res.status(500).json({ message: 'Error de configuración en el sistema. Contacte al administrador.' });
        }

        // 3. Crear o Actualizar Pasajero con el RUT completo
        const nombreCompleto = carabinero.nombre_completo || '';
        // Intento básico de separar nombre y apellido
        const nombreParts = nombreCompleto.split(' ');
        const nombres = nombreParts[0] || 'Sin Nombre';
        const apellidos = nombreParts.slice(1).join(' ') || 'Sin Apellido';

        const [pasajero, created] = await Pasajero.findOrCreate({
            where: { rut: cleanRut },
            defaults: {
                nombres: nombres,
                apellidos: apellidos,
                empresa_id: empresa.id,
                convenio_id: convenio.id,
                tipo_pasajero_id: 1, // Asumiendo ID 1 para ADULTO o similar, ajustar si es necesario
                status: 'ACTIVO'
            }
        });

        if (!created) {
            // Si ya existe, actualizamos la asociación
            await pasajero.update({
                empresa_id: empresa.id,
                convenio_id: convenio.id,
                status: 'ACTIVO'
                // Opcional: actualizar nombres si se desea sobrescribir lo que había
            });
        }

        return res.status(200).json({
            afiliado: true,
            mensaje: 'Validación exitosa',
            pasajero: pasajero,
            empresa: empresa.nombre,
            descuentos: [
                {
                    convenio: convenio.nombre,
                    porcentaje: convenio.porcentaje_descuento || 0
                }
            ]
        });

    } catch (error) {
        console.error('Error en validar carabinero:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
