class ConvenioDTO {
    constructor(convenio) {
        this.id = convenio.id;
        this.nombre = convenio.nombre;
        this.empresa_id = convenio.empresa_id;

        // Extraer empresa a este nivel específico
        if (convenio.empresa) {
            this.empresa_nombre = convenio.empresa.nombre;
            this.empresa_rut = convenio.empresa.rut_empresa;
        }

        this.status = convenio.status;

        // Transformar tipo a array com pide el user -> ERROR: User corrected, single value.
        this.tipo_consulta = convenio.tipo;
        this.api_url_id = convenio.api_consulta_id;

        // (Empresa ya extraída arriba)

        if (convenio.tipo === 'CODIGO_DESCUENTO') {
            this.endpoint = `/api/convenios/validar/{codigo}`;
        } else {
            // Si es externo, tomar de la BD (si es relativo, se queda relativo)
            this.endpoint = convenio.apiConsulta ? convenio.apiConsulta.endpoint : null;
        }

        this.fecha_inicio = convenio.fecha_inicio;
        this.fecha_termino = convenio.fecha_termino;
        this.tope_monto_descuento = convenio.tope_monto_descuento;
        this.tope_cantidad_tickets = convenio.tope_cantidad_tickets;

        // Nuevos campos directos
        this.porcentaje_descuento = convenio.porcentaje_descuento || 0;
        this.codigo = convenio.codigo;
        this.limitar_por_stock = !!convenio.limitar_por_stock;
        this.limitar_por_monto = !!convenio.limitar_por_monto;
        this.beneficio = convenio.beneficio !== undefined ? convenio.beneficio : null;
        this.imagenes = convenio.imagenes || null;

        // Consumo acumulado
        this.consumo_tickets = convenio.consumo_tickets || 0;
        this.consumo_monto_descuento = convenio.consumo_monto_descuento || 0;
    }

    static fromArray(convenios) {
        return convenios.map(convenio => new ConvenioDTO(convenio));
    }
}

module.exports = ConvenioDTO;
