// ============================================================
// EXAMEN B2 - RECEPTIE RĂSPUNSURI CURSANȚI + SCOR AUTOMAT
// Claudia Toth · etommlearning@gmail.com
// VERSIUNEA 5 (17 mai 2026):
//   - 1 Google Sheet · TAB (foaie) separat per Test
//   - coloană "Sesiune" (filtrezi pe sesiunea curentă)
//   - Google Doc per cursant în foldere ierarhice: {SESIUNE} / {Test}
//   - labels generice (funcționează pentru toate cele 10 teste)
//   - logica defensivă păstrată (try/catch pe stages + email pe eroare)
// ============================================================

// 🔴 SINGURUL LUCRU PE CARE ÎL SCHIMBI LA FIECARE SESIUNE NOUĂ:
const SESIUNE = 'Iulie 2026';
// ============================================================

const NOTIFY_EMAIL = 'etommlearning@gmail.com';
const SECRET_TOKEN = 'CT-EXAMEN-B2-2026-X9K3M7';
const SHEET_NAME = 'Examen B2 - Răspunsuri Cursanți';
const DRIVE_FOLDER_NAME = 'Examen B2 - Raspunsuri Cursanti';

// Antetele (16 coloane — am adăugat „Sesiune" pe poziția 2)
const EXPECTED_HEADERS = [
  'Data trimitere', 'Sesiune', 'Test', 'Nume', 'Prenume', 'Timp folosit',
  'Oficiu', 'Grammatik (/30)', 'Hörverstehen (/20)', 'Leseverstehen (/25)',
  'Sprechen (/15) — manual',
  'TOTAL AUTO (/85)', 'Procent auto', 'TOTAL FINAL (/100)', 'Promovat?',
  'Răspunsuri (JSON)'
];

// ============================================================
// SPREADSHEET + TAB per test
// ============================================================
function getSpreadsheet() {
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
  return ss;
}

// Din „Test 2 — Bildung & Studium" → numele tab-ului „Test 2"
function tabNameFromTest(testStr) {
  const m = (testStr || '').match(/Test\s*\d+/i);
  return m ? m[0].replace(/\s+/g, ' ').trim() : 'Diverse';
}

// Găsește/creează foaia pentru testul respectiv + asigură antetele
function getTestSheet(ss, testStr) {
  const tabName = tabNameFromTest(testStr);
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }
  // Asigură antetele (creează sau repară schema veche fără „Sesiune")
  const lastRow = sheet.getLastRow();
  let needHeaderInit = (lastRow === 0);
  if (lastRow > 0) {
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (currentHeaders.indexOf('Sesiune') === -1) {
      sheet.clear();
      needHeaderInit = true;
    }
  }
  if (needHeaderInit) {
    sheet.appendRow(EXPECTED_HEADERS);
    try {
      const r = sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length);
      r.setFontWeight('bold').setBackground('#10B981').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    } catch (fmtErr) {}
  }
  return sheet;
}

function safeMail(subject, body, attachment) {
  try {
    const opts = { to: NOTIFY_EMAIL, subject: subject, body: body };
    if (attachment) opts.attachments = [attachment];
    MailApp.sendEmail(opts);
  } catch (e) {}
}

// ============================================================
// FOLDERE IERARHICE: root / {SESIUNE} / {Test}
// ============================================================
function getOrCreateChild(parent, name) {
  const it = parent.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return parent.createFolder(name);
}

function getTargetFolder(testStr) {
  // root
  let root;
  const roots = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  root = roots.hasNext() ? roots.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
  // root / SESIUNE / Test N
  const sessionFolder = getOrCreateChild(root, SESIUNE);
  const testFolder = getOrCreateChild(sessionFolder, tabNameFromTest(testStr));
  return testFolder;
}

// ============================================================
// Etichete GENERICE (funcționează pentru oricare din cele 10 teste)
// ============================================================
const ITEM_LABELS = {
  g1: 'Konnektor 1', g2: 'Konnektor 2', g3: 'Konnektor 3', g4: 'Konnektor 4', g5: 'Konnektor 5',
  g6: 'Prepoziție 1', g7: 'Prepoziție 2', g8: 'Prepoziție 3', g9: 'Prepoziție 4', g10: 'Prepoziție 5',
  g11: 'Aktiv→Passiv 1', g12: 'Aktiv→Passiv 2', g13: 'Aktiv→Passiv 3', g14: 'Aktiv→Passiv 4', g15: 'Aktiv→Passiv 5',
  o1: 'Ortografie 1', o2: 'Ortografie 2', o3: 'Ortografie 3', o4: 'Ortografie 4', o5: 'Ortografie 5',
  o6: 'Găsește greșeala 1', o7: 'Găsește greșeala 2', o8: 'Găsește greșeala 3',
  o9: 'Găsește greșeala 4', o10: 'Găsește greșeala 5',
  h1: 'Hör 1 (MC)', h2: 'Hör 2 (MC)', h3: 'Hör 3 (MC)', h4: 'Hör 4 (MC)',
  h5: 'Hör 5 (R/F)', h6: 'Hör 6 (R/F)', h7: 'Hör 7 (R/F)', h8: 'Hör 8 (R/F)',
  l1: 'Lese 1 (MC)', l2: 'Lese 2 (MC)', l3: 'Lese 3 (MC)', l4: 'Lese 4 (MC)', l5: 'Lese 5 (MC)',
  l6: 'Lese 6 (scurt)', l7: 'Lese 7 (scurt)', l8: 'Lese 8 (scurt)', l9: 'Lese 9 (scurt)', l10: 'Lese 10 (scurt)'
};

function createResponseDoc(payload, sheetUrl) {
  const score = payload.score || {};
  const answers = payload.answers || {};
  const detail = score.detail || {};
  const nume = payload.cursantNume || '?';
  const prenume = payload.cursantPrenume || '?';
  const test = payload.test || 'Test';
  const dataStr = new Date().toLocaleString('ro-RO');

  const docName = test + ' - ' + nume + ' ' + prenume + ' - ' + new Date().toISOString().slice(0, 16).replace('T', ' ');
  const doc = DocumentApp.create(docName);
  const body = doc.getBody();

  const t1 = body.appendParagraph(test);
  t1.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  t1.editAsText().setForegroundColor('#10B981');

  body.appendParagraph('Sesiune: ' + SESIUNE);
  body.appendParagraph('Cursant: ' + nume + ' ' + prenume);
  body.appendParagraph('Data submit: ' + dataStr);
  body.appendParagraph('Timp folosit: ' + (payload.timeUsed || '-'));
  body.appendHorizontalRule();

  if (score.totalAuto != null) {
    const h2 = body.appendParagraph('SCOR AUTOMAT');
    h2.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    h2.editAsText().setForegroundColor('#10B981');

    body.appendParagraph('Oficiu:         ' + score.oficiu + ' / 10');
    body.appendParagraph('Grammatik:      ' + score.grammatik + ' / ' + (score.grammatikMax || 30));
    body.appendParagraph('Hörverstehen:   ' + score.hoerverstehen + ' / ' + (score.hoerverstehenMax || 20));
    body.appendParagraph('Leseverstehen:  ' + score.leseverstehen + ' / ' + (score.leseverstehenMax || 25));
    body.appendParagraph('-------------------------------');
    const totalP = body.appendParagraph('TOTAL AUTO:     ' + score.totalAuto + ' / 85 (' + score.procentAuto + '%)');
    totalP.editAsText().setBold(true);
    body.appendParagraph('');
    body.appendParagraph('Sprechen (oral): __ / 15  ← completează manual');
    body.appendParagraph('TOTAL FINAL:     __ / 100');
    body.appendParagraph('Prag promovare:  60 / 100');
    body.appendHorizontalRule();
  }

  function appendSection(title, sectionKey, keys) {
    const h = body.appendParagraph(title);
    h.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    h.editAsText().setForegroundColor('#10B981');

    const items = (detail[sectionKey] && detail[sectionKey].items) || {};
    keys.forEach(k => {
      const item = items[k];
      const userAns = (item && item.answer) || answers[k] || '(necompletat)';
      const label = ITEM_LABELS[k] || k;
      let line = label + ': ' + userAns;
      if (item) {
        if (item.correct) line += '   ✓ corect (' + item.points + '/' + item.max + 'p)';
        else line += '   ✗ greșit (0/' + item.max + 'p)';
      }
      const p = body.appendParagraph(line);
      if (item && item.correct === false) p.editAsText().setForegroundColor('#dc2626');
      else if (item && item.correct === true) p.editAsText().setForegroundColor('#059669');
    });
  }

  appendSection('GRAMMATIK + RECHTSCHREIBUNG', 'grammatik',
    ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12','g13','g14','g15',
     'o1','o2','o3','o4','o5','o6','o7','o8','o9','o10']);
  appendSection('HÖRVERSTEHEN', 'hoerverstehen', ['h1','h2','h3','h4','h5','h6','h7','h8']);
  appendSection('LESEVERSTEHEN', 'leseverstehen', ['l1','l2','l3','l4','l5','l6','l7','l8','l9','l10']);

  body.appendHorizontalRule();
  body.appendParagraph('Sheet centralizator: ' + sheetUrl);
  body.appendParagraph('Generat automat · Sesiune ' + SESIUNE + ' · ʚଓ Claudia Toth · Curs autorizat ANC');

  doc.saveAndClose();

  // Mută în folderul ierarhic SESIUNE / Test N
  try {
    const folder = getTargetFolder(test);
    DriveApp.getFileById(doc.getId()).moveTo(folder);
  } catch (mvErr) {}

  return doc.getUrl();
}

function doPost(e) {
  let stage = 'init';
  let payload = null;

  try {
    stage = 'parse';
    payload = JSON.parse(e.postData.contents);

    stage = 'token';
    if (payload.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    stage = 'sheet';
    const ss = getSpreadsheet();
    const sheet = getTestSheet(ss, payload.test);
    const score = payload.score || {};
    const answers = payload.answers || {};

    stage = 'append-row';
    const backupRow = [
      new Date(),
      SESIUNE,
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
      JSON.stringify(answers)
    ];
    sheet.appendRow(backupRow);

    stage = 'create-doc';
    let docUrl = '';
    try {
      docUrl = createResponseDoc(payload, ss.getUrl());
    } catch (docErr) {
      docUrl = '(doc nu a putut fi creat: ' + docErr.toString() + ')';
    }

    stage = 'email';
    const subject = '[Examen B2 · ' + SESIUNE + '] ' + (payload.test || '?') + ' — ' +
                    (payload.cursantNume || '?') + ' ' + (payload.cursantPrenume || '?');
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
      'Sesiune: ' + SESIUNE + '\n' +
      'Test: ' + (payload.test || '-') + '\n' +
      'Nume: ' + (payload.cursantNume || '?') + '\n' +
      'Prenume: ' + (payload.cursantPrenume || '?') + '\n' +
      'Data: ' + new Date().toLocaleString('ro-RO') + '\n' +
      'Timp folosit: ' + (payload.timeUsed || '-') + '\n' +
      scoreSection +
      '\n📄 RĂSPUNSURI DETALIATE (Google Doc — formatat citibil):\n' +
      docUrl + '\n' +
      '\n📊 Sheet centralizator (foaia „' + tabNameFromTest(payload.test) + '"):\n' +
      ss.getUrl() + '\n\n' +
      'JSON brut atașat (backup).\n\n' +
      'ʚଓ Claudia Toth · Curs autorizat ANC';

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
      .createTextOutput(JSON.stringify({ status: 'ok', tab: tabNameFromTest(payload.test), row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const errMsg = '[Examen B2] EROARE la submit (stage: ' + stage + ')';
    const errBody =
      'A aparut o eroare la procesarea unui submit B2.\n\n' +
      'Sesiune: ' + SESIUNE + '\n' +
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
        test: 'Test 2 — Bildung & Studium (TEST INTERN)',
        cursantNume: 'Test',
        cursantPrenume: 'Cursant',
        timeUsed: '45:30',
        answers: { g1: 'denn', g2: 'obwohl', h1: 'b', l1: 'b' },
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
  Logger.log('Sheet URL: ' + getSpreadsheet().getUrl());
}
