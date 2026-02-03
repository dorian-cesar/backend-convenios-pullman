const swaggerSpec = require('../src/docs/swagger');
const fs = require('fs');
const path = require('path');

try {
    const outputPath = path.resolve(__dirname, '../swagger.json');
    fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    console.log(`Swagger JSON generated at: ${outputPath}`);
} catch (error) {
    console.error('Error generating Swagger JSON:', error);
    process.exit(1);
}
