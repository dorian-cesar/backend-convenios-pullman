const ValidationError = require('../../exceptions/ValidationError');

class PasajeroDTO {
  constructor(data) {
    this.rut = data.rut;
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.correo = data.correo;
    this.telefono = data.telefono;
    this.anio_nacimiento = data.anio_nacimiento;
    this.es_estudiante = data.es_estudiante || false;
    this.carnet_estudiante_url = data.carnet_estudiante_url || null;
    this.empresa_id = data.empresa_id || null;
  }

  validar() {
    if (!this.rut) {
      throw new ValidationError('El RUT es obligatorio');
    }

    if (!this.anio_nacimiento) {
      throw new ValidationError('Año de nacimiento obligatorio');
    }

    const anioActual = new Date().getFullYear();
    const edad = anioActual - this.anio_nacimiento;

    if (edad < 0 || edad > 120) {
      throw new ValidationError('Año de nacimiento inválido');
    }

    if (this.es_estudiante && !this.carnet_estudiante_url) {
      throw new ValidationError(
        'Carnet de estudiante requerido'
      );
    }

    return true;
  }
}

module.exports = PasajeroDTO;
