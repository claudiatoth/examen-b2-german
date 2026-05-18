# 📋 Procedură: actualizare Apps Script la v5 (tab/test + sesiuni)

## Ce face v5 (nou față de v4)

- **1 Google Sheet** rămâne (același link, același endpoint, aceleași 10 test.js — NIMIC nu se schimbă în teste)
- **Tab (foaie) separat per Test** — Test 1 scrie în foaia „Test 1", Test 2 în „Test 2" etc. (create automat)
- **Coloană „Sesiune"** — filtrezi pe sesiunea curentă
- **Google Doc per cursant** → folder ierarhic: `Examen B2 - Raspunsuri Cursanti / Iulie 2026 / Test 2 / {Nume}`

---

## 🔧 PASUL 1 — Actualizează codul Apps Script

1. Deschide https://script.google.com → proiectul tău Examen B2
2. Șterge TOT codul existent din editor
3. Copiază TOT conținutul din `_apps-script-code.gs` (fișierul actualizat) → lipește în editor
4. **Salvează** (Ctrl+S sau iconița floppy disk)

## 🔧 PASUL 2 — Redeployment (URL-ul rămâne ACELAȘI)

⚠️ **NU face „New deployment"** (ar genera URL nou → ar trebui să schimb cele 10 test.js). În schimb:

1. Click **Deploy** (dreapta sus) → **Manage deployments**
2. La deployment-ul existent, click iconița **creion (✏️ Edit)**
3. La „Version" alege **New version**
4. Click **Deploy**
5. URL-ul rămâne identic ✅

## 🔧 PASUL 3 — Test rapid

1. În editor, sus, din dropdown alege funcția **`testFunction`**
2. Click **▶ Run**
3. Prima rulare cere permisiuni → **Review permissions** → contul tău → **Advanced** → „Go to ... (unsafe)" → **Allow** (Drive + Docs + Sheets + Mail)
4. Verifică:
   - În Google Sheet a apărut o foaie nouă **„Test 2"** cu un rând test
   - În Drive: folder `Examen B2 - Raspunsuri Cursanti / Iulie 2026 / Test 2 /` cu un Doc
   - Email de test la `etommlearning@gmail.com`
5. Șterge rândul de test din foaie + Doc-ul de test din Drive (erau doar verificare)

---

## 🔄 La FIECARE sesiune nouă de examinare (procedură simplă)

1. Deschide Apps Script
2. Schimbă **o singură linie** (sus de tot):
   ```js
   const SESIUNE = 'Ianuarie 2027';   // ← era 'Iulie 2026'
   ```
3. Salvează (Ctrl+S)
4. **Deploy → Manage deployments → Edit (✏️) → New version → Deploy**
5. Gata. De acum toate submiturile merg în coloana „Sesiune = Ianuarie 2027" + folder nou `.../Ianuarie 2027/`

---

## 📊 Cum corectezi (workflow)

1. Email → deschizi Google Doc-ul cursantului (link în email)
2. Vezi scorul auto (85p) + răspunsurile detaliate colorate (verde=corect, roșu=greșit)
3. Cotezi oral **Sprechen (15p)** după rubrica din `test-N-examinator.pdf`
4. Deschizi Sheet → foaia testului → filtrezi după „Sesiune" → completezi manual coloanele **Sprechen**, **TOTAL FINAL**, **Promovat?**
5. Doc-urile sunt deja arhivate pe sesiune/test în Drive (pentru evidența ANC)

---

## ⚠️ Note importante

- **Datele Test 1 vechi** (dacă există submituri reale în foaia default) NU se pierd — rămân în prima foaie. De acum Test 1 va scrie în foaia dedicată „Test 1". Dacă vrei, le poți muta manual.
- **Cele 10 test.js NU se modifică** — endpoint + token identice. Doar Apps Script-ul se actualizează.
- Dacă schimbi `SESIUNE` dar uiți să faci redeployment → submiturile vor avea în continuare sesiunea veche. Redeployment-ul e obligatoriu.
