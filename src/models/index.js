const sequelize = require('../config/sequelize');

const Usuario = require('./usuario.model');
const Rol = require('./rol.model');
const Pasajero = require('./pasajero.model');
const Empresa = require('./empresa.model');
const Convenio = require('./convenio.model');
const CodigoDescuento = require('./codigoDescuento.model');
const Descuento = require('./descuento.model');
const Evento = require('./evento.model');

/* RELACIONES */

// Usuario - Rol
Usuario.belongsToMany(Rol, { through: 'usuario_roles' });
Rol.belongsToMany(Usuario, { through: 'usuario_roles' });

// Empresa - Convenio
Empresa.hasMany(Convenio);
Convenio.belongsTo(Empresa);

// Convenio - Descuento
Convenio.hasMany(Descuento);
Descuento.belongsTo(Convenio);

// Convenio - Código
Convenio.hasMany(CodigoDescuento);
CodigoDescuento.belongsTo(Convenio);

// Empresa - Pasajero
Empresa.hasMany(Pasajero);
Pasajero.belongsTo(Empresa);

// Pasajero - Evento
Pasajero.hasMany(Evento);
Evento.belongsTo(Pasajero);

module.exports = {
  sequelize,
  Usuario,
  Rol,
  Pasajero,
  Empresa,
  Convenio,
  CodigoDescuento,
  Descuento,
  Evento
};
