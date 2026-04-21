require('dotenv').config();
const fs = require('fs');
const { getRandomMessage, getRandomBtn1, getRandomBtn2 } = require('./messages');
const { markAsSent } = require('./sheets');
const {
  wait, randomBetween, formatNumber,
  calculateTypingTime, getMediaFiles, getMediaType,
  isWithinAllowedHours, log
} = require('./utils');

const GROUP_LINK = process.env.GROUP_LINK || 'https://chat.whatsapp.com/FG1hAPfo12e8AJOydKTnKs';
const DISAPPEARING_TIMER = parseInt(process.env.DISAPPEARING_TIMER || '7776000');
const MIN_DELAY = parseInt(process.env.MIN_DELAY || '35000');
const MAX_DELAY = parseInt(process.env.MAX_DELAY || '250000');

let dailySentCount = 0;
let lastResetDate = new Date().toDateString();

function checkDailyReset() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailySentCount = 0;
    lastResetDate = today;
    log('Contador diário resetado');
  }
}

function getDailyCount() { return dailySentCount; }

async function sendMedia(sock, jid, filePath) {
  const type = getMediaType(filePath);
  if (!type) {
    log(`Tipo de mídia não reconhecido: ${filePath}`, 'WARN');
    return;
  }
  const buffer = fs.readFileSync(filePath);
  const fileName = filePath.split('/').pop();

  try {
    if (type === 'image') {
      await sock.sendMessage(jid, { image: buffer, caption: '' });
    } else if (type === 'video') {
      await sock.sendMessage(jid, { video: buffer, caption: '' });
    } else if (type === 'audio') {
      await sock.sendMessage(jid, {
        audio: buffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      });
    }
    log(`Mídia enviada: ${fileName} → ${jid}`);
  } catch (err) {
    log(`Erro ao enviar mídia ${fileName}: ${err.message}`, 'ERROR');
  }
}

async function sendMessageWithButtons(sock, jid, text, btn1, btn2) {
  const fullText = `${text}\n\n👇 *${btn1}*\n${GROUP_LINK}`;
  try {
    await sock.sendMessage(jid, { text: fullText });
    log(`Mensagem enviada → ${jid}`);
  } catch (err) {
    log(`Erro ao enviar mensagem: ${err.message}`, 'ERROR');
  }
}

async function sendToContact(contact, sock) {
  checkDailyReset();

  const dailyLimit = parseInt(process.env.DAILY_LIMIT || '150');
  if (dailySentCount >= dailyLimit) {
    log(`Limite diário de ${dailyLimit} envios atingido. Aguardando próximo dia.`, 'WARN');
    return false;
  }

  const { nome, numero, row } = contact;
  const jid = formatNumber(numero);
  const name = nome || 'amigo(a)';

  // 1. Delay aleatório antes de iniciar
  const delay = randomBetween(MIN_DELAY, MAX_DELAY);
  log(`Aguardando ${Math.round(delay / 1000)}s antes de enviar para ${name} (${numero})`);
  await wait(delay);

  // 2. Verificar horário permitido após o delay
  if (!isWithinAllowedHours()) {
    log(`Fora do horário permitido (08h-20h). Pulando ${name}.`, 'WARN');
    return false;
  }

  log(`Iniciando envio para: ${name} (${numero})`);

  try {
    // 3. Ficar online
    await sock.sendPresenceUpdate('available', jid);
    await wait(randomBetween(800, 1800));

    // 4. Ativar mensagem temporária (90 dias)
    await sock.sendMessage(jid, { disappearingMessagesInChat: DISAPPEARING_TIMER });
    log(`Mensagem temporária ativada (${DISAPPEARING_TIMER}s) → ${name}`);
    await wait(randomBetween(1000, 2500));

    // 5. Enviar mídias da pasta /media
    const mediaFiles = getMediaFiles();
    if (mediaFiles.length > 0) {
      log(`Enviando ${mediaFiles.length} mídia(s) para ${name}`);
      for (const file of mediaFiles) {
        await sendMedia(sock, jid, file);
        await wait(randomBetween(2000, 5000));
      }
    }

    // 6. Simular digitação dupla (comportamento humano)
    const messageText = getRandomMessage(name);
    const typingTime = calculateTypingTime(messageText.length);

    await sock.sendPresenceUpdate('composing', jid);
    await wait(Math.round(typingTime * 0.55));
    await sock.sendPresenceUpdate('paused', jid);
    await wait(randomBetween(700, 1400));
    await sock.sendPresenceUpdate('composing', jid);
    await wait(Math.round(typingTime * 0.45));

    // 7. Aguardar 7 segundos finais antes de enviar
    await wait(7000);

    // 8. Enviar mensagem + botões
    const btn1 = getRandomBtn1();
    const btn2 = getRandomBtn2();
    await sendMessageWithButtons(sock, jid, messageText, btn1, btn2);

    // 9. Desativar mensagem temporária
    await wait(randomBetween(1200, 2500));
    await sock.sendMessage(jid, { disappearingMessagesInChat: 0 });
    log(`Mensagem temporária desativada → ${name}`);

    // 10. Marcar como enviado na planilha
    await markAsSent(row);

    dailySentCount++;
    log(`✅ Envio concluído para ${name} | Total hoje: ${dailySentCount}/${dailyLimit}`);
    return true;

  } catch (err) {
    log(`Erro no envio para ${name} (${numero}): ${err.message}`, 'ERROR');
    return false;
  }
}

module.exports = { sendToContact, getDailyCount };
