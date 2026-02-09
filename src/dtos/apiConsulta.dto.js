class ApiConsultaDTO {
    constructor(api) {
        this.id = api.id;
        this.nombre = api.nombre;
        this.endpoint = api.endpoint;
        this.empresa_id = api.empresa_id;
        this.status = api.status;
    }

    static list(apis) {
        return apis.map(api => new ApiConsultaDTO(api));
    }
}

module.exports = ApiConsultaDTO;
