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
        // Incluir convenio si existe
        const convenio = codigoDescuento.convenio || codigoDescuento.Convenio;
        if (convenio) {
            this.convenio = {
                id: convenio.id,
                nombre: convenio.nombre,
                empresa: convenio.empresa ? {
                    id: convenio.empresa.id,
                    nombre: convenio.empresa.nombre,
                    rut: convenio.empresa.rut_empresa
                } : null
            };
        }

        // Incluir descuentos si existen
        // Incluir descuentos si existen
        const descuentos = codigoDescuento.descuentos || codigoDescuento.Descuentos;
        if (descuentos) {
            this.descuentos = descuentos.map(d => ({
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
