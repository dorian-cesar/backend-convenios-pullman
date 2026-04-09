const { Router } = require('express');
const c = require('../controllers/registroTablaClienteCorporativo.controller');
const auth = require('../middlewares/auth.middleware');
const router = Router();

router.use(auth);
router.post('/', c.crear);
router.get('/', c.listar);
router.get('/:id', c.obtener);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
