require('dotenv').config();
const fs = require('fs');
const path = require('path');

function getBrasiliaHour() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brasilia = new Date(utc + -3 * 3600000);
  return brasilia.getHours();
}

function getPeriodoDia() {
  const hour = getBrasiliaHour();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function isWithinAllowedHours() {
  const hour = getBrasiliaHour();
  const start = parseInt(process.env.START_HOUR || '8');
  const end = parseInt(process.env.END_HOUR || '20');
  return hour >= start && hour < end;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatNumber(number) {
  let num = String(number).replace(/\D/g, '');
  if (num.startsWith('0')) num = num.slice(1);
  if (!num.startsWith('55')) num = '55' + num;
  return num + '@s.whatsapp.net';
}

function calculateTypingTime(textLength) {
  const base = (textLength / 35) * 1000;
  return Math.min(Math.max(base, 2500), 9000);
}

function getMediaFiles() {
  const mediaDir = path.join(__dirname, '..', 'media');
  if (!fs.existsSync(mediaDir)) return [];
  return fs.readdirSync(mediaDir)
    .filter(f => !f.startsWith('.'))
    .map(f => path.join(mediaDir, f));
}

function getMediaType(filePath) {
  const mime = require('mime-types');
  const mimeType = mime.lookup(filePath) || '';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return null;
}

function log(message, level = 'INFO') {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const line = `[${now}] [${level}] ${message}`;
  console.log(line);
  try {
    const logFile = process.env.LOG_FILE || 'logs/bot.log';
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, line + '\n');
  } catch (_) {}
}

module.exports = {
  getPeriodoDia,
  isWithinAllowedHours,
  randomBetween,
  wait,
  formatNumber,
  calculateTypingTime,
  getMediaFiles,
  getMediaType,
  log
};
