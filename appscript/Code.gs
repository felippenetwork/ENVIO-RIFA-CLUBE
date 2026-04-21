// =============================================
// GOOGLE APPS SCRIPT - BOT RIFAS CLUBE DO CHURRASCO
// Planilha: DISPARO
// Colunas: A=NOME | B=NUMERO | C=STATUS | D=OBS | E=ENVIADO_EM
// =============================================

var SHEET_NAME = 'DISPARO';

// Retorna todos os contatos com STATUS vazio (pendentes)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var lastRow = sheet.getLastRow();
    var pending = [];

    if (lastRow < 2) {
      return buildResponse([]);
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();

    for (var i = 0; i < data.length; i++) {
      var nome   = String(data[i][0]).trim();
      var numero = String(data[i][1]).trim();
      var status = String(data[i][2]).trim().toUpperCase();

      // Ignora linhas vazias ou já enviadas
      if (!numero || numero === '' || numero === 'UNDEFINED') continue;
      if (status === 'ENVIADO') continue;

      pending.push({
        row:    i + 2,       // linha real na planilha (começa em 2)
        nome:   nome,
        numero: numero,
        obs:    String(data[i][3]).trim()
      });
    }

    return buildResponse(pending);
  } catch (err) {
    return buildResponse({ error: err.message });
  }
}

// Recebe row do bot e marca como ENVIADO + data/hora
function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var row = parseInt(params.row);

    if (!row || isNaN(row)) {
      return buildResponse({ success: false, error: 'Row inválida' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var now = new Date();
    var formatted = Utilities.formatDate(now, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');

    sheet.getRange(row, 3).setValue('ENVIADO');     // Coluna C - STATUS
    sheet.getRange(row, 5).setValue(formatted);     // Coluna E - ENVIADO_EM

    return buildResponse({ success: true, row: row, enviado_em: formatted });
  } catch (err) {
    return buildResponse({ success: false, error: err.message });
  }
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Função utilitária para limpar STATUS de toda a planilha (nova campanha)
function limparStatus() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  sheet.getRange(2, 3, lastRow - 1, 1).clearContent(); // Limpa coluna STATUS
  sheet.getRange(2, 5, lastRow - 1, 1).clearContent(); // Limpa coluna ENVIADO_EM
  SpreadsheetApp.getUi().alert('Status limpo! Planilha pronta para novo disparo.');
}

// Adiciona menu personalizado na planilha
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔥 Bot Rifas')
    .addItem('Limpar Status (Nova Campanha)', 'limparStatus')
    .addToUi();
}
