const { Router } = require('express');

const authRoutes = require('./auth.routes');
const eventosRoutes = require('./eventos.routes');
const pasajerosRoutes = require('./pasajeros.routes');
const adminRoutes = require('./admin.routes');
const adminUsuarioEmpresaRoutes = require('./admin.usuarioEmpresa.routes');
const empresaRoutes = require('./empresa.routes');
const convenioRoutes = require('./convenio.routes');
const kpiRoutes = require('./kpi.routes');
const araucanaRoutes = require('./araucana.routes');
const apiConsultaRoutes = require('./apiConsulta.routes');
const estudiantesRoutes = require('./estudiantes.routes');
const adultosMayoresRoutes = require('./adultosMayores.routes');
const pasajerosFrecuentesRoutes = require('./pasajerosFrecuentes.routes');
const integracionBeneficiariosRoutes = require('./integracionBeneficiarios.routes');
const carabinerosRoutes = require('./carabineros.routes');
const fachRoutes = require('./fach.routes');
const rolesRoutes = require('./roles.routes');
const apiRegistroRoutes = require('./apiRegistro.routes');
const beneficioRoutes = require('./beneficio.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/eventos', eventosRoutes);
router.use('/pasajeros', pasajerosRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', adminUsuarioEmpresaRoutes);
router.use('/empresas', empresaRoutes);
router.use('/convenios', convenioRoutes);
router.use('/kpis', kpiRoutes);
router.use('/integraciones', araucanaRoutes);
router.use('/apis-consulta', apiConsultaRoutes);
router.use('/apis-registro', apiRegistroRoutes);
router.use('/beneficios', beneficioRoutes);
router.use('/adultos-mayores', adultosMayoresRoutes);
router.use('/pasajeros-frecuentes', pasajerosFrecuentesRoutes);
router.use('/integraciones/beneficiarios', integracionBeneficiariosRoutes);
router.use('/carabineros', carabinerosRoutes);
router.use('/fach', fachRoutes);
router.use('/roles', rolesRoutes);

module.exports = router;
