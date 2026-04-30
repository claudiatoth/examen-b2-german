// ============================================================
// EXAMEN B2 - RECEPTIE RĂSPUNSURI CURSANȚI
// Claudia Toth · etommlearning@gmail.com
// Versiune standalone: creează singur Sheet-ul prima dată
// ============================================================

const NOTIFY_EMAIL = 'etommlearning@gmail.com';
const SECRET_TOKEN = 'CT-EXAMEN-B2-2026-X9K3M7';
const SHEET_NAME = 'Examen B2 - Răspunsuri Cursanți';

// Returnează (sau creează) Sheet-ul de salvare
function getSheet() {
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty('SHEET_ID');
  let ss;

  if (sheetId) {
    try {
      ss = SpreadsheetApp.openById(sheetId);
    } catch (e) {
      ss = null;
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SHEET_ID', ss.getId());
    Logger.log('Sheet creat: ' + ss.getUrl());
  }

  return ss.getActiveSheet();
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = getSheet();

    if (sheet.getLastRow() === 0) {
      const baseHeaders = ['Data trimitere', 'Test', 'Nume', 'Prenume', 'Timp folosit'];
      const answerKeys = Object.keys(payload.answers || {}).sort((a, b) => {
        const order = { g: 1, h: 2, l: 3 };
        const aSec = order[a[0]] || 99;
        const bSec = order[b[0]] || 99;
        if (aSec !== bSec) return aSec - bSec;
        return parseInt(a.slice(1)) - parseInt(b.slice(1));
      });
      const headers = baseHeaders.concat(answerKeys);
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold').setBackground('#10B981').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => {
      if (h === 'Data trimitere') return new Date();
      if (h === 'Test') return payload.test || '';
      if (h === 'Nume') return payload.cursantNume || '';
      if (h === 'Prenume') return payload.cursantPrenume || '';
      if (h === 'Timp folosit') return payload.timeUsed || '';
      return (payload.answers && payload.answers[h]) ? payload.answers[h] : '';
    });
    sheet.appendRow(row);

    const subject = '[Examen B2] Submit nou: ' + (payload.test || 'Test necunoscut');
    const body =
      'Un cursant a trimis examenul B2.\n\n' +
      'Test: ' + (payload.test || '-') + '\n' +
      'Nume: ' + (payload.cursantNume || '(necompletat)') + '\n' +
      'Prenume: ' + (payload.cursantPrenume || '(necompletat)') + '\n' +
      'Data: ' + new Date().toLocaleString('ro-RO') + '\n' +
      'Timp folosit: ' + (payload.timeUsed || '-') + '\n\n' +
      'Răspunsurile complete sunt în Google Sheet:\n' +
      sheet.getParent().getUrl() + '\n\n' +
      'Vezi și fișierul JSON atașat.\n\n' +
      'ʚଓ Claudia Toth · Curs autorizat ANC';

    const jsonAttachment = Utilities.newBlob(
      JSON.stringify(payload, null, 2),
      'application/json',
      'raspunsuri-' + (payload.test || 'test').replace(/[^a-z0-9]/gi, '-') + '-' + Date.now() + '.json'
    );

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: body,
      attachments: [jsonAttachment]
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Rulează asta o dată ca să creezi Sheet-ul + să testezi că merge
function testFunction() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        token: SECRET_TOKEN,
        test: 'Test 1 — Arbeit & Beruf (TEST INTERN)',
        cursantNume: 'Test',
        cursantPrenume: 'Cursant',
        timeUsed: '45:30',
        answers: { g1: 'denn', g2: 'weil', h1: 'b', l1: 'b' }
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
  Logger.log('Sheet URL: ' + getSheet().getParent().getUrl());
}
