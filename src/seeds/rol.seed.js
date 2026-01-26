const { Rol } = require('../models');

async function seedRoles() {
  await Rol.findOrCreate({
    where: { nombre: 'SUPER_USUARIO' }
  });

  await Rol.findOrCreate({
    where: { nombre: 'USUARIO' }
  });

  console.log('✅ Roles seed creados');
}

module.exports = seedRoles;
