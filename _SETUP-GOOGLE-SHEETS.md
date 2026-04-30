# 📋 Configurare Google Sheets + Email pentru Examen B2

Acest ghid îți arată cum să configurezi un Google Sheet care să primească **automat** răspunsurile cursanților + să-ți trimită un email la fiecare submit.

**Durată setup:** 10-15 minute · **Cost:** 0€ · **Limită:** ~3000 trimiteri/zi (mai mult decât suficient)

---

## 🎯 Ce vei avea la final

1. **Google Sheet** cu un rând per cursant care a trimis examen — coloane: data/ora, nume, prenume, test, răspunsuri pe fiecare întrebare, timp folosit
2. **Email automat** la `etommlearning@gmail.com` la fiecare submit cu toate răspunsurile + atașament JSON
3. **Niciun cost** — totul prin contul tău Google

---

## 📝 PASUL 1 — Creează Google Sheet-ul

1. Deschide [https://sheets.google.com](https://sheets.google.com) (logat cu **etommlearning@gmail.com**)
2. Apasă **„+ Blank"** (nou)
3. Redenumește din „Untitled spreadsheet" în: **`Examen B2 - Răspunsuri Cursanți`**
4. **NU adăuga încă antete** — scriptul le va crea automat

---

## 🔧 PASUL 2 — Adaugă scriptul Apps Script

1. În același Sheet deschis, mergi la meniul **`Extensions` → `Apps Script`**
2. Se va deschide o filă nouă cu un editor de cod
3. **Șterge tot codul** care apare implicit (`function myFunction() {...}`)
4. **Copiază tot codul** de mai jos și **lipește-l** în editor:

```javascript
// ============================================================
// EXAMEN B2 - RECEPTIE RĂSPUNSURI CURSANȚI
// Claudia Toth · etommlearning@gmail.com
// ============================================================

const NOTIFY_EMAIL = 'etommlearning@gmail.com';
const SECRET_TOKEN = 'CT-EXAMEN-B2-2026-X9K3M7';  // securitate minimă

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Verificare token
    if (payload.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Header dinamic — dacă sheet-ul e gol, creează antetele bazat pe răspunsuri
    if (sheet.getLastRow() === 0) {
      const baseHeaders = ['Data trimitere', 'Test', 'Nume', 'Prenume', 'Timp folosit'];
      const answerKeys = Object.keys(payload.answers || {}).sort((a, b) => {
        // sortare logică: g1, g2, ..., h1, h2, ..., l1, l2, ...
        const sectionOrder = { g: 1, h: 2, l: 3 };
        const aSec = sectionOrder[a[0]] || 99;
        const bSec = sectionOrder[b[0]] || 99;
        if (aSec !== bSec) return aSec - bSec;
        return parseInt(a.slice(1)) - parseInt(b.slice(1));
      });
      const headers = baseHeaders.concat(answerKeys);
      sheet.appendRow(headers);
      // Format antet: bold + verde
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold').setBackground('#10B981').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    // Adaugă rândul nou
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

    // Email notificare cu atașament JSON
    const subject = `[Examen B2] Submit nou: ${payload.test || 'Test necunoscut'}`;
    const body = `
Un cursant a trimis examenul B2.

Test: ${payload.test || '-'}
Nume: ${payload.cursantNume || '(necompletat)'}
Prenume: ${payload.cursantPrenume || '(necompletat)'}
Data: ${new Date().toLocaleString('ro-RO')}
Timp folosit: ${payload.timeUsed || '-'}

Răspunsurile complete sunt în Google Sheet-ul tău:
${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

Vezi și fișierul JSON atașat (pentru arhivă).

ʚଓ Claudia Toth · Curs autorizat ANC
`;

    const jsonAttachment = Utilities.newBlob(
      JSON.stringify(payload, null, 2),
      'application/json',
      `raspunsuri-${(payload.test || 'test').replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`
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

// Test în editor (rulezi o dată ca să verifici că merge înainte de deploy)
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
}
```

5. Apasă **`Save`** (icon disketă, sau Ctrl+S)
6. Numește proiectul: **`Examen B2 - Receptie raspunsuri`** și apasă OK

---

## 🚀 PASUL 3 — Publică scriptul ca Web App

1. Apasă butonul albastru **`Deploy` → `New deployment`**
2. La „Select type" (icon ⚙️) → alege **`Web app`**
3. Completează:
   - **Description:** `Examen B2 v1`
   - **Execute as:** `Me (etommlearning@gmail.com)`
   - **Who has access:** `Anyone` ⚠️ (foarte important — altfel cursanții nu pot trimite)
4. Apasă **`Deploy`**
5. Apare un dialog **„Authorize access"** → apasă **`Authorize access`**
6. Alege contul `etommlearning@gmail.com`
7. La avertizarea „Google hasn't verified this app" → apasă **`Advanced` → `Go to Examen B2... (unsafe)`** (e proiectul tău, deci e ok)
8. Apasă **`Allow`** la lista de permisiuni
9. **PRIMEȘTI UN URL** care arată așa:
   ```
   https://script.google.com/macros/s/AKfyc...../exec
   ```
10. **COPIAZĂ URL-UL ACESTA** și trimite-mi-l mie

---

## ✅ PASUL 4 — Test rapid (opțional, dar recomandat)

Înainte să-mi dai URL-ul, testează că funcționează:

1. În editor Apps Script, în partea de sus, alege funcția **`testFunction`** din dropdown
2. Apasă **`Run`** (▶)
3. Dacă apare „Execution completed", verifică:
   - **Sheet-ul tău** → ar trebui să apară un rând nou cu „Test Cursant"
   - **Email-ul tău** → ar trebui să primești un mail cu subiect „[Examen B2] Submit nou: Test 1 — Arbeit & Beruf (TEST INTERN)"

Dacă ambele funcționează → totul e ok, trimite-mi URL-ul de la Pasul 3.

---

## 🔐 Securitate

- URL-ul Web App e public, dar cere un **token secret** (`CT-EXAMEN-B2-2026-X9K3M7`) ca să accepte submit-uri
- Tokenul e codificat în `test.js` — un cursant care inspectează codul l-ar putea afla, dar nu e o problemă pentru un examen (cursantul oricum trimite oficial prin formular)
- Dacă vreodată vrei să schimbi tokenul, schimbă-l în Apps Script + îmi spui și-l schimb și în `test.js`

---

## 📞 Ce-mi trimiți la final

- **URL-ul Web App** primit la Pasul 3 (linia care începe cu `https://script.google.com/macros/s/...`)

Atât. Mai departe configurez eu test.js să trimită automat la el.

---

## ❓ Întrebări frecvente

**Q: Dacă fac modificări în script mai târziu, trebuie să fac din nou Deploy?**
A: Da, dar de la „Manage deployments" → editezi versiunea existentă → apare URL nou doar dacă bifezi „New deployment". Pentru update simplu, alegi „Edit existing" → versiune nouă, URL-ul rămâne același.

**Q: Pot folosi același sheet pentru toate cele 10 teste?**
A: Da! Scriptul detectează automat la ce test e răspunsul și pune toate într-un singur tabel. Poți filtra după coloana „Test".

**Q: Dacă vreau emailuri și pentru un al doilea profesor?**
A: Schimbi linia `const NOTIFY_EMAIL = 'etommlearning@gmail.com';` în `'etommlearning@gmail.com,profesor2@gmail.com'` (separate prin virgulă).

**Q: Dacă cursantul închide accidental browserul în mijlocul examenului?**
A: Răspunsurile se salvează automat în browserul lui (localStorage) — la redeschidere, le recuperează. Ce nu apucă să trimită rămâne local. (Asta e protecția implementată deja în `test.js`.)
