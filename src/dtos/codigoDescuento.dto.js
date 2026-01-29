class CodigoDescuentoDTO {
    constructor(codigoDescuento) {
        this.id = codigoDescuento.id;
        this.convenio_id = codigoDescuento.convenio_id;
        this.codigo = codigoDescuento.codigo;
        this.fecha_inicio = codigoDescuento.fecha_inicio;
        this.fecha_termino = codigoDescuento.fecha_termino;
        this.max_usos = codigoDescuento.max_usos;
        this.usos_realizados = codigoDescuento.usos_realizados;
        this.status = codigoDescuento.status;
        this.created_at = codigoDescuento.created_at;

        // Incluir convenio si existe
        if (codigoDescuento.Convenio) {
            this.convenio = {
                id: codigoDescuento.Convenio.id,
                nombre: codigoDescuento.Convenio.nombre
            };
        }

        // Incluir descuentos si existen
        if (codigoDescuento.Descuentos) {
            this.descuentos = codigoDescuento.Descuentos.map(d => ({
                id: d.id,
                porcentaje: d.porcentaje_descuento,
                status: d.status
            }));
        }

        // Calcular si está vigente
        const hoy = new Date();
        const inicio = new Date(codigoDescuento.fecha_inicio);
        const termino = new Date(codigoDescuento.fecha_termino);

        this.vigente = (
            codigoDescuento.status === 'ACTIVO' &&
            hoy >= inicio &&
            hoy <= termino &&
            (codigoDescuento.max_usos === null || codigoDescuento.usos_realizados < codigoDescuento.max_usos)
        );
    }

    static fromArray(codigos) {
        return codigos.map(codigo => new CodigoDescuentoDTO(codigo));
    }
}

module.exports = CodigoDescuentoDTO;
