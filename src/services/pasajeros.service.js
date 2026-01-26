const { Pasajero } = require('../models');

const calcularEdad = (anioNacimiento) => {
  const anioActual = new Date().getFullYear();
  return anioActual - anioNacimiento;
};

const determinarTipoUsuario = ({ anio_nacimiento, es_estudiante, carnet }) => {
  const edad = calcularEdad(anio_nacimiento);

  if (es_estudiante) {
    if (!carnet) {
      throw new Error('Carnet de estudiante requerido');
    }
    return 'ESTUDIANTE';
  }

  if (edad >= 60) {
    return 'ADULTO_MAYOR';
  }

  return 'GENERAL';
};

exports.obtenerOCrearPasajero = async (data, transaction) => {
  let pasajero = null;

  if (data.rut) {
    pasajero = await Pasajero.findOne({
      where: { rut: data.rut },
      transaction
    });
  }

  if (!pasajero) {
    const tipoUsuario = determinarTipoUsuario({
      anio_nacimiento: data.anio_nacimiento,
      es_estudiante: data.es_estudiante,
      carnet: data.carnet_estudiante_url
    });

    pasajero = await Pasajero.create(
      {
        rut: data.rut,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono,
        anio_nacimiento: data.anio_nacimiento,
        es_estudiante: data.es_estudiante,
        carnet_estudiante_url: data.carnet_estudiante_url,
        tipo_usuario: tipoUsuario,
        empresa_id: data.empresa_id
      },
      { transaction }
    );
  }

  return pasajero;
};
