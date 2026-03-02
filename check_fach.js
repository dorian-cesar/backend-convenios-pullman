require('dotenv').config();
const { sequelize } = require('./src/models');

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("DESCRIBE fach;");
        console.log("=== FACH TABLE SCHEMA ===");
        console.table(results);
    } catch (err) {
        console.error("Test failed:", err);
    }
    process.exit(0);
}

check();
