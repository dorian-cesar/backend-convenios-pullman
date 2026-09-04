const { Configuracion } = require('../models');

exports.obtenerParametros = async (req, res, next) => {
    try {
        const parametros = await Configuracion.findAll({
            where: {
                clave: ['HERO_LISTA_A_COUNT', 'HERO_LISTA_B_COUNT']
            }
        });

        // Valores por defecto
        const defaultValues = {
            HERO_LISTA_A_COUNT: '4',
            HERO_LISTA_B_COUNT: '4'
        };

        const result = { ...defaultValues };
        parametros.forEach(p => {
            result[p.clave] = p.valor;
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.actualizarParametros = async (req, res, next) => {
    try {
        const { countA, countB } = req.body;

        if (countA !== undefined) {
            let confA = await Configuracion.findOne({ where: { clave: 'HERO_LISTA_A_COUNT' } });
            if (confA) {
                confA.valor = String(countA);
                confA.updated_by = req.user ? req.user.id : null;
                await confA.save();
            } else {
                await Configuracion.create({ clave: 'HERO_LISTA_A_COUNT', valor: String(countA), created_by: req.user ? req.user.id : null });
            }
        }

        if (countB !== undefined) {
            let confB = await Configuracion.findOne({ where: { clave: 'HERO_LISTA_B_COUNT' } });
            if (confB) {
                confB.valor = String(countB);
                confB.updated_by = req.user ? req.user.id : null;
                await confB.save();
            } else {
                await Configuracion.create({ clave: 'HERO_LISTA_B_COUNT', valor: String(countB), created_by: req.user ? req.user.id : null });
            }
        }

        res.json({ message: 'Parámetros actualizados correctamente' });
    } catch (error) {
        next(error);
    }
};
