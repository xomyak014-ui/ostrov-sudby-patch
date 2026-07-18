/**
 * Watchdog: перезапускает бота при падении с экспоненциальной задержкой.
 * Запуск: npm run start:safe
 */
const { spawn } = require('child_process');
const path = require('path');
const logger = require('./logger');

const BOT_ENTRY = path.join(__dirname, 'index.js');
const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 60_000;

let delay = MIN_DELAY_MS;
let child = null;
let stopping = false;
let startedAt = 0;

function start() {
  if (stopping) return;

  logger.info(`Watchdog: запуск бота (задержка после сбоя: ${delay}ms)`);
  startedAt = Date.now();

  child = spawn(process.execPath, [BOT_ENTRY], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    child = null;
    if (stopping) {
      logger.info('Watchdog: остановка по запросу');
      process.exit(code ?? 0);
      return;
    }

    const livedMs = Date.now() - startedAt;
    logger.warn(`Watchdog: бот завершился (code=${code}, signal=${signal}, uptime=${Math.round(livedMs / 1000)}s)`);

    // если проработал дольше 2 минут — считаем стабильным, сбрасываем задержку
    if (livedMs > 120_000) {
      delay = MIN_DELAY_MS;
    }

    logger.info(`Watchdog: перезапуск через ${delay}ms…`);
    setTimeout(() => {
      delay = Math.min(delay * 2, MAX_DELAY_MS);
      start();
    }, delay);
  });

  child.on('error', (err) => {
    logger.error('Watchdog: ошибка spawn', err);
  });
}

function stop(signal) {
  if (stopping) return;
  stopping = true;
  logger.info(`Watchdog: получен ${signal}`);
  if (child) {
    child.kill('SIGTERM');
    setTimeout(() => {
      if (child) child.kill('SIGKILL');
    }, 8000);
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));

start();
