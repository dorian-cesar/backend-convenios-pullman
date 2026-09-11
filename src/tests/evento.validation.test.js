const { crearCompra, crearDevolucion } = require('../validations/evento.validation');

describe('Evento Validation Schemas', () => {
    describe('crearCompra schema', () => {
        it('debería aceptar un payload válido completo con origen_compra', () => {
            const payload = {
                usuario_id: 1,
                pasajero_id: 1,
                empresa_id: 1,
                convenio_id: 1,
                ciudad_origen: 'Santiago',
                ciudad_destino: 'Valparaíso',
                fecha_viaje: '2026-02-15',
                numero_asiento: 'A1',
                pnr: 'TS12345678',
                terminal_origen: 'Terminal Sur',
                terminal_destino: 'Terminal Valpo',
                tarifa_base: 10000,
                monto_pagado: 8000,
                porcentaje_descuento_aplicado: 20.0,
                codigo_autorizacion: 'AUTH123',
                token: 'TOKEN123',
                estado: 'Confirmado',
                tipo_pago: 'Webpay',
                confirmed_pnrs: ['TS12345678'],
                respuesta_kupos: { ticket: '123' },
                fecha_compra: '2026-02-14',
                origen_compra: 'B2B_WEB'
            };

            const { error } = crearCompra.body.validate(payload);
            expect(error).toBeUndefined();
        });

        it('debería rechazar un payload con un campo desconocido si no se permite', () => {
            const payload = {
                tarifa_base: 10000,
                campo_invalido_que_no_existe: 'esto_deberia_fallar'
            };

            const { error } = crearCompra.body.validate(payload);
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('"campo_invalido_que_no_existe" is not allowed');
        });

        it('debería fallar si falta un campo requerido como tarifa_base', () => {
            const payload = {
                ciudad_origen: 'Santiago',
                ciudad_destino: 'Valparaíso'
            };

            const { error } = crearCompra.body.validate(payload);
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('"tarifa_base" is required');
        });
    });
});
