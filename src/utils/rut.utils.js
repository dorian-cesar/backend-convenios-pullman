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

    // 1. Clean the RUT (remove dots and hyphen if any)
    const clean = rut.replace(/[^0-9kKxX]/g, '').toUpperCase();

    // 2. Minimum length check (at least 2 chars: 1 body + 1 dv)
    if (clean.length < 2) return false;

    // 3. Split body and dv
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    // 4. Calculate expected DV
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDvNum = 11 - (sum % 11);
    let expectedDv = '';
    if (expectedDvNum === 11) expectedDv = '0';
    else if (expectedDvNum === 10) expectedDv = 'K';
    else expectedDv = expectedDvNum.toString();

    // 5. Compare
    return dv === expectedDv;
};

/**
 * Clean a RUT (removes dots and hyphens)
 * @param {string} rut
 * @returns {string}
 */
const cleanRut = (rut) => {
    if (!rut) return rut;
    return rut.replace(/[^0-9kKxX]/g, '').toUpperCase();
};

module.exports = {
    formatRut,
    validateRut,
    cleanRut
};
