const path = require('path');
const modelsPath = path.join(process.cwd(), 'src', 'models');
const { Convenio, Empresa } = require(modelsPath);

async function main() {
  try {
    const convenios = await Convenio.findAll({
      where: {
        nombre: { [require('sequelize').Op.like]: '%Compromiso%' }
      },
      include: [{ model: Empresa, as: 'empresa' }]
    });

    console.log(`FOUND_CONVENIOS_START`);
    console.log(`Count: ${convenios.length}`);
    convenios.forEach(c => {
      console.log(`ID: ${c.id}`);
      console.log(`Nombre: ${c.nombre}`);
      console.log(`Empresa: ${c.empresa ? c.empresa.nombre : 'N/A'}`);
      console.log(`Tipo: ${c.tipo}`);
      console.log(`API Consulta ID: ${c.api_consulta_id}`);
      console.log(`Status: ${c.status}`);
      console.log('---');
    });
    console.log(`FOUND_CONVENIOS_END`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
