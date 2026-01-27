const { Router } = require('express');
const controller = require('../controllers/usuarioEmpresa.controller');
const auth = require('../middlewares/auth.middleware');
const roles = require('../middlewares/roles.middleware');

const router = Router();

// SOLO SUPER_USUARIO
router.post(
  '/usuarios/:usuarioId/empresas',
  auth,
  roles([1]), // SUPER_USUARIO
  controller.asignarUsuarioEmpresa
);

module.exports = router;
