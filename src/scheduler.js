require('dotenv').config();
const { getPendingContacts } = require('./sheets');
const { sendToContact, getDailyCount } = require('./sender');
const { randomBetween, isWithinAllowedHours, log } = require('./utils');

const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || '150');
const MIN_POLL = 45000;
const MAX_POLL = 75000;

let processing = false;
let sock = null;
let queue = [];
let started = false;

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
      // Adiciona à fila somente contatos que não estão já enfileirados
      const existingRows = queue.map(c => c.row);
      const newContacts = contacts.filter(c => !existingRows.includes(c.row));

      if (newContacts.length > 0) {
        log(`${newContacts.length} novo(s) contato(s) adicionado(s) à fila.`);
        queue.push(...newContacts);
        processQueue();
      } else {
        log(`${contacts.length} contato(s) já estão na fila, aguardando.`);
      }
    }
  } catch (err) {
    log(`Erro no polling da planilha: ${err.message}`, 'ERROR');
  }

  // Próximo poll com intervalo aleatório entre 45s e 75s
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
  log('Scheduler iniciado. Primeira verificação em 5s...');
  setTimeout(pollSheets, 5000);
}

module.exports = { start };
