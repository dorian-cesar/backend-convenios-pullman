class DescuentoDTO {
    constructor(descuento) {
        this.id = descuento.id;
        this.convenio_id = descuento.convenio_id;
        this.codigo_descuento_id = descuento.codigo_descuento_id;
        this.tipo_pasajero_id = descuento.tipo_pasajero_id;
        this.pasajero_id = descuento.pasajero_id;
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

        if (descuento.TipoPasajero) {
            this.tipo_pasajero = {
                id: descuento.TipoPasajero.id,
                nombre: descuento.TipoPasajero.nombre
            };
        }

        if (descuento.Pasajero) {
            this.pasajero = {
                id: descuento.Pasajero.id,
                rut: descuento.Pasajero.rut,
                nombres: descuento.Pasajero.nombres,
                apellidos: descuento.Pasajero.apellidos
            };
        }
    }

    static fromArray(descuentos) {
        return descuentos.map(descuento => new DescuentoDTO(descuento));
    }
}

module.exports = DescuentoDTO;
