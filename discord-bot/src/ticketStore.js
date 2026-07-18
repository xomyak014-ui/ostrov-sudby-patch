const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const dataDir = path.join(__dirname, '..', 'data');
const storePath = path.join(dataDir, 'tickets.json');

function ensure() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ tickets: {}, counter: 0 }, null, 2), 'utf8');
  }
}

function read() {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf8'));
  } catch (err) {
    logger.error('Не удалось прочитать tickets.json, создаю заново', err);
    const fresh = { tickets: {}, counter: 0 };
    fs.writeFileSync(storePath, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }
}

function write(data) {
  ensure();
  const tmp = `${storePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, storePath);
}

function nextNumber() {
  const data = read();
  data.counter += 1;
  write(data);
  return data.counter;
}

function getOpenByUser(userId) {
  const data = read();
  return Object.values(data.tickets).find((t) => t.userId === userId && t.status === 'open') || null;
}

function getByChannel(channelId) {
  const data = read();
  return data.tickets[channelId] || null;
}

function create({ channelId, userId, number }) {
  const data = read();
  data.tickets[channelId] = {
    channelId,
    userId,
    number,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  write(data);
  return data.tickets[channelId];
}

function close(channelId) {
  const data = read();
  if (!data.tickets[channelId]) return null;
  data.tickets[channelId].status = 'closed';
  data.tickets[channelId].closedAt = new Date().toISOString();
  write(data);
  return data.tickets[channelId];
}

module.exports = {
  nextNumber,
  getOpenByUser,
  getByChannel,
  create,
  close,
};
