const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'data', 'logs', 'Server log.txt');

function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, entry, 'utf8');
}

module.exports = { log };
