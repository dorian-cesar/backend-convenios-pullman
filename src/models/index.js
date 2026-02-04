const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');

// Importar modelos existentes
const Usuario = require('./usuario.model')(sequelize, Sequelize.DataTypes);
const Rol = require('./rol.model')(sequelize, Sequelize.DataTypes);
const Empresa = require('./empresa.model')(sequelize, Sequelize.DataTypes);
const Convenio = require('./convenio.model')(sequelize, Sequelize.DataTypes);
const CodigoDescuento = require('./codigoDescuento.model')(sequelize, Sequelize.DataTypes);
const TipoPasajero = require('./tipoPasajero.model')(sequelize, Sequelize.DataTypes); // Nuevo
const Pasajero = require('./pasajero.model')(sequelize, Sequelize.DataTypes);     // Nuevo/Fixed
const Descuento = require('./descuento.model')(sequelize, Sequelize.DataTypes);
const Evento = require('./evento.model')(sequelize, Sequelize.DataTypes);
const UsuarioRoles = require('./usuarioRoles.model')(sequelize, Sequelize.DataTypes);
const ApiConsulta = require('./apiConsulta.model')(sequelize, Sequelize.DataTypes); // Nuevo // Nuevo

/**
 * -----------------------------------------
 * RELACIONES
 * -----------------------------------------
 */

// USUARIO - ROL (Muchos a Muchos a través de USUARIO_ROLES o Directa según contexto actual?)
// Contexto dice: USUARIO_ROLES tabla intermedia.
// Pero también Usuario tiene rol_id directo en la definición de campos?
// Contexto fields Usuario: { name = "empresa_id", ... }, NO TIENE rol_id explícito en fields, tiene USUARIO_ROLES.
// REVISAR: El contexto define USUARIO_ROLES, y Usuario NO tiene rol_id en fields.
// Sin embargo, el código actual de usuario.model.js TIENE rol_id.
// Debemos seguir el CONTEXTO. Usuario no debería tener rol_id si existe tabla intermedia.
// Voy a asumir la corrección completa hacia el contexto.

// RELACION M:N Usuario <-> Rol
Usuario.belongsToMany(Rol, { through: UsuarioRoles, foreignKey: 'usuario_id', otherKey: 'rol_id' });
Rol.belongsToMany(Usuario, { through: UsuarioRoles, foreignKey: 'rol_id', otherKey: 'usuario_id' });

// EMPRESA -> USUARIO (1:N)
Empresa.hasMany(Usuario, { foreignKey: 'empresa_id', as: 'usuarios' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// EMPRESA -> CONVENIO (1:N)
Empresa.hasMany(Convenio, { foreignKey: 'empresa_id', as: 'convenios' });
Convenio.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// CONVENIO -> CODIGOS_DESCUENTO (1:N)
Convenio.hasMany(CodigoDescuento, { foreignKey: 'convenio_id', as: 'codigos' });
CodigoDescuento.belongsTo(Convenio, { foreignKey: 'convenio_id', as: 'convenio' });

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

// RELACIONES DE EVENTOS (Registro de viajes)
Usuario.hasMany(Evento, { foreignKey: 'usuario_id' });
Evento.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Pasajero.hasMany(Evento, { foreignKey: 'pasajero_id' });
Evento.belongsTo(Pasajero, { foreignKey: 'pasajero_id' });

Empresa.hasMany(Evento, { foreignKey: 'empresa_id' });
Evento.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Convenio.hasMany(Evento, { foreignKey: 'convenio_id' });
Evento.belongsTo(Convenio, { foreignKey: 'convenio_id' });

CodigoDescuento.hasMany(Evento, { foreignKey: 'codigo_descuento_id' });
Evento.belongsTo(CodigoDescuento, { foreignKey: 'codigo_descuento_id' });

// Auto-referencia para trazabilidad de eventos
Evento.belongsTo(Evento, { as: 'EventoOrigen', foreignKey: 'evento_origen_id' });
Evento.hasMany(Evento, { as: 'EventosRelacionados', foreignKey: 'evento_origen_id' });


// RELACIONES DE DESCUENTOS
Convenio.hasOne(Descuento, { foreignKey: 'convenio_id', as: 'descuento' });
Descuento.belongsTo(Convenio, { foreignKey: 'convenio_id', as: 'convenio' });

CodigoDescuento.hasMany(Descuento, { foreignKey: 'codigo_descuento_id', as: 'descuentos' });
Descuento.belongsTo(CodigoDescuento, { foreignKey: 'codigo_descuento_id' });

TipoPasajero.hasMany(Descuento, { foreignKey: 'tipo_pasajero_id' });
Descuento.belongsTo(TipoPasajero, { foreignKey: 'tipo_pasajero_id' });

Pasajero.hasMany(Descuento, { foreignKey: 'pasajero_id' });
Descuento.belongsTo(Pasajero, { foreignKey: 'pasajero_id' });


module.exports = {
  sequelize,
  Usuario,
  Rol,
  Empresa,
  Convenio,
  CodigoDescuento,
  TipoPasajero,
  Pasajero,
  Descuento,
  Evento,
  UsuarioRoles,
  ApiConsulta
};
