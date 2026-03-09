const { Router } = require('express');
const beneficioController = require('../controllers/beneficio.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const beneficioValidation = require('../validations/beneficio.validation');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Beneficios
 *   description: Gestión unificada de personas beneficiarias y sus programas correspondientes
 */

router.use(authMiddleware);

router.post('/', validate(beneficioValidation.crearBeneficio), beneficioController.crear);
router.get('/', beneficioController.listar);
router.get('/:id', validate(beneficioValidation.getBeneficio), beneficioController.obtener);
router.get('/rut/:rut', validate(beneficioValidation.getPorRut), beneficioController.obtenerPorRut);
router.put('/:id', validate(beneficioValidation.actualizarBeneficio), beneficioController.actualizar);
router.delete('/:id', validate(beneficioValidation.getBeneficio), beneficioController.eliminar);
router.patch('/:id/activar', beneficioController.activar);

module.exports = router;
