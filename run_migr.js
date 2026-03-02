require('dotenv').config();
const { sequelize } = require('./src/models');
const migration = require('./src/migrations/20260226120000-add_columns_to_fach');

async function test() {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();
        await migration.up(queryInterface, sequelize.Sequelize);
        console.log("Migration executed successfully!");
    } catch(e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}
test();
