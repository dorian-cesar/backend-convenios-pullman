// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/sequelize');

// const Pasajero = sequelize.define('Pasajero', {
//   rut: {
//     type: DataTypes.STRING,
//     unique: true
//   },
//   nombres: DataTypes.STRING,
//   apellidos: DataTypes.STRING,
//   correo: DataTypes.STRING,
//   telefono: DataTypes.STRING,

  
//   anio_nacimiento: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },

  
//   es_estudiante: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },


//   carnet_estudiante_url: {
//     type: DataTypes.STRING,
//     allowNull: true
//   },

//   tipo_usuario: {
//     type: DataTypes.ENUM('ESTUDIANTE', 'ADULTO_MAYOR', 'GENERAL'),
//     allowNull: false
//   },

//   status: {
//     type: DataTypes.ENUM('ACTIVE', 'BLOCKED'),
//     defaultValue: 'ACTIVE'
//   }
// }, {
//   tableName: 'pasajeros',
//   underscored: true
// });

// module.exports = Pasajero;
