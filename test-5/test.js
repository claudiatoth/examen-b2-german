// ============================================
// EXAMEN B2 - TEST 5 (Gesundheit)
// Claudia Toth · Curs autorizat ANC · © 2026
// IMPORTANT: cursantul NU vede răspunsurile corecte sau scorul!
// Răspunsurile + scorul automat sunt trimise la examinator (email + Sheet).
// Sprechen e cotat manual (oral) — nu intră în scorul automat.
// ============================================

const TEST_ID = 'examen-b2-test-5';
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
    g1: { correct: ['weil'], points: 1 },         // ...treiben keinen Sport, weil sie keine Zeit haben
    g2: { correct: ['obwohl'], points: 1 },       // Obwohl Bewegung gesund ist, sitzen wir oft zu lange
    g3: { correct: ['deshalb'], points: 1 },      // Stress kann krank machen, deshalb sollte man Pausen machen
    g4: { correct: ['denn'], points: 1 },         // Mihai geht jeden Tag spazieren, denn er sich fit halten will
    g5: { correct: ['trotzdem'], points: 1 },     // Sport kann süchtig machen, trotzdem ist er wichtig

    // ---- B. Prepoziții (5 × 1p = 5p) ----
    g6:  { correct: ['b'], points: 1 },  // leiden UNTER + Dat (Stress)
    g7:  { correct: ['c'], points: 1 },  // sich Sorgen machen UM + Akk (Gesundheit)
    g8:  { correct: ['c'], points: 1 },  // wegen + Genitiv (der Erkältung)
    g9:  { correct: ['b'], points: 1 },  // hilft GEGEN + Akk (Übergewicht)
    g10: { correct: ['d'], points: 1 },  // während + Genitiv (des Trainings)

    // ---- C. Aktiv → Passiv (5 × 2p = 10p) ----
    g11: { correct: [
        'das medikament wird vom hausarzt verschrieben',
        'das medikament wird verschrieben',
        'das medikament wird von dem hausarzt verschrieben'
    ], points: 2 },
    g12: { correct: [
        'regelmäßig wird von vielen menschen sport getrieben',
        'regelmäßig wird sport getrieben',
        'sport wird regelmäßig von vielen menschen getrieben',
        'sport wird regelmäßig getrieben',
        'von vielen menschen wird regelmäßig sport getrieben'
    ], points: 2 },
    g13: { correct: [
        'vitamine werden von der apotheke verkauft',
        'vitamine werden verkauft'
    ], points: 2 },
    g14: { correct: [
        'das programm wird vom trainer geplant',
        'das programm wird geplant',
        'das programm wird von dem trainer geplant'
    ], points: 2 },
    g15: { correct: [
        'das immunsystem wird von einer guten ernährung gestärkt',
        'das immunsystem wird gestärkt',
        'das immunsystem wird durch eine gute ernährung gestärkt'
    ], points: 2 },

    // ---- D. Rechtschreibung — alegere (5 × 1p = 5p) ----
    o1: { correct: ['a'], points: 1 },  // gesund (cu u scurt)
    o2: { correct: ['b'], points: 1 },  // Ernährung (cu ä)
    o3: { correct: ['b'], points: 1 },  // Müdigkeit (cu ü)
    o4: { correct: ['b'], points: 1 },  // weiße (cu ß)
    o5: { correct: ['b'], points: 1 },  // Erkältung (cu ä)

    // ---- E. Găsește greșeala — rescrie corect (5 × 1p = 5p) ----
    o6:  { correct: ['gesund'], wrong: 'Gesund', right: 'gesund', points: 1 },              // adjectiv literă mică (după verb)
    o7:  { correct: ['arzt'], wrong: 'arzt', right: 'Arzt', points: 1 },                    // substantiv literă mare
    o8:  { correct: ['oft'], wrong: 'ofen', right: 'oft', points: 1 },                      // typo (ofen → oft)
    o9:  { correct: ['brauchen'], wrong: 'Brauchen', right: 'brauchen', points: 1 },        // verb la mijloc cu literă mică
    o10: { correct: ['empfehlen'], wrong: 'Empfehlen', right: 'empfehlen', points: 1 },     // verb la mijloc cu literă mică

    // ---- 2. Hörverstehen ----
    // h1-h4 (multiple choice, 4 × 3p = 12p)
    h1: { correct: ['b'], points: 3 },  // Ausgewogene Ernährung + regelmäßige Bewegung (NU diete stricte)
    h2: { correct: ['b'], points: 3 },  // 2,5 Stunden moderate Bewegung pro Woche
    h3: { correct: ['b'], points: 3 },  // Diete stricte → Jo-Jo-Effekt
    h4: { correct: ['b'], points: 3 },  // Achtsamkeit + Pausen + Schlaf

    // h5-h8 (Richtig/Falsch, 4 × 2p = 8p)
    h5: { correct: ['R'], points: 2 },  // 15 ani experiență
    h6: { correct: ['F'], points: 2 },  // NU 8 ore (recomandă 7-9, dar mai ales calitatea)
    h7: { correct: ['F'], points: 2 },  // Vegană NU automat sănătoasă (depinde de echilibru)
    h8: { correct: ['R'], points: 2 },  // DA, Spaziergänge și Treppensteigen contează ca mișcare

    // ---- 3. Leseverstehen ----
    // l1-l5 (multiple choice, 5 × 3p = 15p)
    l1: { correct: ['c'], points: 3 },  // 11,7 Millionen
    l2: { correct: ['b'], points: 3 },  // 42%
    l3: { correct: ['b'], points: 3 },  // 2,5 Stunden moderate Bewegung
    l4: { correct: ['b'], points: 3 },  // Übertraining, Sportverletzungen, Sportsucht
    l5: { correct: ['b'], points: 3 },  // Regelmäßigkeit + Spaß

    // l6-l10 (răspuns scurt, 5 × 2p = 10p)
    l6:  { correct: [
        'deutschland',
        'germania',
        'die brd',
        'brd'
    ], points: 2 },
    l7:  { correct: [
        'deutsche sporthochschule köln',
        'sporthochschule köln',
        'sporthochschule koeln',
        'die deutsche sporthochschule köln',
        'köln',
        'koeln',
        'deutsche sporthochschule koeln'
    ], points: 2 },
    l8:  { correct: [
        '58',
        '58%',
        '58 prozent',
        'achtundfünfzig prozent',
        'achtundfünfzig',
        'achtundfuenfzig'
    ], points: 2 },
    l9:  { correct: [
        'charité berlin',
        'die charité berlin',
        'charité',
        'an der charité berlin',
        'an der charité',
        'charite berlin',
        'charite'
    ], points: 2 },
    l10: { correct: [
        // Acceptăm orice combinație de 2-3 exemple din: Radfahren zur Arbeit, Spaziergänge, Gartenarbeit, Treppensteigen, Joggen im Park, Wandern, Yoga
        'radfahren spaziergänge gartenarbeit',
        'radfahren spaziergänge treppensteigen',
        'radfahren spaziergaenge gartenarbeit',
        'radfahren spaziergaenge treppensteigen',
        'spaziergänge radfahren gartenarbeit',
        'spaziergaenge radfahren gartenarbeit',
        'joggen wandern radfahren',
        'spaziergang radfahren gartenarbeit',
        'treppensteigen radfahren gartenarbeit',
        'spaziergänge treppensteigen radfahren',
        'spaziergaenge treppensteigen radfahren',
        'joggen wandern treppensteigen',
        'wandern radfahren joggen',
        'radfahren wandern joggen',
        'radfahren gartenarbeit spaziergänge',
        'spaziergänge gartenarbeit radfahren',
        'spaziergaenge gartenarbeit radfahren',
        'spaziergang joggen treppensteigen',
        'joggen spaziergang radfahren',
        'spaziergänge nach dem essen joggen im park gartenarbeit',
        // forme cu virgule
        'radfahren, spaziergänge, gartenarbeit',
        'radfahren, spaziergänge, treppensteigen',
        'spaziergänge, radfahren, gartenarbeit',
        'joggen, wandern, radfahren',
        'spaziergänge, gartenarbeit, treppensteigen'
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
        test: 'Test 5 — Gesundheit',
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
        a.download = `raspunsuri-test-5-${nume}-${Date.now()}.json`;
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
