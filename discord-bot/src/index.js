require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
} = require('discord.js');
const logger = require('./logger');
const tickets = require('./tickets');

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN || TOKEN === 'your_bot_token_here') {
  logger.error('DISCORD_TOKEN не задан. Скопируйте .env.example в .env и укажите токен.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

let ready = false;
let shuttingDown = false;

client.once('ready', async () => {
  ready = true;
  logger.info(`Бот вошёл как ${client.user.tag}`);
  client.user.setActivity('Остров Судьбы | тикеты', { type: ActivityType.Watching });

  try {
    await tickets.ensurePanel(client);
  } catch (err) {
    logger.error('Не удалось выставить панель тикетов', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  await tickets.handleInteraction(interaction);
});

client.on('error', (err) => {
  logger.error('Ошибка Discord клиента', err);
});

client.on('shardError', (err) => {
  logger.error('Ошибка шарда', err);
});

client.on('warn', (msg) => {
  logger.warn(String(msg));
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception — процесс завершится, watchdog перезапустит', err);
  // даём логу записаться, затем выходим — watchdog поднимет снова
  setTimeout(() => process.exit(1), 250);
});

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Получен ${signal}, завершаю работу…`);
  try {
    client.destroy();
  } catch (err) {
    logger.error('Ошибка при destroy()', err);
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

logger.info('Запуск бота Остров Судьбы…');
client.login(TOKEN).catch((err) => {
  logger.error('Не удалось войти в Discord. Проверьте токен и интенты бота.', err);
  process.exit(1);
});

// периодический heartbeat в лог — удобно видеть, что процесс жив
setInterval(() => {
  if (ready && !shuttingDown) {
    logger.info(`Heartbeat OK | ping ${client.ws.ping}ms | guilds ${client.guilds.cache.size}`);
  }
}, 5 * 60 * 1000);
