const s = require('../services/registroTablaClienteCorporativo.service');
const DTO = require('../dtos/registroTablaClienteCorporativo.dto');

exports.crear = async (req, res, next) => {
  try {
    const r = await s.crearTablaClienteCorporativo(req.body);
    res.status(201).json(new DTO(r));
  } catch (e) { next(e); }
};

exports.listar = async (req, res, next) => {
  try {
    const d = await s.listar(req.query);
    res.json({ ...d, rows: DTO.list(d.rows) });
  } catch (e) { next(e); }
};

exports.obtener = async (req, res, next) => {
  try {
    const r = await s.obtenerPorId(req.params.id);
    res.json(new DTO(r));
  } catch (e) { next(e); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const r = await s.actualizar(req.params.id, req.body);
    res.json(new DTO(r));
  } catch (e) { next(e); }
};

exports.eliminar = async (req, res, next) => {
  try {
    await s.eliminar(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
};
