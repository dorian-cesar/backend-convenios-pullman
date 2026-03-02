require('dotenv').config();
const { sequelize } = require('./src/models');

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW TABLES;");
        console.log("=== TABLES ===");
        console.log(results.map(r => Object.values(r)[0]));
    } catch (err) {
        console.error("Test failed:", err);
    }
    process.exit(0);
}

check();
