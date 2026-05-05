const { Categoria, Convenio } = require('../models');
const NotFoundError = require('../exceptions/NotFoundError');
const BusinessError = require('../exceptions/BusinessError');

/**
 * Crear categoría
 */
exports.crearCategoria = async (req, res, next) => {
    try {
        const categoria = await Categoria.create(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        next(error);
    }
};

/**
 * Listar categorías
 */
exports.getCategorias = async (req, res, next) => {
    try {
        const { empresa_id } = req.query;
        const where = {};
        if (empresa_id) where.empresa_id = empresa_id;

        const categorias = await Categoria.findAll({
            where,
            include: [{ model: Convenio, as: 'convenios' }]
        });
        res.json(categorias);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener categoría por ID
 */
exports.getCategoria = async (req, res, next) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id, {
            include: [{ model: Convenio, as: 'convenios' }]
        });
        if (!categoria) {
            throw new NotFoundError('Categoría no encontrada');
        }
        res.json(categoria);
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar categoría
 */
exports.actualizarCategoria = async (req, res, next) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) {
            throw new NotFoundError('Categoría no encontrada');
        }
        await categoria.update(req.body);
        res.json(categoria);
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar categoría
 */
exports.eliminarCategoria = async (req, res, next) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) {
            throw new NotFoundError('Categoría no encontrada');
        }
        
        // Verificar si tiene convenios asociados
        const conveniosCount = await Convenio.count({ where: { categoria_id: categoria.id } });
        if (conveniosCount > 0) {
            throw new BusinessError('No se puede eliminar una categoría con convenios asociados');
        }
        
        await categoria.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
