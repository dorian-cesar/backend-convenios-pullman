class ConvenioDTO {
    constructor(convenio) {
        this.id = convenio.id;
        this.nombre = convenio.nombre;
        this.empresa_id = convenio.empresa_id;
        this.status = convenio.status;

        // Si incluye la empresa relacionada
        if (convenio.Empresa) {
            this.empresa = {
                id: convenio.Empresa.id,
                nombre: convenio.Empresa.nombre,
                rut: convenio.Empresa.rut_empresa
            };
        }
    }

    static fromArray(convenios) {
        return convenios.map(convenio => new ConvenioDTO(convenio));
    }
}

module.exports = ConvenioDTO;
