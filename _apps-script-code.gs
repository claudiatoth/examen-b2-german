// ============================================================
// EXAMEN B2 - RECEPTIE RĂSPUNSURI CURSANȚI + SCOR AUTOMAT
// Claudia Toth · etommlearning@gmail.com
// Versiune: include scor automat (10 oficiu + Grammatik + Hörverstehen + Leseverstehen)
// Sprechen rămâne completat manual de examinator în Sheet
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
    const score = payload.score || {};

    // Coloane fixe în ordine:
    // metadata + scor (in fata, vizibil rapid) + raspunsuri detaliate
    const baseHeaders = [
      'Data trimitere', 'Test', 'Nume', 'Prenume', 'Timp folosit',
      'Oficiu', 'Grammatik (/30)', 'Hörverstehen (/20)', 'Leseverstehen (/25)',
      'Sprechen (/15) — manual',
      'TOTAL AUTO (/85)', 'Procent auto', 'TOTAL FINAL (/100) — completat manual', 'Promovat?'
    ];

    const sortKeys = (keys) => keys.sort((a, b) => {
      const order = { g: 1, o: 2, h: 3, l: 4 };
      const aSec = order[a[0]] || 99;
      const bSec = order[b[0]] || 99;
      if (aSec !== bSec) return aSec - bSec;
      return parseInt(a.slice(1)) - parseInt(b.slice(1));
    });

    if (sheet.getLastRow() === 0) {
      const answerKeys = sortKeys(Object.keys(payload.answers || {}));
      const headers = baseHeaders.concat(answerKeys);
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold').setBackground('#10B981').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    } else {
      // Auto-extend antet — adaugă chei noi care nu există
      const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const allNew = baseHeaders.concat(Object.keys(payload.answers || {}));
      const missing = allNew.filter(k => existingHeaders.indexOf(k) === -1);
      if (missing.length > 0) {
        const startCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
        const newRange = sheet.getRange(1, startCol, 1, missing.length);
        newRange.setFontWeight('bold').setBackground('#10B981').setFontColor('#FFFFFF');
      }
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => {
      if (h === 'Data trimitere') return new Date();
      if (h === 'Test') return payload.test || '';
      if (h === 'Nume') return payload.cursantNume || '';
      if (h === 'Prenume') return payload.cursantPrenume || '';
      if (h === 'Timp folosit') return payload.timeUsed || '';
      if (h === 'Oficiu') return score.oficiu != null ? score.oficiu : '';
      if (h === 'Grammatik (/30)') return score.grammatik != null ? score.grammatik : '';
      if (h === 'Hörverstehen (/20)') return score.hoerverstehen != null ? score.hoerverstehen : '';
      if (h === 'Leseverstehen (/25)') return score.leseverstehen != null ? score.leseverstehen : '';
      if (h === 'Sprechen (/15) — manual') return '';  // se completează manual
      if (h === 'TOTAL AUTO (/85)') return score.totalAuto != null ? score.totalAuto : '';
      if (h === 'Procent auto') return score.procentAuto != null ? (score.procentAuto + '%') : '';
      if (h === 'TOTAL FINAL (/100) — completat manual') return '';
      if (h === 'Promovat?') return '';
      return (payload.answers && payload.answers[h]) ? payload.answers[h] : '';
    });
    sheet.appendRow(row);

    // Email pentru examinator (cu scor)
    const subject = '[Examen B2] Submit nou: ' + (payload.cursantNume || '?') + ' ' + (payload.cursantPrenume || '?');
    let scoreSection = '';
    if (score && score.totalAuto != null) {
      scoreSection =
        '\n========= SCOR AUTOMAT =========\n' +
        '  Din oficiu:       ' + score.oficiu + ' / 10\n' +
        '  Grammatik:        ' + score.grammatik + ' / ' + score.grammatikMax + '\n' +
        '  Hörverstehen:     ' + score.hoerverstehen + ' / ' + score.hoerverstehenMax + '\n' +
        '  Leseverstehen:    ' + score.leseverstehen + ' / ' + score.leseverstehenMax + '\n' +
        '  ───────────────────────────────\n' +
        '  TOTAL AUTO:       ' + score.totalAuto + ' / 85 (' + score.procentAuto + '%)\n' +
        '\n  Sprechen (oral):  __ / 15  ← completează manual după proba orală\n' +
        '  TOTAL FINAL:      __ / 100  ← TOTAL AUTO + Sprechen\n' +
        '  Prag promovare:   60 / 100\n';
    }

    const body =
      'Un cursant a trimis examenul B2.\n\n' +
      'Test: ' + (payload.test || '-') + '\n' +
      'Nume: ' + (payload.cursantNume || '(necompletat)') + '\n' +
      'Prenume: ' + (payload.cursantPrenume || '(necompletat)') + '\n' +
      'Data: ' + new Date().toLocaleString('ro-RO') + '\n' +
      'Timp folosit: ' + (payload.timeUsed || '-') + '\n' +
      scoreSection +
      '\nRăspunsurile complete + scorul detaliat sunt în Google Sheet:\n' +
      sheet.getParent().getUrl() + '\n\n' +
      'Vezi și fișierul JSON atașat (cu detalii pe fiecare item).\n\n' +
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

// Test rapid în editor
function testFunction() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        token: SECRET_TOKEN,
        test: 'Test 1 — Arbeit & Beruf (TEST INTERN)',
        cursantNume: 'Test',
        cursantPrenume: 'Cursant',
        timeUsed: '45:30',
        answers: { g1: 'denn', g2: 'weil', h1: 'c', l1: 'b' },
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
