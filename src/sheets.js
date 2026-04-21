require('dotenv').config();
const axios = require('axios');
const { log } = require('./utils');

const SCRIPT_URL = process.env.SHEET_SCRIPT_URL;

async function getPendingContacts() {
  if (!SCRIPT_URL) {
    log('SHEET_SCRIPT_URL não configurada no .env', 'ERROR');
    return [];
  }
  try {
    const res = await axios.get(SCRIPT_URL, { timeout: 15000 });
    const data = res.data;
    if (!Array.isArray(data)) {
      log('Resposta inválida da planilha', 'WARN');
      return [];
    }
    return data;
  } catch (err) {
    log(`Erro ao buscar planilha: ${err.message}`, 'ERROR');
    return [];
  }
}

async function markAsSent(row) {
  if (!SCRIPT_URL) return;
  try {
    await axios.post(SCRIPT_URL, { row }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    log(`Linha ${row} marcada como ENVIADO na planilha`);
  } catch (err) {
    log(`Erro ao atualizar planilha linha ${row}: ${err.message}`, 'ERROR');
  }
}

module.exports = { getPendingContacts, markAsSent };
