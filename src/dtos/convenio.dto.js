class ConvenioDTO {
    constructor(convenio) {
        this.id = convenio.id;
        this.nombre = convenio.nombre;
        this.empresa_id = convenio.empresa_id;
        this.status = convenio.status;

        // Transformar tipo a array com pide el user -> ERROR: User corrected, single value.
        this.tipo_consulta = convenio.tipo;

        // Obtener endpoint:
        // Seguridad: NO exponer dominio, solo rutas relativas
        if (convenio.tipo === 'CODIGO_DESCUENTO') {
            this.endpoint = `/api/codigos-descuento/codigo/{codigo}`;
        } else {
            // Si es externo, tomar de la BD (si es relativo, se queda relativo)
            this.endpoint = convenio.apiConsulta ? convenio.apiConsulta.endpoint : null;
        }

        this.fecha_inicio = convenio.fecha_inicio;
        this.fecha_termino = convenio.fecha_termino;
        this.tope_monto_ventas = convenio.tope_monto_ventas;
        this.tope_cantidad_tickets = convenio.tope_cantidad_tickets;

        // Si incluye la empresa relacionada
        if (convenio.empresa) {
            this.empresa = {
                id: convenio.empresa.id,
                nombre: convenio.empresa.nombre,
                rut: convenio.empresa.rut_empresa
            };
        }

        // Si incluye descuento (singular)
        if (convenio.descuento) {
            this.descuento = {
                id: convenio.descuento.id,
                porcentaje: convenio.descuento.porcentaje_descuento,
                tipo_pasajero_id: convenio.descuento.tipo_pasajero_id,
                status: convenio.descuento.status
            };
        } else {
            this.descuento = null;
        }
    }

    static fromArray(convenios) {
        return convenios.map(convenio => new ConvenioDTO(convenio));
    }
}

module.exports = ConvenioDTO;
