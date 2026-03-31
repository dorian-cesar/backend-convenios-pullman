const { Beneficiario, Carabinero, Fach, Convenio, Empresa, Evento, Pasajero } = require('../models');

/**
 * Genera un archivo CSV con todos los beneficiarios activos.
 * Formato: RUT;Email;Convenio;Empresa
 */
exports.exportarTodosLosBeneficiarios = async () => {
    // 1. Obtener beneficiarios (Adulto Mayor, Estudiante, Pasajero Frecuente)
    const beneficiariosBase = await Beneficiario.findAll({
        include: [{
            model: Convenio,
            as: 'convenio',
            attributes: ['id', 'empresa_id']
        }],
        where: { status: 'ACTIVO' },
        attributes: ['rut', 'correo']
    });

    // 2. Obtener Carabineros
    const carabineros = await Carabinero.findAll({
        where: { status: 'ACTIVO' },
        attributes: ['rut', 'convenio_id', 'empresa_id']
    });

    // 3. Obtener Fach
    const fach = await Fach.findAll({
        where: { status: 'ACTIVO' },
        attributes: ['rut', 'convenio_id', 'empresa_id']
    });

    // 4. Consolidar datos
    const listaConsolidada = [];

    // Mapear beneficiarios base
    beneficiariosBase.forEach(b => {
        listaConsolidada.push({
            rut: b.rut,
            email: b.correo || '',
            id_convenio: b.convenio?.id || '',
            id_empresa: b.convenio?.empresa_id || ''
        });
    });

    // Mapear carabineros
    carabineros.forEach(c => {
        listaConsolidada.push({
            rut: c.rut,
            email: '', 
            id_convenio: c.convenio_id || '',
            id_empresa: c.empresa_id || ''
        });
    });

    // Mapear fach
    fach.forEach(f => {
        listaConsolidada.push({
            rut: f.rut,
            email: '',
            id_convenio: f.convenio_id || '',
            id_empresa: f.empresa_id || ''
        });
    });

    // 5. Construir CSV
    const encabezados = 'RUT;Email;ID_Convenio;ID_Empresa';
    const filas = listaConsolidada.map(item => 
        `"${item.rut}";"${item.email}";"${item.id_convenio}";"${item.id_empresa}"`
    );

    // Unir todo con saltos de línea (Usamos \ufeff para que Excel detecte UTF-8)
    const csvContent = '\ufeff' + [encabezados, ...filas].join('\n');
    return csvContent;
};

/**
 * Genera un archivo CSV con TODOS los convenios (activos e inactivos).
 * Formato: ID;Nombre;Empresa;Status;Tipo...
 */
exports.exportarTodosLosConvenios = async () => {
    const convenios = await Convenio.findAll({
        include: [{ model: Empresa, as: 'empresa', attributes: ['nombre'] }],
        // Sin filtro de estado
        order: [['id', 'ASC']]
    });

    const encabezados = [
        'ID',
        'Nombre',
        'Empresa',
        'Status',
        'Fecha_Inicio',
        'Fecha_Termino',
        'Tipo_Consulta',
        'Codigo',
        'Tipo_Alcance',
        'Tipo_Descuento',
        'Valor_Descuento',
        'Tope_Monto',
        'Tope_Tickets',
        'Consumo_Tickets',
        'Consumo_Monto_Descuento'
    ].join(';');

    const filas = convenios.map(c => {
        return [
            c.id,
            `"${c.nombre}"`,
            `"${c.empresa?.nombre || 'N/A'}"`,
            `"${c.status}"`,
            c.fecha_inicio ? c.fecha_inicio.toISOString().split('T')[0] : 'N/A',
            c.fecha_termino ? c.fecha_termino.toISOString().split('T')[0] : 'N/A',
            `"${c.tipo}"`,
            `"${c.codigo || ''}"`,
            `"${c.tipo_alcance}"`,
            `"${c.tipo_descuento}"`,
            c.valor_descuento || 0,
            c.tope_monto_descuento || 'Ilimitado',
            c.tope_cantidad_tickets || 'Ilimitado',
            c.consumo_tickets,
            c.consumo_monto_descuento
        ].join(';');
    });

    const csvContent = '\ufeff' + [encabezados, ...filas].join('\n');
    return csvContent;
};

/**
 * Genera un archivo CSV con TODOS los eventos (boletos) registrados.
 * Formato completo con RUTs y Nombres.
 */
exports.exportarTodosLosEventos = async () => {
    const eventos = await Evento.findAll({
        include: [
            { model: Pasajero, attributes: ['rut', 'nombres', 'apellidos'] },
            { model: Empresa, attributes: ['nombre'] },
            { model: Convenio, attributes: ['nombre'] }
        ],
        order: [['fecha_evento', 'DESC']]
    });

    const encabezados = [
        'ID',
        'Tipo_Evento',
        'Fecha_Evento',
        'PNR',
        'Numero_Ticket',
        'Pasajero_RUT',
        'Pasajero_Nombre',
        'Empresa',
        'Convenio',
        'Origen',
        'Destino',
        'Viaje_Ida',
        'Asiento',
        'Tarifa_Base',
        'Pagado',
        'Descuento_Aplicado',
        'Devolucion',
        'Pago_Tipo',
        'Codigo_Autorizacion',
        'Estado'
    ].join(';');

    const filas = eventos.map(e => {
        return [
            e.id,
            `"${e.tipo_evento}"`,
            e.fecha_evento || 'N/A',
            `"${e.pnr || ''}"`,
            `"${e.numero_ticket || ''}"`,
            `"${e.Pasajero?.rut || 'N/A'}"`,
            `"${e.Pasajero?.nombres || ''} ${e.Pasajero?.apellidos || ''}"`,
            `"${e.Empresa?.nombre || 'N/A'}"`,
            `"${e.Convenio?.nombre || 'N/A'}"`,
            `"${e.ciudad_origen}"`,
            `"${e.ciudad_destino}"`,
            `"${e.fecha_viaje}"`,
            `"${e.numero_asiento || ''}"`,
            e.tarifa_base,
            e.monto_pagado || 0,
            e.monto_descuento || 0,
            e.monto_devolucion || 0,
            `"${e.tipo_pago || ''}"`,
            `"${e.codigo_autorizacion || ''}"`,
            `"${e.estado || 'sin_estado'}"`
        ].join(';');
    });

    const csvContent = '\ufeff' + [encabezados, ...filas].join('\n');
    return csvContent;
};
