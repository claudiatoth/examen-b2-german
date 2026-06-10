// ============================================
// EXAMEN B2 - TEST 5 (Gesundheit)
// Claudia Toth · Curs autorizat ANC · © 2026
// IMPORTANT: cursantul NU vede răspunsurile corecte sau scorul!
// Răspunsurile + scorul automat sunt trimise la examinator (email + Sheet).
// Sprechen e cotat manual (oral) — nu intră în scorul automat.
// ============================================

const TEST_ID = 'examen-b2-test-6';
const TEST_DURATION_SECONDS = 60 * 60;
const MAX_AUDIO_PLAYS = 2;

const SUBMIT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyKx7lFeOajnwA9HKQ03gnu_pWoT7c_jyq9XY8KfvrBE_GJIyANIBP7FB-VNp39tqRM/exec';
const SUBMIT_TOKEN = 'CT-EXAMEN-B2-2026-X9K3M7';

// ============================================
// GRILA DE CORECTARE — toate răspunsurile corecte
// ============================================
// Punctaj total: 100 = 10 oficiu + 30 Grammatik + 20 Hörverstehen + 25 Leseverstehen + 15 Sprechen (manual)
// Auto-scor maxim: 85p (oficiu + Grammatik + Hörverstehen + Leseverstehen)
const ANSWER_KEY = {
    // ---- A. Konnektoren (5 × 1p = 5p) ----
    g1: { correct: ['weil'], points: 1 },         // ...buchen Pauschalreisen, weil alles im Preis inbegriffen ist
    g2: { correct: ['obwohl'], points: 1 },       // Obwohl Fliegen schnell ist, hat es einen großen CO₂-Fußabdruck
    g3: { correct: ['deshalb'], points: 1 },      // Massentourismus schadet der Umwelt, deshalb führen viele Städte Tourismussteuern ein
    g4: { correct: ['denn'], points: 1 },         // Andreea reist nur mit dem Zug, denn sie das Klima schützen möchte
    g5: { correct: ['trotzdem'], points: 1 },     // Kreuzfahrten sind sehr umweltbelastend, trotzdem sind sie bei Rentnern beliebt

    // ---- B. Prepoziții (5 × 1p = 5p) ----
    g6:  { correct: ['b'], points: 1 },  // nach + nume țară (Italien) — destinație
    g7:  { correct: ['c'], points: 1 },  // sich freuen AUF + Akk (die nächste Reise)
    g8:  { correct: ['b'], points: 1 },  // wegen + Genitiv (der Verspätung — fem.)
    g9:  { correct: ['a'], points: 1 },  // mit + Dat (mit ihrer Schwester)
    g10: { correct: ['d'], points: 1 },  // statt + Genitiv (des Flugzeugs — neutru)

    // ---- C. Aktiv → Passiv (5 × 2p = 10p) ----
    g11: { correct: [
        'der flug wird vom reisebüro gebucht',
        'der flug wird gebucht',
        'der flug wird von dem reisebüro gebucht',
        'der flug wird vom reisebuero gebucht',
        'der flug wird von dem reisebuero gebucht'
    ], points: 2 },
    g12: { correct: [
        'venedig wird von vielen touristen besucht',
        'venedig wird besucht',
        'venedig wird von touristen besucht'
    ], points: 2 },
    g13: { correct: [
        'eine tourismussteuer wird von der stadt eingeführt',
        'eine tourismussteuer wird eingeführt',
        'eine tourismussteuer wird von der stadt eingefuehrt',
        'eine tourismussteuer wird eingefuehrt'
    ], points: 2 },
    g14: { correct: [
        'die tour wird vom reiseführer geplant',
        'die tour wird geplant',
        'die tour wird von dem reiseführer geplant',
        'die tour wird vom reisefuehrer geplant',
        'die tour wird von dem reisefuehrer geplant'
    ], points: 2 },
    g15: { correct: [
        'die reisekosten werden durch backpacking reduziert',
        'die reisekosten werden reduziert',
        'die reisekosten werden vom backpacking reduziert'
    ], points: 2 },

    // ---- D. Rechtschreibung — alegere (5 × 1p = 5p) ----
    o1: { correct: ['b'], points: 1 },  // Reisepläne (cu ä Umlaut)
    o2: { correct: ['b'], points: 1 },  // Reiseführer (cu ü)
    o3: { correct: ['b'], points: 1 },  // Strände (cu ä)
    o4: { correct: ['b'], points: 1 },  // große (cu ß)
    o5: { correct: ['b'], points: 1 },  // Gepäck (cu ä)

    // ---- E. Găsește greșeala — rescrie corect (5 × 1p = 5p) ----
    o6:  { correct: ['schön'], wrong: 'Schön', right: 'schön', points: 1, strictUmlaut: false },    // adjectiv literă mică (după verb)
    o7:  { correct: ['reisepass'], wrong: 'reisepass', right: 'Reisepass', points: 1 },              // substantiv literă mare
    o8:  { correct: ['zug'], wrong: 'zug', right: 'Zug', points: 1 },                                // substantiv literă mare
    o9:  { correct: ['buche'], wrong: 'Buche', right: 'buche', points: 1 },                          // verb la mijloc cu literă mică
    o10: { correct: ['besuchen'], wrong: 'Besuchen', right: 'besuchen', points: 1 },                 // verb la mijloc cu literă mică

    // ---- 2. Hörverstehen ----
    // h1-h4 (multiple choice, 4 × 3p = 12p)
    h1: { correct: ['b'], points: 3 },  // Slow Travel și călătorii sustenabile
    h2: { correct: ['b'], points: 3 },  // Massentourismus și consecințele lui
    h3: { correct: ['b'], points: 3 },  // Cu trenul (ICE / Nachtzug)
    h4: { correct: ['b'], points: 3 },  // Vacanță în țara natală — ieftin și sustenabil

    // h5-h8 (Richtig/Falsch, 4 × 2p = 8p)
    h5: { correct: ['R'], points: 2 },  // 10 ani experiență
    h6: { correct: ['R'], points: 2 },  // DA, Venedig și Mallorca au introdus taxe turistice
    h7: { correct: ['F'], points: 2 },  // FALSE — ea reduce zborurile (NU 5 ori/an)
    h8: { correct: ['R'], points: 2 },  // DA, Workation = Arbeit + Urlaub la aceeași locație

    // ---- 3. Leseverstehen ----
    // l1-l5 (multiple choice, 5 × 3p = 15p)
    l1: { correct: ['c'], points: 3 },  // 10 Euro
    l2: { correct: ['b'], points: 3 },  // 14,4 Millionen
    l3: { correct: ['b'], points: 3 },  // Maximal drei
    l4: { correct: ['b'], points: 3 },  // Slow Travel, Eco-Tourismus, Heimaturlaub
    l5: { correct: ['b'], points: 3 },  // Qualität statt Quantität

    // l6-l10 (răspuns scurt, 5 × 2p = 10p)
    l6:  { correct: [
        'venedig',
        'die stadt venedig'
    ], points: 2 },
    l7:  { correct: [
        'tu wien',
        'die tu wien',
        'technische universität wien',
        'technische universitaet wien',
        'tu von wien',
        'wien'
    ], points: 2 },
    l8:  { correct: [
        '46',
        '46%',
        '46 prozent',
        'sechsundvierzig prozent',
        'sechsundvierzig'
    ], points: 2 },
    l9:  { correct: [
        'universität hamburg',
        'die universität hamburg',
        'hamburg',
        'an der universität hamburg',
        'universitaet hamburg',
        'an der universitaet hamburg',
        'uni hamburg'
    ], points: 2 },
    l10: { correct: [
        // Acceptăm orice combinație de 3 exemple din: steigende Mieten, überfüllte Straßen, Wassermangel, Müllprobleme, Umweltbelastung, Einheimische ziehen weg
        'steigende mieten überfüllte straßen wassermangel',
        'steigende mieten ueberfuellte strassen wassermangel',
        'steigende mieten müllprobleme umweltbelastung',
        'steigende mieten muellprobleme umweltbelastung',
        'mieten straßen müll',
        'mieten strassen muell',
        'wassermangel müll umweltbelastung',
        'wassermangel muell umweltbelastung',
        'überfüllte straßen wassermangel müllprobleme',
        'ueberfuellte strassen wassermangel muellprobleme',
        'mieten wassermangel umweltbelastung',
        'mieten ueberfuellte strassen wassermangel',
        // forme cu virgule
        'steigende mieten, überfüllte straßen, wassermangel',
        'steigende mieten, müllprobleme, umweltbelastung',
        'mieten, straßen, müll',
        'wassermangel, müll, umweltbelastung'
    ], points: 2 }
};

const SECTIONS = {
    grammatik: ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12','g13','g14','g15','o1','o2','o3','o4','o5','o6','o7','o8','o9','o10'],
    hoerverstehen: ['h1','h2','h3','h4','h5','h6','h7','h8'],
    leseverstehen: ['l1','l2','l3','l4','l5','l6','l7','l8','l9','l10']
};

const SECTION_MAX = { grammatik: 30, hoerverstehen: 20, leseverstehen: 25, sprechen: 15, oficiu: 10 };

// ============================================
// TIMER
// ============================================
let secondsLeft = TEST_DURATION_SECONDS;
let timerInterval = null;

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function startTimer() {
    const display = document.getElementById('timer');
    timerInterval = setInterval(() => {
        secondsLeft--;
        if (display) display.textContent = formatTime(secondsLeft);
        if (secondsLeft <= 600 && display) display.style.color = '#fef3c7';
        if (secondsLeft <= 60 && display) display.style.color = '#fee2e2';
        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            alert('Timpul a expirat! Examenul se trimite automat.');
            submitExam();
        }
        if (secondsLeft % 5 === 0) saveAnswers();
    }, 1000);
}

// ============================================
// AUDIO
// ============================================
const audioPlayCount = { 'audio-1': 0 };

function playAudio(audioId) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
    const playsLeft = MAX_AUDIO_PLAYS - audioPlayCount[audioId];
    if (playsLeft <= 0) {
        alert('Ai folosit toate ascultările pentru acest audio.');
        return;
    }
    audio.play().then(() => {
        audioPlayCount[audioId]++;
        updatePlaysLeft(audioId);
    }).catch(err => {
        alert('Audio-ul nu este disponibil momentan. Contactează examinatorul.');
        console.log('Audio error:', err);
    });
    audio.onended = () => updatePlaysLeft(audioId);
}

function pauseAudio(audioId) {
    const audio = document.getElementById(audioId);
    if (audio) audio.pause();
}

function updatePlaysLeft(audioId) {
    const num = audioId.split('-')[1];
    const span = document.getElementById('plays-' + num);
    if (span) {
        const left = MAX_AUDIO_PLAYS - audioPlayCount[audioId];
        span.textContent = `Ascultări rămase: ${left}`;
        if (left === 0) span.style.color = '#dc2626';
    }
}

// ============================================
// SAVE / LOAD
// ============================================
function collectAnswers() {
    const answers = {};
    document.querySelectorAll('input[type="text"]').forEach(inp => {
        if (inp.name) answers[inp.name] = inp.value.trim();
    });
    document.querySelectorAll('input[type="radio"]:checked').forEach(rad => {
        answers[rad.name] = rad.value;
    });
    return answers;
}

function saveAnswers() {
    try {
        const data = { timestamp: new Date().toISOString(), secondsLeft: secondsLeft, answers: collectAnswers() };
        localStorage.setItem(TEST_ID, JSON.stringify(data));
    } catch (e) { console.log('Save error:', e); }
}

function loadAnswers() {
    try {
        const raw = localStorage.getItem(TEST_ID);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data.answers) return;
        Object.keys(data.answers).forEach(name => {
            const txt = document.querySelector(`input[type="text"][name="${name}"]`);
            if (txt) { txt.value = data.answers[name]; return; }
            const rad = document.querySelector(`input[type="radio"][name="${name}"][value="${data.answers[name]}"]`);
            if (rad) rad.checked = true;
        });
    } catch (e) { console.log('Load error:', e); }
}

// ============================================
// CALCUL SCOR AUTOMAT
// ============================================
function normalize(s, flexUmlaut = true) {
    let r = (s || '').toString().trim().toLowerCase();
    // contractii prepozitie+articol: forma lunga = forma contrasa (von dem = vom etc.)
    r = r.replace(/\bvon dem\b/g, 'vom').replace(/\bbei dem\b/g, 'beim').replace(/\bzu dem\b/g, 'zum').replace(/\bzu der\b/g, 'zur').replace(/\bin dem\b/g, 'im').replace(/\ban dem\b/g, 'am').replace(/\bin das\b/g, 'ins').replace(/\ban das\b/g, 'ans').replace(/\bauf das\b/g, 'aufs').replace(/\bdurch das\b/g, 'durchs').replace(/\bfür das\b/g, 'fürs').replace(/\bum das\b/g, 'ums').replace(/\bvor dem\b/g, 'vorm').replace(/\büber das\b/g, 'übers');
    if (flexUmlaut) {
        r = r.replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
    }
    return r.replace(/\s+/g, ' ').replace(/^[\s.,;:!?]+|[\s.,;:!?]+$/g, '');
}

function isCorrect(itemKey, userValue) {
    const item = ANSWER_KEY[itemKey];
    if (!item) return false;
    const flex = !item.strictUmlaut;
    const userNorm = normalize(userValue, flex);
    if (!userNorm) return false;
    return item.correct.some(c => normalize(c, flex) === userNorm);
}

function computeScore(answers) {
    const detail = { grammatik: { correct: 0, total: 0, items: {} }, hoerverstehen: { correct: 0, total: 0, items: {} }, leseverstehen: { correct: 0, total: 0, items: {} } };
    let scoreGrammatik = 0, scoreHoeren = 0, scoreLesen = 0;

    SECTIONS.grammatik.forEach(k => {
        const ok = isCorrect(k, answers[k]);
        const pts = ok ? ANSWER_KEY[k].points : 0;
        scoreGrammatik += pts;
        detail.grammatik.total += ANSWER_KEY[k].points;
        if (ok) detail.grammatik.correct += 1;
        detail.grammatik.items[k] = { answer: answers[k] || '', correct: ok, points: pts, max: ANSWER_KEY[k].points };
    });
    SECTIONS.hoerverstehen.forEach(k => {
        const ok = isCorrect(k, answers[k]);
        const pts = ok ? ANSWER_KEY[k].points : 0;
        scoreHoeren += pts;
        detail.hoerverstehen.total += ANSWER_KEY[k].points;
        if (ok) detail.hoerverstehen.correct += 1;
        detail.hoerverstehen.items[k] = { answer: answers[k] || '', correct: ok, points: pts, max: ANSWER_KEY[k].points };
    });
    SECTIONS.leseverstehen.forEach(k => {
        const ok = isCorrect(k, answers[k]);
        const pts = ok ? ANSWER_KEY[k].points : 0;
        scoreLesen += pts;
        detail.leseverstehen.total += ANSWER_KEY[k].points;
        if (ok) detail.leseverstehen.correct += 1;
        detail.leseverstehen.items[k] = { answer: answers[k] || '', correct: ok, points: pts, max: ANSWER_KEY[k].points };
    });

    const oficiu = SECTION_MAX.oficiu;
    const totalAuto = oficiu + scoreGrammatik + scoreHoeren + scoreLesen;
    return {
        oficiu: oficiu,
        grammatik: scoreGrammatik,
        grammatikMax: SECTION_MAX.grammatik,
        hoerverstehen: scoreHoeren,
        hoerverstehenMax: SECTION_MAX.hoerverstehen,
        leseverstehen: scoreLesen,
        leseverstehenMax: SECTION_MAX.leseverstehen,
        sprechen: null,
        sprechenMax: SECTION_MAX.sprechen,
        totalAuto: totalAuto,
        totalAutoMax: 85,
        totalPotential: 100,
        procentAuto: Math.round((totalAuto / 85) * 100),
        detail: detail
    };
}

// ============================================
// SUBMIT
// ============================================
function submitExam() {
    const answers = collectAnswers();
    const totalQuestions = SECTIONS.grammatik.length + SECTIONS.hoerverstehen.length + SECTIONS.leseverstehen.length;
    const answeredCount = Object.values(answers).filter(v => v && v.length > 0).length;

    if (answeredCount < totalQuestions) {
        const proceed = confirm(`Ai răspuns la ${answeredCount} din ${totalQuestions} întrebări. Sigur vrei să trimiți examenul acum?`);
        if (!proceed) return;
    }

    const modal = document.getElementById('identity-modal');
    modal.style.display = 'flex';
    setTimeout(() => {
        const nume = document.getElementById('modal-nume');
        if (nume) nume.focus();
    }, 50);
}

function cancelSubmit() {
    document.getElementById('identity-modal').style.display = 'none';
}

async function confirmSubmit() {
    const numeInput = document.getElementById('modal-nume');
    const prenumeInput = document.getElementById('modal-prenume');
    const errorBox = document.getElementById('modal-error');
    const nume = numeInput.value.trim();
    const prenume = prenumeInput.value.trim();

    if (!nume || !prenume) {
        errorBox.style.display = 'block';
        if (!nume) numeInput.style.borderColor = '#dc2626';
        if (!prenume) prenumeInput.style.borderColor = '#dc2626';
        return;
    }
    errorBox.style.display = 'none';

    const answers = collectAnswers();
    saveAnswers();
    if (timerInterval) clearInterval(timerInterval);

    const score = computeScore(answers);

    const submission = {
        token: SUBMIT_TOKEN,
        test: 'Test 6 — Reisen & Tourismus',
        cursantNume: nume,
        cursantPrenume: prenume,
        submittedAt: new Date().toLocaleString('ro-RO'),
        timeUsed: formatTime(TEST_DURATION_SECONDS - secondsLeft),
        answers: answers,
        score: score
    };

    document.getElementById('identity-modal').style.display = 'none';
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Se trimite examenul...';
    }

    let success = false;
    try {
        await fetch(SUBMIT_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(submission)
        });
        success = true;
    } catch (err) {
        console.log('Submit error:', err);
        success = false;
    }

    try {
        const cursantBackup = { ...submission };
        delete cursantBackup.score;
        const blob = new Blob([JSON.stringify(cursantBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raspunsuri-test-6-${nume}-${Date.now()}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) { console.log('Download error:', e); }

    document.getElementById('exam-content').style.display = 'none';
    document.getElementById('submitted').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        localStorage.removeItem(TEST_ID);
        /* lock reluare dezactivat — nu mai marcam testul ca trimis permanent */
    } catch (e) {}

    if (!success) {
        setTimeout(() => {
            alert('A apărut o problemă la trimiterea online, dar răspunsurile au fost salvate local ca fișier JSON. Te rog trimite acel fișier prin email la etommlearning@gmail.com.');
        }, 500);
    }
}

window.addEventListener('beforeunload', (e) => {
    const ans = collectAnswers();
    const filled = Object.values(ans).filter(v => v && v.length > 0).length;
    if (filled > 0 && document.getElementById('submitted').style.display !== 'block') {
        e.preventDefault();
        e.returnValue = '';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'resetCT2026') {
            localStorage.clear();
            window.history.replaceState({}, '', window.location.pathname);
        }
    } catch (e) {}

    try {
        if (false) {  // lock reluare DEZACTIVAT — testul poate fi reluat
            document.getElementById('exam-content').style.display = 'none';
            document.getElementById('submitted').style.display = 'block';
            return;
        }
    } catch (e) {}

    loadAnswers();
    startTimer();
    document.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('change', saveAnswers);
        inp.addEventListener('blur', saveAnswers);
    });
});
