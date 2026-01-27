const { Router } = require('express');

const authRoutes = require('./auth.routes');
const eventosRoutes = require('./eventos.routes');
const pasajerosRoutes = require('./pasajeros.routes');
const adminRoutes = require('./admin.routes');
const empresaRoutes = require('./empresa.routes');

const router = Router();

router.use('/auth', authRoutes);
// router.use('/eventos', eventosRoutes);
// router.use('/pasajeros', pasajerosRoutes);
router.use('/admin', adminRoutes);
router.use('/empresas', empresaRoutes);
module.exports = router;
