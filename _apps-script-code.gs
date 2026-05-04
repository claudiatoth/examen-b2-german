// ============================================================
// EXAMEN B2 - RECEPTIE RĂSPUNSURI CURSANȚI + SCOR AUTOMAT
// Claudia Toth · etommlearning@gmail.com
// VERSIUNEA DEFENSIVĂ — capturează erori la fiecare pas și
// trimite email cu detalii chiar dacă o parte eșuează.
// ============================================================

const NOTIFY_EMAIL = 'etommlearning@gmail.com';
const SECRET_TOKEN = 'CT-EXAMEN-B2-2026-X9K3M7';
const SHEET_NAME = 'Examen B2 - Răspunsuri Cursanți';

function getSheet() {
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty('SHEET_ID');
  let ss;
  if (sheetId) {
    try { ss = SpreadsheetApp.openById(sheetId); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SHEET_ID', ss.getId());
  }
  return ss.getActiveSheet();
}

function safeMail(subject, body, attachment) {
  try {
    const opts = { to: NOTIFY_EMAIL, subject: subject, body: body };
    if (attachment) opts.attachments = [attachment];
    MailApp.sendEmail(opts);
  } catch (e) {
    // ignorăm — nu vrem să crashuim totul dacă mailul eșuează
  }
}

function doPost(e) {
  let stage = 'init';
  let payload = null;

  try {
    // ---- 1. Parse payload ----
    stage = 'parse';
    payload = JSON.parse(e.postData.contents);

    // ---- 2. Verificare token ----
    stage = 'token';
    if (payload.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---- 3. Acces sheet ----
    stage = 'sheet';
    const sheet = getSheet();
    const score = payload.score || {};
    const answers = payload.answers || {};

    // ---- 4. Salvare row simplu (fail-safe) ----
    // Adăugăm un row JSON brut în coloana A ca backup garantat,
    // chiar dacă orice altceva eșuează. Așa nu pierdem submitul.
    stage = 'backup-row';
    const backupRow = [
      new Date(),
      payload.test || '',
      payload.cursantNume || '',
      payload.cursantPrenume || '',
      payload.timeUsed || '',
      score.oficiu != null ? score.oficiu : '',
      score.grammatik != null ? score.grammatik : '',
      score.hoerverstehen != null ? score.hoerverstehen : '',
      score.leseverstehen != null ? score.leseverstehen : '',
      '',  // Sprechen manual
      score.totalAuto != null ? score.totalAuto : '',
      score.procentAuto != null ? (score.procentAuto + '%') : '',
      '',  // Total final manual
      '',  // Promovat manual
      JSON.stringify(answers)  // toate răspunsurile ca JSON într-o singură celulă
    ];

    // Dacă schema veche (g1, g2... ca antete) sau gol → reset și scrie antetele noi
    stage = 'header-check';
    const expectedHeaders = [
      'Data trimitere', 'Test', 'Nume', 'Prenume', 'Timp folosit',
      'Oficiu', 'Grammatik (/30)', 'Hörverstehen (/20)', 'Leseverstehen (/25)',
      'Sprechen (/15) — manual',
      'TOTAL AUTO (/85)', 'Procent auto', 'TOTAL FINAL (/100)', 'Promovat?',
      'Răspunsuri (JSON)'
    ];

    const lastRow = sheet.getLastRow();
    let needHeaderInit = (lastRow === 0);
    if (lastRow > 0) {
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (currentHeaders.indexOf('Oficiu') === -1) {
        // Schema veche detectată → curățăm și recreăm
        sheet.clear();
        needHeaderInit = true;
      }
    }
    if (needHeaderInit) {
      sheet.appendRow(expectedHeaders);
      try {
        const r = sheet.getRange(1, 1, 1, expectedHeaders.length);
        r.setFontWeight('bold').setBackground('#10B981').setFontColor('#FFFFFF');
        sheet.setFrozenRows(1);
      } catch (fmtErr) {}
    }

    stage = 'append-row';
    sheet.appendRow(backupRow);

    // ---- 5. Email cu scor ----
    stage = 'email';
    const subject = '[Examen B2] Submit nou: ' + (payload.cursantNume || '?') + ' ' + (payload.cursantPrenume || '?');
    let scoreSection = '';
    if (score && score.totalAuto != null) {
      scoreSection =
        '\n========= SCOR AUTOMAT =========\n' +
        '  Din oficiu:       ' + score.oficiu + ' / 10\n' +
        '  Grammatik:        ' + score.grammatik + ' / ' + (score.grammatikMax || 30) + '\n' +
        '  Hörverstehen:     ' + score.hoerverstehen + ' / ' + (score.hoerverstehenMax || 20) + '\n' +
        '  Leseverstehen:    ' + score.leseverstehen + ' / ' + (score.leseverstehenMax || 25) + '\n' +
        '  --------------------------------\n' +
        '  TOTAL AUTO:       ' + score.totalAuto + ' / 85 (' + score.procentAuto + '%)\n' +
        '\n  Sprechen (oral):  __ / 15\n' +
        '  TOTAL FINAL:      __ / 100\n' +
        '  Prag promovare:   60 / 100\n';
    }

    const body =
      'Un cursant a trimis examenul B2.\n\n' +
      'Test: ' + (payload.test || '-') + '\n' +
      'Nume: ' + (payload.cursantNume || '?') + '\n' +
      'Prenume: ' + (payload.cursantPrenume || '?') + '\n' +
      'Data: ' + new Date().toLocaleString('ro-RO') + '\n' +
      'Timp folosit: ' + (payload.timeUsed || '-') + '\n' +
      scoreSection +
      '\nGoogle Sheet:\n' +
      sheet.getParent().getUrl() + '\n\n' +
      'Vezi si fisierul JSON atasat.\n\n' +
      'Claudia Toth - Curs autorizat ANC';

    let attachment = null;
    try {
      attachment = Utilities.newBlob(
        JSON.stringify(payload, null, 2),
        'application/json',
        'raspunsuri-' + Date.now() + '.json'
      );
    } catch (atErr) {}

    safeMail(subject, body, attachment);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // ---- ESEC: trimite email cu detalii ----
    const errMsg = '[Examen B2] EROARE la submit (stage: ' + stage + ')';
    const errBody =
      'A aparut o eroare la procesarea unui submit B2.\n\n' +
      'Stage: ' + stage + '\n' +
      'Eroare: ' + err.toString() + '\n' +
      'Stack: ' + (err.stack || '(no stack)') + '\n\n' +
      'Payload primit:\n' +
      (payload ? JSON.stringify(payload, null, 2) : '(nu s-a putut parsa)') + '\n';

    safeMail(errMsg, errBody, null);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', stage: stage, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test rapid în editor (rulezi din dropdown sus + ▶)
function testFunction() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        token: SECRET_TOKEN,
        test: 'Test 1 — Arbeit & Beruf (TEST INTERN)',
        cursantNume: 'Test',
        cursantPrenume: 'Cursant',
        timeUsed: '45:30',
        answers: { g1: 'denn', g2: 'weil', h1: 'b', l1: 'b' },
        score: {
          oficiu: 10,
          grammatik: 22, grammatikMax: 30,
          hoerverstehen: 16, hoerverstehenMax: 20,
          leseverstehen: 18, leseverstehenMax: 25,
          sprechen: null, sprechenMax: 15,
          totalAuto: 66, totalAutoMax: 85,
          totalPotential: 100, procentAuto: 78
        }
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
  Logger.log('Sheet URL: ' + getSheet().getParent().getUrl());
}
