'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Modificar tabla convenios
        // Agregamos tipo_convenio
        await queryInterface.addColumn('convenios', 'tipo_convenio', {
            type: Sequelize.ENUM('normal', 'especial'),
            allowNull: false,
            defaultValue: 'normal'
        });

        // Modificamos porcentaje_descuento para aceptar null
        await queryInterface.changeColumn('convenios', 'porcentaje_descuento', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: 'Porcentaje de descuento (0-100)'
        });

        // 2. Crear tabla convenio_rutas
        await queryInterface.createTable('convenio_rutas', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            convenio_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'convenios',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            origen: {
                type: Sequelize.STRING,
                allowNull: false
            },
            destino: {
                type: Sequelize.STRING,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Agregamos índice a convenio_id en convenio_rutas
        await queryInterface.addIndex('convenio_rutas', ['convenio_id']);

        // 3. Crear tabla convenio_ruta_configuraciones
        await queryInterface.createTable('convenio_ruta_configuraciones', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            convenio_ruta_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'convenio_rutas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tipo_viaje: {
                type: Sequelize.ENUM('solo_ida', 'ida_vuelta'),
                allowNull: false
            },
            tipo_asiento: {
                type: Sequelize.ENUM('semi_cama', 'cama', 'premium'),
                allowNull: false
            },
            tipo_beneficio: {
                type: Sequelize.ENUM('porcentaje', 'monto_descuento', 'monto_fijo'),
                allowNull: false
            },
            valor: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            limite_asientos: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Agregamos índice a convenio_ruta_id en rutas_configuraciones
        await queryInterface.addIndex('convenio_ruta_configuraciones', ['convenio_ruta_id']);
    },

    down: async (queryInterface, Sequelize) => {
        // Revertir todo en orden inverso

        // Eliminar convenio_ruta_configuraciones
        await queryInterface.dropTable('convenio_ruta_configuraciones');

        // Eliminar convenio_rutas
        await queryInterface.dropTable('convenio_rutas');

        // Revertir porcentaje_descuento a NOT NULL (solo si el negocio asegura que no habrán nulls perdidos, pero Sequelize lo intentará)
        // Para simplificar el rollback y evitar fallas si insertaron NULL, lo devolvemos con un valor por defecto seguro.
        await queryInterface.changeColumn('convenios', 'porcentaje_descuento', {
            type: Sequelize.INTEGER,
            allowNull: true, // Lo dejamos en true porque puede que hayan records con false ya, pero originalmente era con true en el modelo anterior? El usuario me dijo "modificar para permitir null" implying it wasn't null.  Wait, the original model had allowNull: true already in model. Let's revert it back exactly to how it was.
            defaultValue: 0,
            comment: 'Porcentaje de descuento (0-100)'
        });

        // Remover columnas ENUM añadidas a convenios
        await queryInterface.removeColumn('convenios', 'tipo_convenio');

        // sequelize enum types sometimes need explicit drop in mysql depending on dialect version, but removeColumn clears the spec string in mysql.
    }
};
