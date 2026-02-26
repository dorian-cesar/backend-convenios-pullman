class FachDTO {
    constructor(fach) {
        this.id = fach.id;
        this.rut = fach.rut;
        this.nombre_completo = fach.nombre_completo;
        this.status = fach.status;

        // Relación con Empresa
        if (fach.empresa) {
            this.empresa = {
                id: fach.empresa.id,
                nombre: fach.empresa.nombre,
                rut_empresa: fach.empresa.rut_empresa
            };
        } else {
            this.empresa_id = fach.empresa_id;
        }

        // Relación con Convenio
        if (fach.convenio) {
            this.convenio = {
                id: fach.convenio.id,
                nombre: fach.convenio.nombre
            };
        } else {
            this.convenio_id = fach.convenio_id;
        }

        this.createdAt = fach.createdAt;
        this.updatedAt = fach.updatedAt;
    }
}

module.exports = FachDTO;
