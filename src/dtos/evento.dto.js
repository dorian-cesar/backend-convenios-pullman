class EventoDTO {
    constructor(evento) {
        this.id = evento.id;
        this.tipo_evento = evento.tipo_evento;
        this.tipo_pago = evento.tipo_pago;
        // evento_origen_id removed;
        this.pasajero_id = evento.pasajero_id;
        this.empresa_id = evento.empresa_id;
        this.convenio_id = evento.convenio_id;
        this.codigo_descuento_id = evento.codigo_descuento_id;
        this.ciudad_origen = evento.ciudad_origen;
        this.ciudad_destino = evento.ciudad_destino;
        this.fecha_viaje = evento.fecha_viaje;
        this.numero_asiento = evento.numero_asiento;
        this.numero_ticket = evento.numero_ticket;
        this.pnr = evento.pnr;
        this.hora_salida = evento.hora_salida;
        this.terminal_origen = evento.terminal_origen;
        this.terminal_destino = evento.terminal_destino;
        this.tarifa_base = evento.tarifa_base;
        this.porcentaje_descuento_aplicado = evento.porcentaje_descuento_aplicado;
        this.monto_pagado = evento.monto_pagado;
        this.monto_devolucion = evento.monto_devolucion;
        this.is_deleted = evento.is_deleted;
        this.fecha_evento = evento.fecha_evento;
        this.codigo_autorizacion = evento.codigo_autorizacion;
        this.token = evento.token;
        this.estado = evento.estado;
        this.confirmed_pnrs = evento.confirmed_pnrs;


        if (evento.Pasajero) {
            this.pasajero = {
                id: evento.Pasajero.id,
                rut: evento.Pasajero.rut,
                nombres: evento.Pasajero.nombres,
                apellidos: evento.Pasajero.apellidos
            };
        }

        if (evento.Empresa) {
            this.empresa = {
                id: evento.Empresa.id,
                nombre: evento.Empresa.nombre,
                rut: evento.Empresa.rut_empresa
            };
        }

        if (evento.Convenio) {
            this.convenio = {
                id: evento.Convenio.id,
                nombre: evento.Convenio.nombre
            };
        }

        // Evento origen logic removed because evento_origen_id was deleted
    }

    static fromArray(eventos) {
        return eventos.map(evento => new EventoDTO(evento));
    }
}

module.exports = EventoDTO;
