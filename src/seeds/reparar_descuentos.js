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
    console.log('🔄 Iniciando reparación y deduplicación de descuentos...');
    try {
        let processed = 0;
        let skipped = 0;
        let deleted = 0;

        // 1. Group raw discounts by convenio_id to pick the best one
        const discountsByConvenio = {};
        for (const raw of rawDiscounts) {
            if (!raw.convenio_id) continue;

            if (!discountsByConvenio[raw.convenio_id]) {
                discountsByConvenio[raw.convenio_id] = [];
            }
            discountsByConvenio[raw.convenio_id].push(raw);
        }

        // 2. Process each convenio
        for (const convenioId in discountsByConvenio) {
            const candidates = discountsByConvenio[convenioId];

            // Pick the best one: Prefer 'ACTIVO', then highest ID
            candidates.sort((a, b) => {
                if (a.status === 'ACTIVO' && b.status !== 'ACTIVO') return -1;
                if (a.status !== 'ACTIVO' && b.status === 'ACTIVO') return 1;
                return b.id - a.id; // Highest ID first
            });

            const winner = candidates[0];
            const toKeepId = winner.id;

            // 3. Upsert the winner
            const data = {
                id: winner.id,
                convenio_id: winner.convenio_id,
                porcentaje_descuento: winner.porcentaje_descuento,
                status: winner.status,
                codigo_descuento_id: null
            };
            await Descuento.upsert(data);
            processed++;

            // 4. Delete others for this convenio from DB (Legacy duplicates)
            // Get ALL discounts for this convenio from DB
            const existingDiscounts = await Descuento.findAll({
                where: { convenio_id: convenioId }
            });

            for (const existing of existingDiscounts) {
                if (existing.id !== toKeepId) {
                    console.warn(`🗑️ Eliminando descuento duplicado/obsoleto ID ${existing.id} para Convenio ${convenioId}. (Mantenemos ID ${toKeepId})`);
                    await existing.destroy();
                    deleted++;
                }
            }
        }

        console.log(`✅ Reparación completada.`);
        console.log(`   - Descuentos únicos procesados/guardados: ${processed}`);
        console.log(`   - Descuentos duplicados eliminados de BD: ${deleted}`);

    } catch (error) {
        console.error('❌ Error reparando descuentos:', error);
    }
}

// Execute if run directly
if (require.main === module) {
    repararDescuentos().then(() => process.exit());
}

module.exports = repararDescuentos;
