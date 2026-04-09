const { Router } = require('express');
const c = require('../controllers/clienteCorporativoTablaEmpresa.controller');
const auth = require('../middlewares/auth.middleware');
const apiKey = require('../middlewares/apiKey.middleware');
const router = Router();

// Validación externa (Cajas)
router.post('/validar/:nombreTabla', apiKey, c.validar);

// CRUD Interno (Mantenedor)
router.use('/:nombreTabla/clientes', auth);
router.get('/:nombreTabla/clientes', c.listar);
router.post('/:nombreTabla/clientes', c.crear);
router.get('/:nombreTabla/clientes/:rut', c.obtener);
router.put('/:nombreTabla/clientes/:rut', c.actualizar);
router.delete('/:nombreTabla/clientes/:rut', c.eliminar);
router.patch('/:nombreTabla/clientes/:rut/estado', c.cambiarEstado);
router.post('/:nombreTabla/clientes/cargar-csv', c.cargarCsv);

module.exports = router;
