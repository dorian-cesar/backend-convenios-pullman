const { sequelize } = require('./models');

sequelize.sync({ alter: false })
  .then(() => console.log('🗄️ Modelos sincronizados'))
  .catch(console.error);
