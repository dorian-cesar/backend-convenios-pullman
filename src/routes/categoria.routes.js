const express = require('express');
const validate = require('../middlewares/validate.middleware');
const categoriaValidation = require('../validations/categoria.validation');
const categoriaController = require('../controllers/categoria.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router
    .route('/')
    .post(auth, validate(categoriaValidation.crearCategoria), categoriaController.crearCategoria)
    .get(auth, categoriaController.getCategorias);

router
    .route('/:id')
    .get(auth, validate(categoriaValidation.getCategoria), categoriaController.getCategoria)
    .patch(auth, validate(categoriaValidation.actualizarCategoria), categoriaController.actualizarCategoria)
    .delete(auth, validate(categoriaValidation.getCategoria), categoriaController.eliminarCategoria);

module.exports = router;
