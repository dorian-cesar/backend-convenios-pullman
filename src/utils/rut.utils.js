/**
 * Format a RUT to XXXXXXXX-X
 * Removes non-alphanumeric characters, separates the last digit/letter as DV,
 * and joins with a hyphen. Converts K to uppercase.
 * @param {string} rut
 * @returns {string} Formatted RUT or original if invalid length
 */
const formatRut = (rut) => {
    if (!rut) return rut;

    // 1. Remove everything that is not a number or k/K
    const cleanRut = rut.replace(/[^0-9kK]/g, '');

    // 2. Check length (min 2 chars for body+dv)
    if (cleanRut.length < 2) return rut;

    // 3. Split body and dv
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // 4. Return formatted
    return `${body}-${dv}`;
};

module.exports = {
    formatRut
};
