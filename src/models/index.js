const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');

// Importar modelos existentes
const Usuario = require('./usuario.model')(sequelize, Sequelize.DataTypes);
const Rol = require('./rol.model')(sequelize, Sequelize.DataTypes);
const Empresa = require('./empresa.model')(sequelize, Sequelize.DataTypes);
const Convenio = require('./convenio.model')(sequelize, Sequelize.DataTypes);
const TipoPasajero = require('./tipoPasajero.model')(sequelize, Sequelize.DataTypes);
const Pasajero = require('./pasajero.model')(sequelize, Sequelize.DataTypes);
const Evento = require('./evento.model')(sequelize, Sequelize.DataTypes);
const UsuarioRoles = require('./usuarioRoles.model')(sequelize, Sequelize.DataTypes);
const ApiConsulta = require('./apiConsulta.model')(sequelize, Sequelize.DataTypes);
const ApiKey = require('./apiKey.model')(sequelize, Sequelize.DataTypes);
const Estudiante = require('./estudiante.model')(sequelize, Sequelize.DataTypes);
const AdultoMayor = require('./adultoMayor.model')(sequelize, Sequelize.DataTypes);
const PasajeroFrecuente = require('./pasajeroFrecuente.model')(sequelize, Sequelize.DataTypes);
const Carabinero = require('./carabinero.model')(sequelize, Sequelize.DataTypes);

/**
 * -----------------------------------------
 * RELACIONES
 * -----------------------------------------
 */

// USUARIO - ROL
Usuario.belongsToMany(Rol, { through: UsuarioRoles, foreignKey: 'usuario_id', otherKey: 'rol_id' });
Rol.belongsToMany(Usuario, { through: UsuarioRoles, foreignKey: 'rol_id', otherKey: 'usuario_id' });

// EMPRESA -> USUARIO (1:N)
Empresa.hasMany(Usuario, { foreignKey: 'empresa_id', as: 'usuarios' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// EMPRESA -> CONVENIO (1:N)
Empresa.hasMany(Convenio, { foreignKey: 'empresa_id', as: 'convenios' });
Convenio.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// EMPRESA -> PASAJERO (1:N)
Empresa.hasMany(Pasajero, { foreignKey: 'empresa_id', as: 'pasajeros' });
Pasajero.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// TIPO_PASAJERO -> PASAJERO (1:N)
TipoPasajero.hasMany(Pasajero, { foreignKey: 'tipo_pasajero_id', as: 'pasajeros' });
Pasajero.belongsTo(TipoPasajero, { foreignKey: 'tipo_pasajero_id', as: 'tipoPasajero' });

// CONVENIO -> PASAJERO (1:N)
Convenio.hasMany(Pasajero, { foreignKey: 'convenio_id', as: 'pasajeros' });
Pasajero.belongsTo(Convenio, { foreignKey: 'convenio_id', as: 'convenio' });

// API_CONSULTA -> CONVENIO (1:N)
ApiConsulta.hasMany(Convenio, { foreignKey: 'api_consulta_id', as: 'convenios' });
Convenio.belongsTo(ApiConsulta, { foreignKey: 'api_consulta_id', as: 'apiConsulta' });

// EMPRESA -> API_CONSULTA (1:N)
Empresa.hasMany(ApiConsulta, { foreignKey: 'empresa_id', as: 'apisConsulta' });
ApiConsulta.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// RELACIONES DE EVENTOS (Registro de viajes)
Usuario.hasMany(Evento, { foreignKey: 'usuario_id' });
Evento.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Pasajero.hasMany(Evento, { foreignKey: 'pasajero_id' });
Evento.belongsTo(Pasajero, { foreignKey: 'pasajero_id' });

Empresa.hasMany(Evento, { foreignKey: 'empresa_id' });
Evento.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Convenio.hasMany(Evento, { foreignKey: 'convenio_id' });
Evento.belongsTo(Convenio, { foreignKey: 'convenio_id' });

// Auto-referencia para trazabilidad de eventos
Evento.belongsTo(Evento, { as: 'EventoOrigen', foreignKey: 'evento_origen_id' });
Evento.hasMany(Evento, { as: 'EventosRelacionados', foreignKey: 'evento_origen_id' });


module.exports = {
  sequelize,
  Usuario,
  Rol,
  Empresa,
  Convenio,
  TipoPasajero,
  Pasajero,
  Evento,
  UsuarioRoles,
  ApiConsulta,
  ApiKey,
  Estudiante,
  AdultoMayor,
  PasajeroFrecuente,
  Carabinero
};
