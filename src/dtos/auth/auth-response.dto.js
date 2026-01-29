class AuthResponseDto {
  static from(usuario, rol, token) {
    return {
      user: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        rol: rol.nombre
      },
      token
    };
  }
}

module.exports = AuthResponseDto;
