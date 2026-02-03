const { Router } = require('express');

const authRoutes = require('./auth.routes');
const eventosRoutes = require('./eventos.routes');
const pasajerosRoutes = require('./pasajeros.routes');
const adminRoutes = require('./admin.routes');
const adminUsuarioEmpresaRoutes = require('./admin.usuarioEmpresa.routes');
const empresaRoutes = require('./empresa.routes');
const convenioRoutes = require('./convenio.routes');
const codigoDescuentoRoutes = require('./codigoDescuento.routes');
const descuentoRoutes = require('./descuento.routes');
const kpiRoutes = require('./kpi.routes');
const araucanaRoutes = require('./araucana.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/eventos', eventosRoutes);
router.use('/pasajeros', pasajerosRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', adminUsuarioEmpresaRoutes);
router.use('/empresas', empresaRoutes);
router.use('/convenios', convenioRoutes);
router.use('/codigos-descuento', codigoDescuentoRoutes);
router.use('/descuentos', descuentoRoutes);
router.use('/kpis', kpiRoutes);
router.use('/integraciones', araucanaRoutes);
module.exports = router;
