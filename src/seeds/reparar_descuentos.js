const { Descuento } = require('../models');

const rawDiscounts = [
    {
        "id": 1,
        "convenio_id": 1,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 50,
        "status": "INACTIVO"
    },
    {
        "id": 4,
        "convenio_id": 38,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 25,
        "status": "ACTIVO"
    },
    {
        "id": 7,
        "convenio_id": 43,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 10,
        "status": "INACTIVO"
    },
    {
        "id": 15,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 15,
        "status": "ACTIVO"
    },
    {
        "id": 16,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 50,
        "status": "ACTIVO"
    },
    {
        "id": 17,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 90,
        "status": "ACTIVO"
    },
    {
        "id": 18,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 25,
        "status": "ACTIVO"
    },
    {
        "id": 20,
        "convenio_id": 55,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 50,
        "status": "INACTIVO"
    },
    {
        "id": 21,
        "convenio_id": 56,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 90,
        "status": "INACTIVO"
    },
    {
        "id": 22,
        "convenio_id": 57,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 25,
        "status": "INACTIVO"
    },
    {
        "id": 30,
        "convenio_id": 54,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 5,
        "status": "INACTIVO"
    },
    {
        "id": 35,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 10,
        "status": "ACTIVO"
    },
    {
        "id": 36,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 20,
        "status": "ACTIVO"
    },
    {
        "id": 37,
        "convenio_id": 64,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 10,
        "status": "ACTIVO"
    },
    {
        "id": 38,
        "convenio_id": 65,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 20,
        "status": "ACTIVO"
    },
    {
        "id": 39,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 10,
        "status": "ACTIVO"
    },
    {
        "id": 40,
        "convenio_id": null,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 20,
        "status": "ACTIVO"
    },
    {
        "id": 41,
        "convenio_id": 68,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 10,
        "status": "ACTIVO"
    },
    {
        "id": 42,
        "convenio_id": 69,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 20,
        "status": "ACTIVO"
    },
    {
        "id": 43,
        "convenio_id": 70,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 50,
        "status": "ACTIVO"
    },
    {
        "id": 44,
        "convenio_id": 73,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 15,
        "status": "ACTIVO"
    },
    {
        "id": 45,
        "convenio_id": 79,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 15,
        "status": "INACTIVO"
    },
    {
        "id": 46,
        "convenio_id": 80,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 20,
        "status": "INACTIVO"
    },
    {
        "id": 48,
        "convenio_id": 44,
        "codigo_descuento_id": 12,
        "porcentaje_descuento": 45,
        "status": "ACTIVO",
        "codigo_descuento": {
            "id": 12,
            "codigo": "TEST123456"
        }
    },
    {
        "id": 50,
        "convenio_id": 83,
        "codigo_descuento_id": 13,
        "porcentaje_descuento": 14,
        "status": "ACTIVO",
        "codigo_descuento": {
            "id": 13,
            "codigo": "TESTCODIGO"
        }
    },
    {
        "id": 51,
        "convenio_id": 89,
        "codigo_descuento_id": 14,
        "porcentaje_descuento": 10,
        "status": "ACTIVO",
        "codigo_descuento": {
            "id": 14,
            "codigo": "TEST2CODIGO"
        }
    },
    {
        "id": 52,
        "convenio_id": 1,
        "codigo_descuento_id": null,
        "porcentaje_descuento": 25,
        "status": "ACTIVO"
    }
];

async function repararDescuentos() {
    console.log('🔄 Iniciando reparación de semillas de descuentos...');
    try {
        let processed = 0;
        let skipped = 0;

        for (const raw of rawDiscounts) {
            // Clean data
            const data = {
                id: raw.id,
                convenio_id: raw.convenio_id,
                porcentaje_descuento: raw.porcentaje_descuento,
                status: raw.status,
                codigo_descuento_id: null, // Force clear this field
                // Explicitly remove codigo_descuento fields by not including them
                // and ensuring we don't try to save them
            };

            // VALIDATION: convenio_id must be present
            if (!data.convenio_id) {
                console.warn(`⚠️ Saltando Descuento ID ${data.id}: convenio_id es null (ahora es obligatorio).`);
                skipped++;
                // Optional: Delete from DB if it exists as it's invalid
                // await Descuento.destroy({ where: { id: data.id } });
                continue;
            }

            // Upsert (Create or Update)
            await Descuento.upsert(data);
            processed++;
        }

        console.log(`✅ Reparación completada. Procesados: ${processed}, Saltados (inválidos): ${skipped}`);

    } catch (error) {
        console.error('❌ Error reparando descuentos:', error);
    }
}

// Execute if run directly
if (require.main === module) {
    repararDescuentos().then(() => process.exit());
}

module.exports = repararDescuentos;
