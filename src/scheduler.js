require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getPendingContacts } = require('./sheets');
const { sendToContact, getDailyCount } = require('./sender');
const { randomBetween, isWithinAllowedHours, log } = require('./utils');

const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || '150');
const MIN_POLL = 45000;
const MAX_POLL = 75000;
const QUEUE_FILE = path.join(__dirname, '..', 'queue.json');

let processing = false;
let sock = null;
let queue = [];
let started = false;

function saveQueue() {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  } catch (err) {
    log(`Erro ao salvar fila: ${err.message}`, 'ERROR');
  }
}

function loadQueue() {
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        queue = data;
        log(`Fila restaurada com ${queue.length} contato(s) pendente(s).`);
      }
    }
  } catch (err) {
    log(`Erro ao carregar fila salva: ${err.message}`, 'ERROR');
  }
}

function setSock(s) {
  sock = s;
}

async function processQueue() {
  if (processing || !sock || queue.length === 0) return;

  processing = true;

  while (queue.length > 0) {
    if (!isWithinAllowedHours()) {
      log('Fora do horário de envio (08h-20h Brasília). Fila pausada.', 'WARN');
      break;
    }

    if (getDailyCount() >= DAILY_LIMIT) {
      log(`Limite diário de ${DAILY_LIMIT} atingido. Fila pausada até amanhã.`, 'WARN');
      break;
    }

    const contact = queue.shift();
    saveQueue();
    await sendToContact(contact, sock);
  }

  processing = false;
}

async function pollSheets() {
  log('Verificando planilha...');

  try {
    const contacts = await getPendingContacts();

    if (contacts.length === 0) {
      log('Nenhum contato pendente na planilha.');
    } else {
      const existingRows = queue.map(c => c.row);
      const newContacts = contacts.filter(c => !existingRows.includes(c.row));

      if (newContacts.length > 0) {
        log(`${newContacts.length} novo(s) contato(s) adicionado(s) à fila.`);
        queue.push(...newContacts);
        saveQueue();
        processQueue();
      } else {
        log(`${contacts.length} contato(s) já estão na fila, aguardando.`);
      }
    }
  } catch (err) {
    log(`Erro no polling da planilha: ${err.message}`, 'ERROR');
  }

  const nextPoll = randomBetween(MIN_POLL, MAX_POLL);
  log(`Próxima verificação em ${Math.round(nextPoll / 1000)}s`);
  setTimeout(pollSheets, nextPoll);
}

function start(sockInstance) {
  setSock(sockInstance);
  if (started) {
    log('Scheduler já ativo. Socket atualizado.');
    return;
  }
  started = true;
  loadQueue();
  log('Scheduler iniciado. Primeira verificação em 5s...');
  setTimeout(pollSheets, 5000);
}

module.exports = { start };
