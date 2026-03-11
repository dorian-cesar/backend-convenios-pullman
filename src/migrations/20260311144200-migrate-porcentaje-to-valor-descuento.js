'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Asegurarse de que valor_descuento tenga los datos de porcentaje_descuento
    // Solo actualizamos si valor_descuento es NULL o 0 y porcentaje_descuento tiene valor
    await queryInterface.sequelize.query(`
      UPDATE convenios 
      SET valor_descuento = porcentaje_descuento 
      WHERE (valor_descuento IS NULL OR valor_descuento = 0) 
      AND porcentaje_descuento > 0
    `);

    // 2. Eliminar la columna antigua porcentaje_descuento 
    // (Opcional: Si prefieres mantenerla por ahora, comenta la siguiente línea)
    await queryInterface.removeColumn('convenios', 'porcentaje_descuento');
  },

  async down(queryInterface, Sequelize) {
    // Revertir: Volver a crear porcentaje_descuento
    await queryInterface.addColumn('convenios', 'porcentaje_descuento', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    // Traspasar de vuelta
    await queryInterface.sequelize.query(`
      UPDATE convenios 
      SET porcentaje_descuento = CAST(valor_descuento AS UNSIGNED)
      WHERE valor_descuento IS NOT NULL
    `);
  }
};
