class ConvenioDTO {
    constructor(convenio) {
        this.id = convenio.id;
        this.nombre = convenio.nombre;
        this.empresa_id = convenio.empresa_id;
        this.status = convenio.status;

        // Transformar tipo a array com pide el user -> ERROR: User corrected, single value.
        this.tipo_consulta = convenio.tipo;

        if (convenio.tipo === 'CODIGO_DESCUENTO') {
            this.endpoint = `/api/convenios/validar/{codigo}`;
        } else {
            // Si es externo, tomar de la BD (si es relativo, se queda relativo)
            this.endpoint = convenio.apiConsulta ? convenio.apiConsulta.endpoint : null;
        }

        this.fecha_inicio = convenio.fecha_inicio;
        this.fecha_termino = convenio.fecha_termino;
        this.tope_monto_ventas = convenio.tope_monto_ventas;
        this.tope_cantidad_tickets = convenio.tope_cantidad_tickets;

        // Nuevos campos directos
        this.porcentaje_descuento = convenio.porcentaje_descuento || 0;
        this.codigo = convenio.codigo;
        this.limitar_por_stock = !!convenio.limitar_por_stock;
        this.limitar_por_monto = !!convenio.limitar_por_monto;

        // Si incluye la empresa relacionada
        if (convenio.empresa) {
            this.empresa = {
                id: convenio.empresa.id,
                nombre: convenio.empresa.nombre,
                rut: convenio.empresa.rut_empresa
            };
        }
    }

    static fromArray(convenios) {
        return convenios.map(convenio => new ConvenioDTO(convenio));
    }
}

module.exports = ConvenioDTO;
