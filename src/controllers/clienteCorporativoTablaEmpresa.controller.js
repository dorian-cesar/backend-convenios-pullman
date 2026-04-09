const s = require('../services/clienteCorporativoTablaEmpresa.service');
const DTO = require('../dtos/clienteCorporativoTablaEmpresa.dto');

exports.validar = async (req, res, next) => {
  try {
    const r = await s.validarRut(req.params.nombreTabla, req.body.rut);
    res.json(r);
  } catch (e) { next(e); }
};

exports.listar = async (req, res, next) => {
  try {
    const d = await s.listar(req.params.nombreTabla, req.query);
    res.json({ ...d, rows: DTO.list(d.rows) });
  } catch (e) { next(e); }
};

exports.crear = async (req, res, next) => {
  try {
    const a = await s.crear(req.params.nombreTabla, req.body);
    res.status(201).json(new DTO(a));
  } catch (e) { next(e); }
};

exports.obtener = async (req, res, next) => {
  try {
    const a = await s.obtenerPorRut(req.params.nombreTabla, req.params.rut);
    res.json(new DTO(a));
  } catch (e) { next(e); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const a = await s.actualizar(req.params.nombreTabla, req.params.rut, req.body);
    res.json(new DTO(a));
  } catch (e) { next(e); }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    const a = await s.cambiarEstado(req.params.nombreTabla, req.params.rut);
    res.json(new DTO(a));
  } catch (e) { next(e); }
};

exports.eliminar = async (req, res, next) => {
  try {
    await s.eliminar(req.params.nombreTabla, req.params.rut);
    res.status(204).send();
  } catch (e) { next(e); }
};

exports.cargarCsv = async (req, res, next) => {
  try {
    const r = await s.cargarCsv(req.params.nombreTabla, req.body.filas);
    res.json(r);
  } catch (e) { next(e); }
};
