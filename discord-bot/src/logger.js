const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'bot.log');

function stamp() {
  return new Date().toISOString();
}

function write(level, message, err) {
  const line = `[${stamp()}] [${level}] ${message}${err ? ` | ${err.stack || err}` : ''}\n`;
  process.stdout.write(line);
  try {
    fs.appendFileSync(logFile, line, 'utf8');
  } catch {
    // не падаем из-за логов
  }
}

module.exports = {
  info: (msg) => write('INFO', msg),
  warn: (msg) => write('WARN', msg),
  error: (msg, err) => write('ERROR', msg, err),
};
