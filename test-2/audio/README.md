# Audio Test 2 — Bildung & Studium

## 🎙️ Audio de înregistrat: `01-anunt-studyabroad.mp3`

**Tip:** Monolog / anunț radio · 1 voce (narator) · durată ~60 sec
**Ton:** Prezentator radio german, clar, entuziast

### Text de înregistrat (pentru Claudia)

```
Sind Sie auf der Suche nach einem Studienplatz im Ausland?
Dann sind Sie bei der Agentur „StudyAbroad" genau richtig!

StudyAbroad hilft seit 15 Jahren Erwachsenen aus ganz Europa,
ihren Traumstudienplatz zu finden. Wir arbeiten mit
Universitäten aus Deutschland, Österreich, der Schweiz und
sogar mit internationalen Hochschulen zusammen.

Unsere erste Beratung ist komplett kostenlos! Sie zahlen
nichts für das erste Gespräch mit einem unserer Studienberater.

Sie können sich ganz einfach anmelden — entweder online über
unsere Website oder telefonisch unter der Nummer
null acht hundert — neun neun neun.

Worauf warten Sie noch? Rufen Sie uns heute an und starten
Sie in Ihre akademische Zukunft!
```

### Răspunsuri corecte asociate (pentru examinator)

**Multiple choice (h1-h4):**
- h1: b — Erwachsenen aus ganz Europa
- h2: c — komplett kostenlos
- h3: c — DACH + international
- h4: b — online sau telefonic

**Richtig / Falsch (h5-h8):**
- h5: R — 15 ani vechime
- h6: F — lucrează cu universități (NU firme)
- h7: R — prima Beratung gratuită
- h8: R — telefon începe cu 0800

---

## 🎯 Recomandare tehnică

Folosește același pipeline ca la Test 1:
1. Înregistrează cu vocea ta sau cu Hedda Desktop (PowerShell System.Speech)
2. Salvează ca MP3 (44.1 kHz, mono, 128 kbps) la `audio/01-anunt-studyabroad.mp3`
3. Verifică în browser: clik pe „▶ Redă Audio" în test → playback OK?

**Alternativ rapid (Hedda WAV → MP3):**
```powershell
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice("Microsoft Hedda Desktop")
$s.Rate = 0  # ușor mai rapid pentru anunț radio
$s.SetOutputToWaveFile("audio/01-anunt-studyabroad.wav")
$s.Speak("Sind Sie auf der Suche nach einem Studienplatz im Ausland? ...")
# apoi convertește WAV→MP3 cu ffmpeg sau audacity
```
