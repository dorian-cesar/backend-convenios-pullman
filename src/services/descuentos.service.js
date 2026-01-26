const {
  Convenio,
  CodigoDescuento,
  Descuento
} = require('../models');
const { Op } = require('sequelize');

exports.obtenerDescuentoAplicable = async ({
  convenioId,
  codigo,
  tipoUsuario
}) => {
  // 1. Código de descuento (prioridad máxima)
  if (codigo) {
    const codigoValido = await CodigoDescuento.findOne({
      where: {
        codigo,
        status: 'ACTIVE',
        fecha_inicio: { [Op.lte]: new Date() },
        fecha_termino: { [Op.gte]: new Date() }
      },
      include: [Descuento]
    });

    if (codigoValido?.Descuentos?.length) {
      return codigoValido.Descuentos[0];
    }
  }

  // 2. Convenio
  if (convenioId) {
    const descuentos = await Descuento.findAll({
      where: {
        convenio_id: convenioId,
        status: 'ACTIVE'
      }
    });

    const porTipo = descuentos.find(d => d.aplica_a === tipoUsuario);
    return porTipo || descuentos[0];
  }

  return null;
};
