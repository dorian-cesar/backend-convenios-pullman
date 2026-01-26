const express = require('express');
const controller = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const roles = require('../middlewares/roles.middleware');

const router = express.Router();

router.post(
  '/usuarios',
  auth,
  roles(['SUPER_USUARIO']),
  controller.crearUsuario
);


module.exports = router;
