const { execSync } = require('child_process');
try {
  console.log(execSync('pm2 status', { encoding: 'utf8' }));
  console.log(execSync('pm2 logs --lines 50', { encoding: 'utf8' }));
} catch(e) {
  console.log("PM2 Error:", e.message);
}
