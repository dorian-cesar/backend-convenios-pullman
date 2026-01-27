const { Usuario, Empresa, UsuarioEmpresa } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');

exports.asignarUsuarioEmpresa = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    const { empresa_id } = req.body;

    if (!empresa_id) {
      throw new BusinessError('empresa_id es requerido');
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) throw new NotFoundError('Usuario no encontrado');

    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) throw new NotFoundError('Empresa no encontrada');

    const existente = await UsuarioEmpresa.findOne({
      where: {
        usuario_id: usuarioId,
        empresa_id
      }
    });

    if (existente) {
      throw new BusinessError('El usuario ya está asignado a esta empresa');
    }

    const relacion = await UsuarioEmpresa.create({
      usuario_id: usuarioId,
      empresa_id
    });

    res.status(201).json({
      message: 'Usuario asignado a empresa correctamente',
      usuario_id: usuario.id,
      empresa_id: empresa.id
    });
  } catch (error) {
    next(error);
  }
};
