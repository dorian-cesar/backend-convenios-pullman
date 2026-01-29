/**
 * Genera offset y limit para Sequelize
 * @param {number} page - Página actual (1-indexed)
 * @param {number} limit - Cantidad de elementos por página
 * @returns {object} { offset, limit }
 */
const getPagination = (page, limit) => {
    if (page === undefined && limit === undefined) {
        return { offset: undefined, limit: undefined };
    }
    const p = page ? +page : 1;
    const l = limit ? +limit : 10;
    const offset = (p - 1) * l;

    return { offset, limit: l };
};

/**
 * Formatea la respuesta paginada
 * @param {object} data - Resultado de findAndCountAll { count, rows }
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @returns {object} Objeto con rows y metadata de paginación
 */
const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows } = data;

    if (page === undefined && limit === undefined) {
        return { totalItems, rows };
    }

    const currentPage = page ? +page : 1;
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    return { totalItems, rows, totalPages, currentPage };
};

module.exports = {
    getPagination,
    getPagingData
};
