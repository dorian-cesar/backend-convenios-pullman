class AuthResponseDto {
  static from(usuario, rol, token) {
    return {
      user: {
        id: usuario.id,
        correo: usuario.correo,
        rol: rol.nombre
      },
      token
    };
  }
}

module.exports = AuthResponseDto;
