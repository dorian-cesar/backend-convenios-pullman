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
// Para ManyToMany, onDelete aplica a la tabla intermedia.
Usuario.belongsToMany(Rol, { through: UsuarioRoles, foreignKey: 'usuario_id', otherKey: 'rol_id', onDelete: 'NO ACTION' });
Rol.belongsToMany(Usuario, { through: UsuarioRoles, foreignKey: 'rol_id', otherKey: 'usuario_id', onDelete: 'NO ACTION' });

// EMPRESA -> USUARIO (1:N)
Empresa.hasMany(Usuario, { foreignKey: 'empresa_id', as: 'usuarios', onDelete: 'NO ACTION' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa', onDelete: 'NO ACTION' });

// EMPRESA -> CONVENIO (1:N)
Empresa.hasMany(Convenio, { foreignKey: 'empresa_id', as: 'convenios', onDelete: 'NO ACTION' });
Convenio.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa', onDelete: 'NO ACTION' });

// EMPRESA -> PASAJERO (1:N)
Empresa.hasMany(Pasajero, { foreignKey: 'empresa_id', as: 'pasajeros', onDelete: 'NO ACTION' });
Pasajero.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa', onDelete: 'NO ACTION' });

// TIPO_PASAJERO -> PASAJERO (1:N)
TipoPasajero.hasMany(Pasajero, { foreignKey: 'tipo_pasajero_id', as: 'pasajeros', onDelete: 'NO ACTION' });
Pasajero.belongsTo(TipoPasajero, { foreignKey: 'tipo_pasajero_id', as: 'tipoPasajero', onDelete: 'NO ACTION' });

// CONVENIO -> PASAJERO (1:N)
Convenio.hasMany(Pasajero, { foreignKey: 'convenio_id', as: 'pasajeros', onDelete: 'NO ACTION' });
Pasajero.belongsTo(Convenio, { foreignKey: 'convenio_id', as: 'convenio', onDelete: 'NO ACTION' });

// API_CONSULTA -> CONVENIO (1:N)
ApiConsulta.hasMany(Convenio, { foreignKey: 'api_consulta_id', as: 'convenios', onDelete: 'NO ACTION' });
Convenio.belongsTo(ApiConsulta, { foreignKey: 'api_consulta_id', as: 'apiConsulta', onDelete: 'NO ACTION' });

// EMPRESA -> API_CONSULTA (1:N)
Empresa.hasMany(ApiConsulta, { foreignKey: 'empresa_id', as: 'apisConsulta', onDelete: 'NO ACTION' });
ApiConsulta.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa', onDelete: 'NO ACTION' });



Pasajero.hasMany(Evento, { foreignKey: 'pasajero_id', onDelete: 'NO ACTION' });
Evento.belongsTo(Pasajero, { foreignKey: 'pasajero_id', onDelete: 'NO ACTION' });

Empresa.hasMany(Evento, { foreignKey: 'empresa_id', onDelete: 'NO ACTION' });
Evento.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'NO ACTION' });

Convenio.hasMany(Evento, { foreignKey: 'convenio_id', onDelete: 'NO ACTION' });
Evento.belongsTo(Convenio, { foreignKey: 'convenio_id', onDelete: 'NO ACTION' });

// Auto-referencia para trazabilidad de eventos
Evento.belongsTo(Evento, { as: 'EventoOrigen', foreignKey: 'evento_origen_id', onDelete: 'NO ACTION' });
Evento.hasMany(Evento, { as: 'EventosRelacionados', foreignKey: 'evento_origen_id', onDelete: 'NO ACTION' });


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
