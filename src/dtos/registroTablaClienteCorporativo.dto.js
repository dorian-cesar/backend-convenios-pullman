class RegistroTablaClienteCorporativoDTO {
  constructor(r) {
    this.id = r.id;
    this.nombre_tabla = r.nombre_tabla;
    this.nombre_display = r.nombre_display;
    this.empresa_id = r.empresa_id;
    this.convenio_id = r.convenio_id;
    this.api_consulta_id = r.api_consulta_id;
    this.status = r.status;
    this.createdAt = r.createdAt;
    if (r.empresa) this.empresa = { id: r.empresa.id, nombre: r.empresa.nombre };
    if (r.convenio) this.convenio = { id: r.convenio.id, nombre: r.convenio.nombre };
    if (r.apiConsulta) this.api_consulta = { id: r.apiConsulta.id, endpoint: r.apiConsulta.endpoint };
  }
  static list(regs) { return regs.map(r => new RegistroTablaClienteCorporativoDTO(r)); }
}
module.exports = RegistroTablaClienteCorporativoDTO;
