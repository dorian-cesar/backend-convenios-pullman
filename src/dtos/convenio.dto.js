class ConvenioDTO {
    constructor(convenio) {
        this.id = convenio.id;
        this.nombre = convenio.nombre;
        this.empresa_id = convenio.empresa_id;
        this.status = convenio.status;

        // Transformar tipo a array com pide el user -> ERROR: User corrected, single value.
        this.tipo_consulta = convenio.tipo;

        // Obtener endpoint:
        let baseUrl = process.env.BASE_URL;
        if (!baseUrl || !baseUrl.trim()) {
            baseUrl = 'http://localhost:3000';
        } else {
            baseUrl = baseUrl.trim();
        }

        if (convenio.tipo === 'CODIGO_DESCUENTO') {
            // 1. Si es interno, construir dinámicamente
            this.endpoint = `${baseUrl}/api/codigos-descuento/codigo/{codigo}`;
        } else {
            // 2. Si es externo, tomar de la BD
            let ep = convenio.apiConsulta ? convenio.apiConsulta.endpoint : null;

            // Si es un path relativo (proxy), agregar base url
            if (ep && ep.startsWith('/')) {
                ep = `${baseUrl}${ep}`;
            }
            this.endpoint = ep;
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
