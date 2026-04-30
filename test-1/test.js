// ============================================
// EXAMEN B2 - TEST 1 (Arbeit & Beruf)
// Claudia Toth · Curs autorizat ANC · © 2026
// IMPORTANT: cursantul NU vede răspunsurile corecte sau scorul!
// Toate răspunsurile sunt salvate în localStorage pentru recuperare în caz de refresh.
// ============================================

const TEST_ID = 'examen-b2-test-1';
const TEST_DURATION_SECONDS = 60 * 60; // 60 minute
const MAX_AUDIO_PLAYS = 2; // fiecare audio poate fi ascultat de cel mult 2 ori

// Endpoint Google Apps Script (primește răspunsurile + trimite email + salvează în Sheet)
const SUBMIT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyKx7lFeOajnwA9HKQ03gnu_pWoT7c_jyq9XY8KfvrBE_GJIyANIBP7FB-VNp39tqRM/exec';
const SUBMIT_TOKEN = 'CT-EXAMEN-B2-2026-X9K3M7';

// ============================================
// TIMER (60 min)
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
        // schimbă culoarea când rămân < 10 min
        if (secondsLeft <= 600 && display) {
            display.style.color = '#fef3c7';
        }
        if (secondsLeft <= 60 && display) {
            display.style.color = '#fee2e2';
        }
        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            alert('Timpul a expirat! Examenul se trimite automat.');
            submitExam();
        }
        // auto-save la fiecare 5 secunde
        if (secondsLeft % 5 === 0) saveAnswers();
    }, 1000);
}

// ============================================
// AUDIO — limitare la 2 ascultări per audio
// ============================================
const audioPlayCount = { 'audio-1': 0, 'audio-2': 0 };

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
// SAVE / LOAD răspunsuri (localStorage)
// ============================================
function collectAnswers() {
    const answers = {};
    // Inputuri text
    document.querySelectorAll('input[type="text"]').forEach(inp => {
        if (inp.name) answers[inp.name] = inp.value.trim();
    });
    // Radio
    document.querySelectorAll('input[type="radio"]:checked').forEach(rad => {
        answers[rad.name] = rad.value;
    });
    return answers;
}

function saveAnswers() {
    try {
        const data = {
            timestamp: new Date().toISOString(),
            secondsLeft: secondsLeft,
            answers: collectAnswers()
        };
        localStorage.setItem(TEST_ID, JSON.stringify(data));
    } catch (e) {
        console.log('Nu s-au putut salva răspunsurile:', e);
    }
}

function loadAnswers() {
    try {
        const raw = localStorage.getItem(TEST_ID);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data.answers) return;
        // restore text
        Object.keys(data.answers).forEach(name => {
            const txt = document.querySelector(`input[type="text"][name="${name}"]`);
            if (txt) { txt.value = data.answers[name]; return; }
            const rad = document.querySelector(`input[type="radio"][name="${name}"][value="${data.answers[name]}"]`);
            if (rad) rad.checked = true;
        });
    } catch (e) {
        console.log('Eroare load:', e);
    }
}

// ============================================
// SUBMIT — trimite răspunsurile la Google Sheets + email automat
// Cursantul NU vede scorul — doar mesaj de confirmare
// ============================================
async function submitExam() {
    const answers = collectAnswers();
    const totalQuestions = 33;
    const answeredCount = Object.values(answers).filter(v => v && v.length > 0).length;

    if (answeredCount < totalQuestions) {
        const proceed = confirm(`Ai răspuns la ${answeredCount} din ${totalQuestions} întrebări. Sigur vrei să trimiți examenul acum?`);
        if (!proceed) return;
    }

    // Cere numele și prenumele (examinatorul trebuie să știe cine a trimis)
    let nume = prompt('Introdu numele tău (de familie):');
    if (!nume) {
        alert('Numele este obligatoriu pentru a trimite examenul.');
        return;
    }
    let prenume = prompt('Introdu prenumele tău:');
    if (!prenume) {
        alert('Prenumele este obligatoriu pentru a trimite examenul.');
        return;
    }

    saveAnswers();
    if (timerInterval) clearInterval(timerInterval);

    const submission = {
        token: SUBMIT_TOKEN,
        test: 'Test 1 — Arbeit & Beruf',
        cursantNume: nume.trim(),
        cursantPrenume: prenume.trim(),
        submittedAt: new Date().toLocaleString('ro-RO'),
        timeUsed: formatTime(TEST_DURATION_SECONDS - secondsLeft),
        answers: answers
    };

    // Arată mesaj de „se trimite..."
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Se trimite examenul...';
    }

    let success = false;
    try {
        // Notă: folosim mode 'no-cors' pentru că Apps Script nu suportă CORS pe POST
        // Răspunsul nu va fi citibil, dar trimiterea funcționează
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

    // Backup: descarcă JSON local indiferent dacă a mers (în caz că ceva s-a stricat în transmisie)
    try {
        const blob = new Blob([JSON.stringify(submission, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raspunsuri-test-1-${nume.trim()}-${Date.now()}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.log('Download error:', e);
    }

    if (success) {
        document.getElementById('exam-content').style.display = 'none';
        document.getElementById('submitted').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert('A apărut o problemă la trimiterea online. Răspunsurile au fost descărcate ca fișier JSON pe calculatorul tău. Te rog trimite acel fișier prin email la etommlearning@gmail.com.');
        document.getElementById('exam-content').style.display = 'none';
        document.getElementById('submitted').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============================================
// PROTECȚII suplimentare
// - Avertizare la închiderea paginii dacă au răspunsuri
// - Save automat la fiecare schimbare
// ============================================
window.addEventListener('beforeunload', (e) => {
    const ans = collectAnswers();
    const filled = Object.values(ans).filter(v => v && v.length > 0).length;
    // dacă a apăsat submit, nu mai avertizăm
    if (filled > 0 && document.getElementById('submitted').style.display !== 'block') {
        e.preventDefault();
        e.returnValue = '';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadAnswers();
    startTimer();
    // auto-save la fiecare schimbare
    document.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('change', saveAnswers);
        inp.addEventListener('blur', saveAnswers);
    });
});
