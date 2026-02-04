class ConvenioDTO {
    constructor(convenio) {
        this.id = convenio.id;
        this.nombre = convenio.nombre;
        this.empresa_id = convenio.empresa_id;
        this.status = convenio.status;

        // Transformar tipo a array com pide el user -> ERROR: User corrected, single value.
        this.tipo_consulta = convenio.tipo;

        // Obtener endpoint:
        // 1. Si es CODIGO_DESCUENTO: Se construye dinámicamente con BASE_URL actual.
        // 2. Si es API_EXTERNA: Se obtiene de la BD (tabla apis_consulta).
        if (convenio.tipo === 'CODIGO_DESCUENTO') {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            this.endpoint = `${baseUrl}/api/codigos-descuento/codigo/{codigo}`;
        } else {
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

        // Si incluye descuentos
        if (convenio.descuentos) {
            this.descuentos = convenio.descuentos.map(d => ({
                id: d.id,
                porcentaje: d.porcentaje_descuento,
                tipo_pasajero_id: d.tipo_pasajero_id,
                status: d.status
            }));
        }
    }

    static fromArray(convenios) {
        return convenios.map(convenio => new ConvenioDTO(convenio));
    }
}

module.exports = ConvenioDTO;
