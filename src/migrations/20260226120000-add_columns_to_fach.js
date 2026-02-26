'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('fach');

        if (!tableInfo.status) {
            await queryInterface.addColumn('fach', 'status', {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'ACTIVO'
            });
        }

        if (!tableInfo.empresa_id) {
            await queryInterface.addColumn('fach', 'empresa_id', {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'empresas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
        }

        if (!tableInfo.convenio_id) {
            await queryInterface.addColumn('fach', 'convenio_id', {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'convenios',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
        }

        if (!tableInfo.createdAt) {
            await queryInterface.addColumn('fach', 'createdAt', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            });
        }

        if (!tableInfo.updatedAt) {
            await queryInterface.addColumn('fach', 'updatedAt', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            });
        }

        if (!tableInfo.deletedAt) {
            await queryInterface.addColumn('fach', 'deletedAt', {
                type: Sequelize.DATE,
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('fach');

        if (tableInfo.deletedAt) await queryInterface.removeColumn('fach', 'deletedAt');
        if (tableInfo.updatedAt) await queryInterface.removeColumn('fach', 'updatedAt');
        if (tableInfo.createdAt) await queryInterface.removeColumn('fach', 'createdAt');
        if (tableInfo.convenio_id) await queryInterface.removeColumn('fach', 'convenio_id');
        if (tableInfo.empresa_id) await queryInterface.removeColumn('fach', 'empresa_id');
        if (tableInfo.status) await queryInterface.removeColumn('fach', 'status');
    }
};
