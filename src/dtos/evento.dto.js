class EventoDTO {
    constructor(evento) {
        this.id = evento.id;
        this.tipo_evento = evento.tipo_evento;
        this.evento_origen_id = evento.evento_origen_id;
        this.usuario_id = evento.usuario_id;
        this.pasajero_id = evento.pasajero_id;
        this.empresa_id = evento.empresa_id;
        this.convenio_id = evento.convenio_id;
        this.codigo_descuento_id = evento.codigo_descuento_id;
        this.ciudad_origen = evento.ciudad_origen;
        this.ciudad_destino = evento.ciudad_destino;
        this.fecha_viaje = evento.fecha_viaje;
        this.numero_asiento = evento.numero_asiento;
        this.tarifa_base = evento.tarifa_base;
        this.porcentaje_descuento_aplicado = evento.porcentaje_descuento_aplicado;
        this.monto_pagado = evento.monto_pagado;
        this.monto_devolucion = evento.monto_devolucion;
        this.is_deleted = evento.is_deleted;
        this.fecha_evento = evento.fecha_evento;

        // Incluir relaciones si existen
        if (evento.Usuario) {
            this.usuario = {
                id: evento.Usuario.id,
                correo: evento.Usuario.correo
            };
        }

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

        // Evento origen (para CAMBIO y DEVOLUCION)
        if (evento.EventoOrigen) {
            this.evento_origen = {
                id: evento.EventoOrigen.id,
                tipo_evento: evento.EventoOrigen.tipo_evento,
                fecha_viaje: evento.EventoOrigen.fecha_viaje,
                ciudad_origen: evento.EventoOrigen.ciudad_origen,
                ciudad_destino: evento.EventoOrigen.ciudad_destino
            };
        }
    }

    static fromArray(eventos) {
        return eventos.map(evento => new EventoDTO(evento));
    }
}

module.exports = EventoDTO;
