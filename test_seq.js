const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');
const Test = sequelize.define('Test', {
    campo: DataTypes.STRING
});

async function run() {
    await sequelize.sync();
    try {
        await Test.create({ campo: ['hola'] });
    } catch(err) {
        console.log("Error de Sequelize:");
        console.log(err.errors[0].message);
    }
}
run();
