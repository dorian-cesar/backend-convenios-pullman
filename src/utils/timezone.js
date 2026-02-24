/**
 * Utilidad para manejar dinámicamente el Timezone de Chile.
 * Las bases de datos a veces no tienen las tablas de timezone con nombres actualizadas.
 * Esta función calcula el offset ('-03:00' o '-04:00') para la zona horaria 'America/Santiago'
 * dependiendo del momento del año, considerando horarios de verano/invierno.
 */
function getChileOffset() {
    // Forzamos el uso de la zona horaria de Santiago para obtener sus partes de fecha
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Santiago',
        timeZoneName: 'longOffset' // Devuelve el offset en formato GMT-03:00 o GMT-04:00
    });

    const parts = formatter.formatToParts(new Date());
    const offsetPart = parts.find(p => p.type === 'timeZoneName');

    if (!offsetPart || !offsetPart.value) {
        // Fallback seguro en caso de que Intl no esté bien soportado (muy raro en Node reciente)
        return '-03:00';
    }

    // El resultado de offsetPart.value suele ser 'GMT-03:00' o 'GMT-04:00'
    let offset = offsetPart.value.replace('GMT', ''); // '-03:00' o '-04:00'

    // Algunas implementaciones de Intl devuelven GMT si el offset es 0 (ej UTC), 
    // pero para Chile siempre será negativo, así que reemplazar GMT está bien.
    if (!offset) {
        offset = '-03:00';
    }

    return offset;
}

module.exports = {
    getChileOffset
};
