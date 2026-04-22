require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const path = require('path');
const { log } = require('./utils');
const scheduler = require('./scheduler');

const AUTH_DIR = path.join(__dirname, '..', 'auth');
const MAX_RECONNECT_ATTEMPTS = 10;

let reconnectAttempts = 0;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  log(`Baileys versão: ${version.join('.')}`);

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    browser: ['Rifas Clube do Churrasco', 'Chrome', '120.0.0'],
    markOnlineOnConnect: true,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      log('QR Code gerado. Escaneie com seu WhatsApp!');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      log(`Conexão encerrada. Código: ${code}. Reconectar: ${shouldReconnect}`, 'WARN');

      if (shouldReconnect) {
        reconnectAttempts++;

        if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
          log(`Máximo de ${MAX_RECONNECT_ATTEMPTS} tentativas de reconexão atingido. Encerrando.`, 'ERROR');
          process.exit(1);
        }

        // Backoff exponencial: 5s, 10s, 20s, 40s, 80s, máx 120s
        const delay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 120000);
        log(`Reconectando em ${Math.round(delay / 1000)}s... (tentativa ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(connectToWhatsApp, delay);
      } else {
        log('Sessão encerrada (logout). Delete a pasta /auth e reinicie.', 'ERROR');
      }
    }

    if (connection === 'open') {
      reconnectAttempts = 0;
      log('✅ WhatsApp conectado com sucesso!');
      log(`Número conectado: ${sock.user?.id}`);
      scheduler.start(sock);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.key.fromMe && msg.key.remoteJid) {
        try {
          await sock.readMessages([msg.key]);
        } catch (_) {}
      }
    }
  });

  return sock;
}

log('===========================================');
log('   BOT RIFAS CLUBE DO CHURRASCO v1.0.0    ');
log('===========================================');
log('Iniciando conexão com WhatsApp...');

connectToWhatsApp().catch(err => {
  log(`Erro fatal: ${err.message}`, 'ERROR');
  process.exit(1);
});
