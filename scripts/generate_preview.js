const fs = require('fs');
const { Beneficiario } = require('../src/models');

async function generatePreview() {
    try {
        const beneficiaries = await Beneficiario.findAll({
            where: { rut: ['12345678-5', '87654321-0', '11222333-4'] }
        });

        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vista Previa de Beneficiarios</title>
            <style>
                body { font-family: sans-serif; background: #f0f2f5; padding: 20px; }
                .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .img-container { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px; }
                .img-box { text-align: center; }
                img { max-width: 300px; border: 1px solid #ddd; border-radius: 4px; }
                h2 { color: #1a73e8; margin-top: 0; }
                p { color: #5f6368; }
            </style>
        </head>
        <body>
            <h1>Galería de Beneficiarios de Prueba</h1>
        `;

        beneficiaries.forEach(b => {
            html += `
            <div class="card">
                <h2>${b.nombre}</h2>
                <p><strong>RUT:</strong> ${b.rut} | <strong>Convenio ID:</strong> ${b.convenio_id}</p>
                <div class="img-container">
            `;
            if (b.imagenes) {
                Object.entries(b.imagenes).forEach(([label, base64]) => {
                    html += `
                    <div class="img-box">
                        <p>${label}</p>
                        <img src="${base64}" alt="${label}">
                    </div>
                    `;
                });
            }
            html += `</div></div>`;
        });

        html += `</body></html>`;
        fs.writeFileSync('preview_beneficiarios.html', html);
        console.log('--- Archivo preview_beneficiarios.html generado ---');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

generatePreview();
