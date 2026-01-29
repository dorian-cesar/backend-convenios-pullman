module.exports = (sequelize, DataTypes) => {
    const UsuarioRoles = sequelize.define('UsuarioRoles', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rol_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'usuario_roles',
        timestamps: false
    });

    return UsuarioRoles;
};
