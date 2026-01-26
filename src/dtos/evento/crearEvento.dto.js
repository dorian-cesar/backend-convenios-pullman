const ValidationError = require('../../exceptions/ValidationError');
const PasajeroDTO = require('../pasajero/pasajero.dto');

class CrearEventoDTO {
  constructor(data) {
    this.ciudad_origen = data.ciudad_origen;
    this.ciudad_destino = data.ciudad_destino;
    this.asiento = data.asiento;
    this.monto_original = data.monto_original;
    this.codigo_descuento = data.codigo_descuento || null;
    this.convenio_id = data.convenio_id || null;

    if (!data.pasajero) {
      throw new ValidationError('Información del pasajero requerida');
    }

    this.pasajero = new PasajeroDTO(data.pasajero);
  }

  validar() {
    if (!this.ciudad_origen || !this.ciudad_destino) {
      throw new ValidationError(
        'Ciudad origen y destino son obligatorias'
      );
    }

    if (this.ciudad_origen === this.ciudad_destino) {
      throw new ValidationError(
        'Ciudad origen y destino no pueden ser iguales'
      );
    }

    if (!this.asiento) {
      throw new ValidationError('Asiento obligatorio');
    }

    if (!this.monto_original || this.monto_original <= 0) {
      throw new ValidationError('Monto inválido');
    }

    this.pasajero.validar();

    return true;
  }
}

module.exports = CrearEventoDTO;
