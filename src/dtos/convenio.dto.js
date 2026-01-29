class ConvenioDTO {
    constructor(convenio) {
        this.id = convenio.id;
        this.nombre = convenio.nombre;
        this.empresa_id = convenio.empresa_id;
        this.status = convenio.status;

        // Si incluye la empresa relacionada
        if (convenio.empresa) {
            this.empresa = {
                id: convenio.empresa.id,
                nombre: convenio.empresa.nombre,
                rut: convenio.empresa.rut_empresa
            };
        }

        // Si incluye descuentos
        if (convenio.Descuentos) {
            this.descuentos = convenio.Descuentos.map(d => ({
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
