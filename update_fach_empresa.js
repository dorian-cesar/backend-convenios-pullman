require('dotenv').config();
const { sequelize, Fach } = require('./src/models');

async function update() {
    try {
        await sequelize.authenticate();
        console.log("DB Authenticated.");
        const records = await Fach.update(
            { empresa_id: 101 },
            { where: { empresa_id: null }, paranoid: false }
        );
        console.log(`Successfully updated ${records[0]} FACH records to use empresa_id 101.`);
    } catch (e) {
        console.error("Update failed:", e);
    }
    process.exit(0);
}
update();
