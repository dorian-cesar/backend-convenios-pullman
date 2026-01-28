const {
  Convenio,
  CodigoDescuento,
  Descuento,
  TipoPasajero
} = require('../models');
const { Op } = require('sequelize');

exports.obtenerDescuentoAplicable = async ({
  convenioId,
  codigo,
  tipoPasajeroId,
  pasajeroId
}) => {
  // 1. Código de descuento (prioridad máxima)
  if (codigo) {
    const codigoValido = await CodigoDescuento.findOne({
      where: {
        codigo,
        status: 'ACTIVO',
        fecha_inicio: { [Op.lte]: new Date() },
        fecha_termino: { [Op.gte]: new Date() }
      },
      include: [{
        model: Descuento,
        required: false // Puede tener descuentos asociados o ser un código genérico
      }]
    });

    if (codigoValido) {
      // Retornar el código y sus descuentos asociados si los tiene
      // Ojo: La relación CodigoDescuento -> Descuento es 1:N? O el CodigoDescuento ES el descuento?
      // Según modelo: CodigoDescuento tiene many Descuento. 
      // Si hay descuentos específicos configurados para este código, usarlos.
      if (codigoValido.Descuentos && codigoValido.Descuentos.length > 0) {
        return codigoValido.Descuentos[0]; // Retorna el primer descuento asociado
      }
      // Si no, quizás el código en sí mismo implica un beneficio (lógica custom), 
      // pero por ahora retornamos null o el objeto código?
      // Asumiremos que debe haber un registro en DESCUENTOS asociado.
    }
  }

  // 2. Convenio + Tipo Pasajero
  if (convenioId && tipoPasajeroId) {
    const descuento = await Descuento.findOne({
      where: {
        convenio_id: convenioId,
        tipo_pasajero_id: tipoPasajeroId,
        status: 'ACTIVO'
      }
    });

    if (descuento) return descuento;
  }

  // 3. Convenio General (sin tipo pasajero específico, o null)
  if (convenioId) {
    const descuentoGeneral = await Descuento.findOne({
      where: {
        convenio_id: convenioId,
        tipo_pasajero_id: null,
        status: 'ACTIVO'
      }
    });
    if (descuentoGeneral) return descuentoGeneral;
  }

  return null;
};
