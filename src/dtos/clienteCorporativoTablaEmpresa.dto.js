class ClienteCorporativoTablaEmpresaDTO {
  constructor(a) {
    this.id = a.id;
    this.rut = a.rut;
    this.nombre_completo = a.nombre_completo;
    this.status = a.status;
    this.empresa_id = a.empresa_id;
    this.convenio_id = a.convenio_id;
    this.createdAt = a.createdAt;
  }
  static list(as) { return as.map(a => new ClienteCorporativoTablaEmpresaDTO(a)); }
}
module.exports = ClienteCorporativoTablaEmpresaDTO;
