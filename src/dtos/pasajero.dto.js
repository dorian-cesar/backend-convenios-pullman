class PasajeroDTO {
    constructor(pasajero) {
        this.id = pasajero.id;
        this.rut = pasajero.rut;
        this.nombres = pasajero.nombres;
        this.apellidos = pasajero.apellidos;
        this.fecha_nacimiento = pasajero.fecha_nacimiento;
        this.correo = pasajero.correo;
        this.telefono = pasajero.telefono;
        this.tipo_pasajero_id = pasajero.tipo_pasajero_id;
        this.empresa_id = pasajero.empresa_id;
        this.convenio_id = pasajero.convenio_id;
        this.status = pasajero.status;

        // Incluir relaciones si existen
        if (pasajero.TipoPasajero) {
            this.tipo_pasajero = {
                id: pasajero.TipoPasajero.id,
                nombre: pasajero.TipoPasajero.nombre
            };
        }

        if (pasajero.Empresa) {
            this.empresa = {
                id: pasajero.Empresa.id,
                nombre: pasajero.Empresa.nombre,
                rut: pasajero.Empresa.rut_empresa
            };
        }

        if (pasajero.Convenio) {
            this.convenio = {
                id: pasajero.Convenio.id,
                nombre: pasajero.Convenio.nombre
            };
        }

        if (pasajero.Eventos) {
            this.eventos = pasajero.Eventos;
        }
    }

    static fromArray(pasajeros) {
        return pasajeros.map(pasajero => new PasajeroDTO(pasajero));
    }
}

module.exports = PasajeroDTO;
