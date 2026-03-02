const Joi = require('joi');
const { crearCompra } = require('./src/validations/evento.validation');

const payload = {
    pasajero_id: 1,
    empresa_id: 1,
    convenio_id: 1,
    ciudad_origen: "A",
    ciudad_destino: "B",
    fecha_viaje: ["2026-02-25"],
    hora_salida: "23:30",
    tarifa_base: 100
};

const { error } = crearCompra.body.validate(payload);
console.log(error ? error.details : "Success");
