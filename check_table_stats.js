const { sequelize } = require('./src/models');

async function checkTableSize() {
  try {
    const [results] = await sequelize.query("SELECT COUNT(*) as total FROM beneficiarios");
    console.log('Total beneficiaries:', results[0].total);
    
    const [indexResults] = await sequelize.query("SHOW INDEX FROM beneficiarios");
    console.log('Indexes on beneficiarios:', JSON.stringify(indexResults, null, 2));
  } catch (error) {
    console.error('Error checking table:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableSize();
