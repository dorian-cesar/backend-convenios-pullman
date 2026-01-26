exports.crearUsuario = async (req, res, next) => {
  try {
    const { correo, password, rol_id } = req.body;

    if (!correo || !password || !rol_id) {
      throw new BusinessError('Correo, password y rol son requeridos');
    }

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      throw new BusinessError('Correo ya registrado');
    }

    const rol = await Rol.findOne({
      where: { id: rol_id, status: 'ACTIVO' }
    });

    if (!rol) {
      throw new BusinessError('Rol inválido o inactivo');
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      correo,
      password: hash,
      rol_id: rol.id
    });

    res.status(201).json({
      id: usuario.id,
      correo: usuario.correo,
      rol: rol.nombre
    });
  } catch (error) {
    next(error);
  }
};
