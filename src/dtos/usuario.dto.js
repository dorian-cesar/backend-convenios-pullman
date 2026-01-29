class UsuarioDTO {
    constructor(usuario) {
        this.id = usuario.id;
        this.correo = usuario.correo;
        this.nombre = usuario.nombre;
        this.rut = usuario.rut;
        this.status = usuario.status;
        this.telefono = usuario.telefono;

        // Extraer el primer rol (o todos si hay múltiples)
        if (usuario.Rols && usuario.Rols.length > 0) {
            this.rol = usuario.Rols[0].nombre;
            this.rol_id = usuario.Rols[0].id;
        } else {
            this.rol = null;
            this.rol_id = null;
        }
    }

    static fromArray(usuarios) {
        return usuarios.map(usuario => new UsuarioDTO(usuario));
    }
}

module.exports = UsuarioDTO;
