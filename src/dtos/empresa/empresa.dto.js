/**
 * Empresa DTO / serializer
 * - `toResponse`: normalize model instance into API response
 * - `fromRequest`: lightweight validation and mapping for incoming payloads
 */
const toResponse = (empresa) => {
  if (!empresa) return null;
  
  
  const obj = empresa.toJSON ? empresa.toJSON() : empresa;
  return {
    id: obj.id,
    nombre: obj.nombre,
    rut: obj.rut,
    status: obj.status || 'ACTIVO',
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined
  };
};

const fromRequest = (body = {}) => {
  const { nombre, rut } = body;
  const errors = [];
  if (!nombre || String(nombre).trim() === '') errors.push('nombre is required');
  if (!rut || String(rut).trim() === '') errors.push('rut is required');
  if (errors.length) {
    const err = new Error('Invalid payload');
    err.details = errors;
    throw err;
  }
  return { nombre: String(nombre).trim(), rut: String(rut).trim() };
};

module.exports = {
  toResponse,
  fromRequest
};
