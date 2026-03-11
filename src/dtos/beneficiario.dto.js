class BeneficiarioDTO {
    constructor(beneficiario) {
        this.id = beneficiario.id;
        this.convenio_id = beneficiario.convenio_id;
        this.nombre = beneficiario.nombre;
        this.rut = beneficiario.rut;
        this.telefono = beneficiario.telefono;
        this.correo = beneficiario.correo;
        this.direccion = beneficiario.direccion;
        this.status = beneficiario.status;
        this.imagenes = beneficiario.imagenes || null;
        this.razon_rechazo = beneficiario.razon_rechazo || null;

        // Incluir datos del convenio si están disponibles
        if (beneficiario.convenio) {
            this.convenio_nombre = beneficiario.convenio.nombre;
        }

        this.createdAt = beneficiario.createdAt;
    }

    static list(beneficiarios) {
        return beneficiarios.map(b => new BeneficiarioDTO(b));
    }
}

module.exports = BeneficiarioDTO;
