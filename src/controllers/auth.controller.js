const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    // authService.register now returns { user, token }
    res.status(201).json({
      ...result,
      message: 'Usuario creado satisfactoriamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message: 'Correo y password son obligatorios'
      });
    }

    const result = await authService.login({ correo, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
