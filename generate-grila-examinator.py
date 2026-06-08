#!/usr/bin/env python3
"""
Generate examiner answer-key HTML for tests 3 through 10.
Reads test.js ANSWER_KEY + index.html question texts.
Output: test-N-examinator.html in each test folder.
"""

import re
import json
from pathlib import Path

REPO = Path(__file__).parent

TEST_DATA = {
    3: ("Umwelt und Klima", "Mediu și climă"),
    4: ("Technologie und Internet", "Tehnologie și Internet"),
    5: ("Gesundheit", "Sănătate"),
    6: ("Reisen und Tourismus", "Călătorii și turism"),
    7: ("Familie und Beziehungen", "Familie și relații"),
    8: ("Medien und Kommunikation", "Media și comunicare"),
    9: ("Wohnen und Stadtleben", "Locuit și viața urbană"),
    10: ("Kultur und Freizeit", "Cultură și timp liber"),
}

# Section headers for the grila
SECTION_LABELS = {
    "konnektoren": ("A. Konnektoren (5×1p = 5p)", "g1-g5"),
    "prepozitii":  ("B. Prepoziții (5×1p = 5p)", "g6-g10"),
    "passiv":      ("C. Aktiv → Passiv (5×2p = 10p)", "g11-g15"),
    "rechtschreibung": ("D. Rechtschreibung (5×1p = 5p)", "o1-o5"),
    "greseli":     ("E. Greșeli ortografice (5×1p = 5p)", "o6-o10"),
}


def parse_answer_key(test_js_path: Path) -> dict:
    """Extract ANSWER_KEY from test.js into a dict {key: list[str]}."""
    src = test_js_path.read_text(encoding='utf-8')

    # Find the ANSWER_KEY block
    m = re.search(r'const ANSWER_KEY\s*=\s*\{(.+?)^\};', src, re.DOTALL | re.MULTILINE)
    if not m:
        raise ValueError(f"ANSWER_KEY not found in {test_js_path}")
    block = m.group(1)

    answers = {}

    # Match keys: each entry is `key: { correct: [...] | ['x'], points: N }`
    # Pattern handles both single-line arrays and multi-line arrays
    entry_pattern = re.compile(
        r"(g\d+|o\d+|h\d+|l\d+)\s*:\s*\{\s*correct\s*:\s*\[(.+?)\]",
        re.DOTALL
    )

    for m in entry_pattern.finditer(block):
        key = m.group(1)
        arr_content = m.group(2)
        # Extract quoted strings
        items = re.findall(r"'([^']*)'", arr_content)
        if not items:
            items = re.findall(r'"([^"]*)"', arr_content)
        answers[key] = items

    return answers


def format_answer_short(key: str, items: list) -> str:
    """Take first acceptable answer for short display."""
    if not items:
        return "(?)"
    # For grila, show the first (canonical) form
    return items[0]


def format_answer_full(key: str, items: list, max_alts: int = 3) -> str:
    """For Passiv/Leseverstehen, show main + alternatives."""
    if not items:
        return "(?)"
    main = items[0]
    if len(items) > 1:
        alts = " · alt: " + ", ".join(items[1:max_alts+1])
        return main + alts
    return main


def build_grammatik_html(answers: dict) -> str:
    """Build Grammatik section (g1-g10 + g11-g15 + o1-o5 + o6-o10)."""

    def row(keys, formatter=format_answer_short):
        cells = []
        for k in keys:
            num = int(re.search(r'\d+', k).group())
            # g1-g5 = items 1-5, g6-g10 = 6-10, g11-g15 = 11-15
            # o1-o5 = items 16-20, o6-o10 = 21-25
            if k.startswith('g'):
                display_num = num
            elif k.startswith('o'):
                display_num = num + 15
            else:
                display_num = num
            ans = formatter(k, answers.get(k, []))
            cells.append(f'<strong>{display_num}.</strong> {ans}')
        return ' &nbsp; '.join(cells)

    g_konnektoren = ['g1', 'g2', 'g3', 'g4', 'g5']
    g_prepoz = ['g6', 'g7', 'g8', 'g9', 'g10']
    g_passiv = ['g11', 'g12', 'g13', 'g14', 'g15']
    o_recht = ['o1', 'o2', 'o3', 'o4', 'o5']
    o_gres = ['o6', 'o7', 'o8', 'o9', 'o10']

    # Passiv shows full sentence, one per line; capitalize German nouns properly
    GERMAN_CAPITALIZE = [
        # Universal across tests
        'Mietvertrag', 'Vermieter', 'Mieter', 'Mietspiegel', 'Wohnungen', 'Wohnung', 'Investoren',
        'Innenstadt', 'Stadt', 'Nebenkosten', 'Monat', 'Architekten', 'Wohnviertel',
        # Test 10 (Kultur)
        'Film', 'Regisseur', 'Lied', 'Band', 'Ausstellung', 'Museum', 'Videospiele', 'Jugendlichen',
        'Sportturnier', 'Verein',
        # Test 8 (Medien)
        'Artikel', 'Journalisten', 'Fake News', 'Menschen', 'Medien', 'Inhalte', 'Algorithmus',
        'Geld', 'Influencern', 'Werbung', 'Quelle', 'Redaktion',
        # Test 7 (Familie)
        'Eltern', 'Kinder', 'Familie', 'Großmutter', 'Vater',
        # Test 6 (Reisen)
        'Reise', 'Hotel', 'Flug', 'Tourist', 'Sehenswürdigkeiten',
        # Test 5 (Gesundheit)
        'Arzt', 'Patient', 'Krankenhaus', 'Sport', 'Gesundheit',
        # Test 4 (Technologie)
        'Computer', 'Internet', 'App', 'Smartphone', 'Daten',
        # Test 3 (Umwelt)
        'Klima', 'Umwelt', 'Müll', 'CO2', 'Wald', 'Politiker',
    ]
    passiv_html = ''
    for k in g_passiv:
        num = int(re.search(r'\d+', k).group())
        items = answers.get(k, [])
        if items:
            main = items[0]
            # Capitalize first letter
            main = main[0].upper() + main[1:] if main else main
            # Capitalize German nouns
            for noun in GERMAN_CAPITALIZE:
                main = re.sub(r'\b' + noun.lower() + r'\b', noun, main)
            main = main.rstrip('.') + '.'
            passiv_html += f'<div class="passiv-line"><strong>{num}.</strong> {main}</div>\n'

    return f'''
    <h3 class="sec-h3">A. Konnektoren (5×1p = 5p)</h3>
    <div class="answer-row">{row(g_konnektoren)}</div>

    <h3 class="sec-h3">B. Prepoziții (5×1p = 5p)</h3>
    <div class="answer-row">{row(g_prepoz)}</div>

    <h3 class="sec-h3">C. Aktiv → Passiv (5×2p = 10p)</h3>
    <div class="answer-block">{passiv_html}</div>

    <h3 class="sec-h3">D. Rechtschreibung (5×1p = 5p)</h3>
    <div class="answer-row">{row(o_recht)}</div>

    <h3 class="sec-h3">E. Greșeli ortografice (5×1p = 5p)</h3>
    <div class="answer-row">{row(o_gres)}</div>
    '''


def build_hoeren_html(answers: dict) -> str:
    """h1-h4 = 3p mc, h5-h8 = 2p R/F."""
    cells_mc = []
    for i, k in enumerate(['h1', 'h2', 'h3', 'h4'], start=26):
        items = answers.get(k, [])
        ans = items[0] if items else '?'
        cells_mc.append(f'<strong>{i}.</strong> {ans}')

    cells_rf = []
    for i, k in enumerate(['h5', 'h6', 'h7', 'h8'], start=30):
        items = answers.get(k, [])
        ans = items[0] if items else '?'
        cells_rf.append(f'<strong>{i}.</strong> {ans}')

    return f'''
    <h3 class="sec-h3">Multiple choice — itemi 26-29 (4×3p = 12p)</h3>
    <div class="answer-row">{' &nbsp; '.join(cells_mc)}</div>

    <h3 class="sec-h3">Richtig / Falsch — itemi 30-33 (4×2p = 8p)</h3>
    <div class="answer-row">{' &nbsp; '.join(cells_rf)}</div>
    '''


def build_lesen_html(answers: dict) -> str:
    """l1-l5 = 3p mc, l6-l10 = 2p short answer."""
    cells_mc = []
    for i, k in enumerate(['l1', 'l2', 'l3', 'l4', 'l5'], start=34):
        items = answers.get(k, [])
        ans = items[0] if items else '?'
        cells_mc.append(f'<strong>{i}.</strong> {ans}')

    short_html = ''
    for i, k in enumerate(['l6', 'l7', 'l8', 'l9', 'l10'], start=39):
        items = answers.get(k, [])
        main = items[0] if items else '?'
        alts = items[1:4] if len(items) > 1 else []
        alts_str = f' <em class="alts">(acceptat și: {", ".join(alts)})</em>' if alts else ''
        short_html += f'<div class="short-line"><strong>{i}.</strong> {main}{alts_str}</div>\n'

    return f'''
    <h3 class="sec-h3">Multiple choice — itemi 34-38 (5×3p = 15p)</h3>
    <div class="answer-row">{' &nbsp; '.join(cells_mc)}</div>

    <h3 class="sec-h3">Răspuns scurt — itemi 39-43 (5×2p = 10p)</h3>
    <div class="answer-block">{short_html}</div>
    '''


def build_sprechen_html(test_num: int) -> str:
    """Standardized Sprechen section — manual scoring."""
    return f'''
    <p class="sprechen-note">
        Sprechen = dialog oral 5-7 minute în pereche (cursant A ↔ cursant B). Examinatorul cotează manual.
    </p>
    <table class="sprechen-table">
        <thead><tr><th>Criteriu</th><th>Punctaj maxim</th></tr></thead>
        <tbody>
            <tr><td>Realizarea sarcinii (răspunde la temă, argumentează, acceptă compromis)</td><td>5p</td></tr>
            <tr><td>Coerență + fluență (conectori, ritm, înțelegere)</td><td>4p</td></tr>
            <tr><td>Vocabular (folosit din lecția aliniată)</td><td>3p</td></tr>
            <tr><td>Gramatică + pronunție</td><td>3p</td></tr>
            <tr><td><strong>TOTAL Sprechen</strong></td><td><strong>15p</strong></td></tr>
        </tbody>
    </table>
    '''


def build_html(test_num: int, theme_de: str, theme_ro: str, answers: dict) -> str:
    grammatik = build_grammatik_html(answers)
    hoeren = build_hoeren_html(answers)
    lesen = build_lesen_html(answers)
    sprechen = build_sprechen_html(test_num)

    return f'''<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>Test {test_num} — Examinator (CONFIDENȚIAL)</title>
    <style>
        @page {{
            size: A4;
            margin: 12mm 14mm 12mm 14mm;
            /* Suppress Chrome's auto-inserted header (date+title) and footer (URL+page) */
            @top-left {{ content: ""; }}
            @top-center {{ content: ""; }}
            @top-right {{ content: ""; }}
            @bottom-left {{ content: ""; }}
            @bottom-center {{ content: ""; }}
            @bottom-right {{ content: ""; }}
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: Georgia, 'Times New Roman', serif; color: #1f2937; line-height: 1.55; padding: 24px 28px 40px; max-width: 800px; margin: 0 auto; background: white; }}
        .confidential {{ color: #dc2626; font-weight: 700; text-align: center; letter-spacing: 1.5px; font-size: 1rem; }}
        .meta-top {{ text-align: center; color: #6b7280; font-size: 0.92rem; margin-top: 8px; }}
        h1 {{ color: #047857; text-align: center; font-size: 2rem; margin: 24px 0 6px; font-weight: bold; letter-spacing: 0.3px; }}
        h1 .symbol {{ color: #10B981; font-size: 1.6rem; vertical-align: middle; margin-right: 6px; font-family: 'Nirmala UI', Georgia, serif; }}
        .grila-label {{ text-align: center; color: #065f46; font-weight: 700; font-size: 1.1rem; margin-bottom: 6px; letter-spacing: 0.5px; }}
        .punctaj-line {{ text-align: center; color: #6b7280; font-size: 0.95rem; margin-bottom: 22px; }}
        hr {{ border: none; border-top: 3px solid #10B981; margin: 18px 0 22px; }}
        .distribution {{ background: #f9fafb; padding: 16px 22px; border-radius: 8px; margin-bottom: 18px; border-left: 4px solid #10B981; }}
        .distribution h3 {{ color: #047857; font-size: 1rem; margin-bottom: 8px; }}
        .distribution ul {{ list-style: disc; padding-left: 24px; }}
        .distribution li {{ margin: 3px 0; }}
        .note-yellow {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 18px; border-radius: 6px; font-style: italic; margin: 18px 0 28px; color: #78350f; }}
        h2.sec-h2 {{ color: #047857; font-size: 1.4rem; margin: 30px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #10B981; }}
        h3.sec-h3 {{ color: #047857; font-size: 1.05rem; margin: 16px 0 8px; font-weight: 700; }}
        .answer-row {{ background: #ecfdf5; border-left: 4px solid #10B981; padding: 10px 16px; border-radius: 5px; font-size: 0.97rem; }}
        .answer-block {{ background: #ecfdf5; border-left: 4px solid #10B981; padding: 10px 16px; border-radius: 5px; }}
        .passiv-line {{ padding: 4px 0; font-size: 0.95rem; }}
        .short-line {{ padding: 4px 0; font-size: 0.95rem; }}
        .alts {{ color: #6b7280; font-size: 0.85rem; }}
        .sprechen-note {{ background: #f0fdf4; border-left: 4px solid #10B981; padding: 10px 16px; margin: 10px 0 14px; font-size: 0.95rem; color: #065f46; }}
        .sprechen-table {{ width: 100%; border-collapse: collapse; margin: 8px 0 18px; font-size: 0.95rem; }}
        .sprechen-table th, .sprechen-table td {{ padding: 8px 12px; border: 1px solid #d1fae5; text-align: left; }}
        .sprechen-table th {{ background: #ecfdf5; color: #047857; font-weight: 700; }}
        .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1fae5; color: #6b7280; font-size: 0.85rem; }}
        .footer .ʚ {{ color: #047857; font-size: 1.1rem; }}
    </style>
</head>
<body>
    <p class="confidential">CONFIDENȚIAL — DOAR PENTRU EXAMINATOR</p>
    <p class="meta-top">Curs autorizat ANC · Claudia Toth · © 2026</p>

    <h1><span class="symbol">ʚଓ</span>TEST {test_num} — {theme_de}</h1>
    <p class="grila-label">GRILĂ DE CORECTARE</p>
    <p class="punctaj-line">100 puncte total · Prag promovare 60p (60%)</p>

    <hr>

    <div class="distribution">
        <h3>Distribuția punctajului:</h3>
        <ul>
            <li><strong>Oficiu:</strong> 10p (toți cursanții primesc)</li>
            <li><strong>Grammatik + Rechtschreibung:</strong> 30p (25 itemi)</li>
            <li><strong>Hörverstehen:</strong> 20p (8 itemi)</li>
            <li><strong>Leseverstehen:</strong> 25p (10 itemi)</li>
            <li><strong>Sprechen</strong> (oral, dialog 2 cursanți): <strong>15p</strong></li>
        </ul>
    </div>

    <div class="note-yellow">
        Calcul AUTOMAT pentru oficiu + Grammatik + Hörverstehen + Leseverstehen = <strong>85p</strong> (vezi Google Sheet).
        Sprechen: <strong>15p</strong> calculat MANUAL pe baza dialogului oral.
    </div>

    <hr>

    <h2 class="sec-h2">1. GRAMMATIK + RECHTSCHREIBUNG (30p)</h2>
    {grammatik}

    <h2 class="sec-h2">2. HÖRVERSTEHEN (20p)</h2>
    {hoeren}

    <h2 class="sec-h2">3. LESEVERSTEHEN (25p)</h2>
    {lesen}

    <h2 class="sec-h2">4. SPRECHEN (15p — cotat MANUAL)</h2>
    {sprechen}

    <div class="footer">
        <p><span class="ʚ">ʚଓ</span> Claudia Toth · Curs autorizat ANC · © 2026</p>
        <p>Tema: <em>{theme_ro}</em> · Examen oficial B2 sesiune iulie 2026</p>
        <p style="margin-top: 8px; color: #dc2626; font-weight: 600;">Acest document este CONFIDENȚIAL. Nu îl arăta cursanților!</p>
    </div>
</body>
</html>
'''


def main():
    for test_num, (theme_de, theme_ro) in TEST_DATA.items():
        test_dir = REPO / f"test-{test_num}"
        test_js = test_dir / "test.js"
        if not test_js.exists():
            print(f"⚠️  {test_js} missing — skip")
            continue
        try:
            answers = parse_answer_key(test_js)
        except Exception as e:
            print(f"⚠️  test-{test_num}: parse error — {e}")
            continue

        html = build_html(test_num, theme_de, theme_ro, answers)
        out = test_dir / f"test-{test_num}-examinator.html"
        out.write_text(html, encoding='utf-8')
        print(f"✓ {out.name} — {len(answers)} keys parsed")


if __name__ == "__main__":
    main()
