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

// ============================================================
// FOLDER + GOOGLE DOC pentru fiecare submit
// ============================================================
const DRIVE_FOLDER_NAME = 'Examen B2 - Raspunsuri Cursanti';

function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

// Etichete pentru fiecare item (afișate în doc)
const ITEM_LABELS = {
  // Konnektoren
  g1: 'Konnektor 1', g2: 'Konnektor 2', g3: 'Konnektor 3', g4: 'Konnektor 4', g5: 'Konnektor 5',
  // Prepoziții
  g6: 'Prepoziție 1', g7: 'Prepoziție 2', g8: 'Prepoziție 3', g9: 'Prepoziție 4', g10: 'Prepoziție 5',
  // Aktiv → Passiv
  g11: 'Passiv 1 (zehn Mitarbeiter)', g12: 'Passiv 2 (Meeting)', g13: 'Passiv 3 (Bericht)',
  g14: 'Passiv 4 (Regel)', g15: 'Passiv 5 (Brot)',
  // Rechtschreibung alegere
  o1: 'Ortografie 1 (Straße)', o2: 'Ortografie 2 (Liebe)', o3: 'Ortografie 3 (schön)',
  o4: 'Ortografie 4 (wohnen)', o5: 'Ortografie 5 (Freund)',
  // Găsește greșeala
  o6: 'Greșeala 1 (zur arbeit)', o7: 'Greșeala 2 (sehr Gut)', o8: 'Greșeala 3 (freunde)',
  o9: 'Greșeala 4 (Schnell)', o10: 'Greșeala 5 (grosse)',
  // Hörverstehen
  h1: 'Hör 1: Wo arbeitet Peter?', h2: 'Hör 2: Warum gewechselt?',
  h3: 'Hör 3: Wie viele Tage Homeoffice?', h4: 'Hör 4: Was empfiehlt Peter?',
  h5: 'Hör 5 (R/F): Anna zufrieden?', h6: 'Hör 6 (R/F): Peter verdient mehr?',
  h7: 'Hör 7 (R/F): Anna will sofort kündigen?', h8: 'Hör 8 (R/F): Treffen sich wieder?',
  // Leseverstehen
  l1: 'Lese 1: Wann Homeoffice entdeckt?', l2: 'Lese 2: Wie viele Firmen flexibel?',
  l3: 'Lese 3: Experimente Island?', l4: 'Lese 4: Problem Homeoffice?',
  l5: 'Lese 5: Branchen Gehälter gestiegen?',
  l6: 'Lese 6: Wie nennt man Arbeit zu Hause?', l7: 'Lese 7: Welches Land Vier-Tage-Woche?',
  l8: 'Lese 8: Was empfehlen Experten?', l9: 'Lese 9: Wie viele Tage?',
  l10: 'Lese 10: Branchen niedrig?'
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

  // Header
  const t1 = body.appendParagraph(test);
  t1.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  t1.editAsText().setForegroundColor('#10B981');

  body.appendParagraph('Cursant: ' + nume + ' ' + prenume);
  body.appendParagraph('Data submit: ' + dataStr);
  body.appendParagraph('Timp folosit: ' + (payload.timeUsed || '-'));
  body.appendHorizontalRule();

  // Scor
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

  // Răspunsuri detaliate per secțiune
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
        if (item.correct) {
          line += '   ✓ corect (' + item.points + '/' + item.max + 'p)';
        } else {
          line += '   ✗ greșit (0/' + item.max + 'p)';
        }
      }
      const p = body.appendParagraph(line);
      if (item && item.correct === false) p.editAsText().setForegroundColor('#dc2626');
      else if (item && item.correct === true) p.editAsText().setForegroundColor('#059669');
    });
  }

  appendSection('GRAMMATIK + RECHTSCHREIBUNG',
    'grammatik',
    ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12','g13','g14','g15',
     'o1','o2','o3','o4','o5','o6','o7','o8','o9','o10']);

  appendSection('HÖRVERSTEHEN', 'hoerverstehen', ['h1','h2','h3','h4','h5','h6','h7','h8']);
  appendSection('LESEVERSTEHEN', 'leseverstehen', ['l1','l2','l3','l4','l5','l6','l7','l8','l9','l10']);

  body.appendHorizontalRule();
  body.appendParagraph('Sheet centralizator: ' + sheetUrl);
  body.appendParagraph('Generat automat de sistemul Examen B2 · ʚଓ Claudia Toth · Curs autorizat ANC');

  doc.saveAndClose();

  // Mută în folderul dedicat
  try {
    const folder = getOrCreateFolder();
    const file = DriveApp.getFileById(doc.getId());
    file.moveTo(folder);
  } catch (mvErr) {}

  return doc.getUrl();
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

    // ---- 5. Google Doc cu răspunsuri (formatat) ----
    stage = 'create-doc';
    let docUrl = '';
    try {
      docUrl = createResponseDoc(payload, sheet.getParent().getUrl());
    } catch (docErr) {
      // Nu lăsăm să crashuim totul dacă doc-ul eșuează
      docUrl = '(doc nu a putut fi creat: ' + docErr.toString() + ')';
    }

    // ---- 6. Email cu scor ----
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
      '\n📄 RĂSPUNSURI DETALIATE (Google Doc — formatat citibil):\n' +
      docUrl + '\n' +
      '\n📊 Sheet centralizator (toți cursanții):\n' +
      sheet.getParent().getUrl() + '\n\n' +
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
