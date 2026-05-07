const path = require('path');
const { Pasajero } = require(path.join(process.cwd(), 'src', 'models'));

async function main() {
  try {
    const id = 8875; // ID del pasajero creado en la prueba positiva
    const p = await Pasajero.findByPk(id);
    
    if (p) {
      console.log(`Borrando pasajero de prueba: ${p.rut} (ID: ${id})`);
      await p.destroy({ force: true });
      console.log('Pasajero borrado exitosamente.');
    } else {
      console.log('El pasajero no existe o ya fue borrado.');
    }
  } catch (error) {
    console.error('Error al borrar pasajero:', error);
  } finally {
    process.exit();
  }
}

main();
