const Joi = require('joi');
const { crearCompra } = require('./src/validations/evento.validation');

const payload = {
    pasajero_id: 1,
    empresa_id: 1,
    convenio_id: 1,
    ciudad_origen: "A",
    ciudad_destino: "B",
    fecha_viaje: { from: '2026-02-25' }, // Esto suele ser común en datepickers
    hora_salida: "23:30",
    tarifa_base: 100
};

const validate = (schema, object) => {
    const { value, error } = Joi.compile(schema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        return error.details.map((details) => ({
            campo: details.path.join('.'),
            mensaje: details.message
        }));
    }
    return value;
};

console.log(validate(crearCompra.body, payload));
