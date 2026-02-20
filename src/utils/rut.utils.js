/**
 * Format a RUT to XXXXXXXX-X
 * Removes non-alphanumeric characters, separates the last digit/letter as DV,
 * and joins with a hyphen. Converts K to uppercase.
 * @param {string} rut
 * @returns {string} Formatted RUT or original if invalid length
 */
const formatRut = (rut) => {
    if (!rut) return rut;

    // 1. Remove everything that is not a number or k/K/x/X
    const cleanRut = rut.replace(/[^0-9kKxX]/g, '');

    // 2. Check length (min 2 chars for body+dv)
    if (cleanRut.length < 2) return rut;

    // 3. Split body and dv
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // 4. Return formatted
    return `${body}-${dv}`;
};

/**
 * Validate a Chilean RUT
 * @param {string} rut
 * @returns {boolean} True if RUT is valid, false otherwise
 */
const validateRut = (rut) => {
    if (typeof rut !== 'string' || !rut) return false;

    // Remove dots and hyphens, convert to uppercase
    const cleanRut = rut.replace(/[.\-]/g, '').toUpperCase();

    if (cleanRut.length < 2) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Verify body is only numbers
    if (!/^[0-9]+$/.test(body)) return false;

    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

    return calculatedDv === dv;
};

module.exports = {
    formatRut,
    validateRut
};
