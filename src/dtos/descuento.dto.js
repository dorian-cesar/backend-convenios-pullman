class DescuentoDTO {
    constructor(descuento) {
        this.id = descuento.id;
        this.convenio_id = descuento.convenio_id;
        this.codigo_descuento_id = descuento.codigo_descuento_id;
        // tipo_pasajero_id removed
        // pasajero_id removed
        this.porcentaje_descuento = descuento.porcentaje_descuento;
        this.status = descuento.status;

        // Incluir relaciones si existen
        if (descuento.Convenio) {
            this.convenio = {
                id: descuento.Convenio.id,
                nombre: descuento.Convenio.nombre
            };
        }

        if (descuento.CodigoDescuento) {
            this.codigo_descuento = {
                id: descuento.CodigoDescuento.id,
                codigo: descuento.CodigoDescuento.codigo
            };
        }

        // TipoPasajero and Pasajero relations removed from DTO
    }

    static fromArray(descuentos) {
        return descuentos.map(descuento => new DescuentoDTO(descuento));
    }
}

module.exports = DescuentoDTO;
