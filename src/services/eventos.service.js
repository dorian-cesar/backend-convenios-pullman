const BusinessError = require('../exceptions/BusinessError');

if (!convenio || convenio.status !== 'ACTIVO') {
  throw new BusinessError(
    'Convenio no válido o inactivo',
    'CONVENIO_INVALIDO'
  );
}

if (edad < 18 && !esEstudiante) {
  throw new BusinessError(
    'Descuento no permitido por edad',
    'DESCUENTO_EDAD'
  );
}
