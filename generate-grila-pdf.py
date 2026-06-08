#!/usr/bin/env python3
"""
Convert test-N-examinator.html to .pdf via Chrome headless.
Properly URL-encodes Windows paths.
"""

import subprocess
import urllib.parse
from pathlib import Path

REPO = Path(__file__).parent.resolve()
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def html_to_pdf(html_path: Path, pdf_path: Path):
    # Convert Windows path to file:/// URL
    # Path.as_uri() does this correctly: file:///E:/Date%20Asus/...
    url = html_path.as_uri()
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--print-to-pdf={pdf_path}",
        "--print-to-pdf-no-header",
        "--no-pdf-header-footer",
        "--virtual-time-budget=5000",
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    return result.returncode == 0 and pdf_path.exists()


def main():
    for n in range(3, 11):
        html = REPO / f"test-{n}" / f"test-{n}-examinator.html"
        pdf = REPO / f"test-{n}" / f"test-{n}-examinator.pdf"
        if not html.exists():
            print(f"skip test-{n}: html missing")
            continue
        ok = html_to_pdf(html, pdf)
        if ok:
            size = pdf.stat().st_size
            print(f"OK test-{n}-examinator.pdf ({size:,} bytes)")
        else:
            print(f"FAIL test-{n}-examinator.pdf")


if __name__ == "__main__":
    main()
