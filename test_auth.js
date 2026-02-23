const { ApiKey } = require('./src/models');
async function test() {
  const keys = await ApiKey.findAll();
  console.log(keys.map(k => `${k.name}: ${k.key}`));
  process.exit(0);
}
test();
