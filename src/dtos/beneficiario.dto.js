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
        
        // Solo incluir imágenes si el campo existe en el objeto original (exclusión dinámica)
        if (beneficiario.imagenes !== undefined) {
            this.imagenes = beneficiario.imagenes || null;
        }
        
        this.razon_rechazo = beneficiario.razon_rechazo || null;


        // Incluir datos del convenio si están disponibles
        if (beneficiario.convenio) {
            this.convenio_nombre = beneficiario.convenio.nombre;
            this.categoria_id = beneficiario.convenio.categoria_id;
            this.categoria_nombre = beneficiario.convenio.categoria?.nombre || "Sin Categoría";
            this.empresa_nombre = beneficiario.convenio.empresa?.nombre || "Sin Empresa";
            this.convenio = {
                id: beneficiario.convenio.id,
                nombre: beneficiario.convenio.nombre,
                categoria_id: beneficiario.convenio.categoria_id,
                empresa_id: beneficiario.convenio.empresa_id
            };
        }

        this.createdAt = beneficiario.createdAt;
    }

    static list(beneficiarios) {
        return beneficiarios.map(b => new BeneficiarioDTO(b));
    }
}

module.exports = BeneficiarioDTO;
