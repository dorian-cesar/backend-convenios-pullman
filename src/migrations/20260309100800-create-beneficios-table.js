'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('beneficiarios', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            convenio_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'convenios',
                    key: 'id'
                }
            },
            empresa_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'empresas',
                    key: 'id'
                }
            },
            nombre: {
                type: Sequelize.STRING,
                allowNull: false
            },
            rut: {
                type: Sequelize.STRING,
                allowNull: false
            },
            telefono: {
                type: Sequelize.STRING,
                allowNull: false
            },
            correo: {
                type: Sequelize.STRING,
                allowNull: true
            },
            direccion: {
                type: Sequelize.STRING,
                allowNull: false
            },
            imagenes: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Objeto JSON con las imágenes dinámicas'
            },
            razon_rechazo: {
                type: Sequelize.STRING,
                allowNull: true
            },
            nombre_beneficio: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Nombre descriptivo del beneficio (ej: Estudiante Regular, Adulto Mayor, etc.)'
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: 'INACTIVO'
            },
            tipo_beneficio: {
                type: Sequelize.STRING,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });

        // Índices para beneficiarios
        await queryInterface.addIndex('beneficiarios', ['rut']);
        await queryInterface.addIndex('beneficiarios', ['convenio_id']);
        await queryInterface.addIndex('beneficiarios', ['createdAt']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('beneficiarios');
    }
};
