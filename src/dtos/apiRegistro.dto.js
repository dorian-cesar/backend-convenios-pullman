class ApiRegistroDTO {
    constructor(api) {
        this.id = api.id;
        this.nombre = api.nombre;
        this.endpoint = api.endpoint;
        this.empresa_id = api.empresa_id;
        this.status = api.status;
        this.createdAt = api.createdAt;
        this.updatedAt = api.updatedAt;
    }

    static list(apis) {
        return apis.map(api => new ApiRegistroDTO(api));
    }
}

module.exports = ApiRegistroDTO;
