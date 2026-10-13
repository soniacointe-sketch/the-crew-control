#!/usr/bin/env python3
"""Create illustrated 4:5 editorial covers for all ELOAH Foi publication entries missing photographs."""
from __future__ import annotations

import hashlib
import io
import math
import os
import random
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit, parse_qs

from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PUBLICATIONS = ROOT / "eloah-foi-publications.html"
ART_DIR = ROOT / "assets/foi-publications"
TOPICS = ART_DIR / "art-sources"
CHAPTERS = ROOT / "assets/foi-chapitres"
ART_DIR.mkdir(parents=True, exist_ok=True)
TOPICS.mkdir(parents=True, exist_ok=True)
CHAPTERS.mkdir(parents=True, exist_ok=True)

CROPS = [
    (46, 119, 388, 349), (415, 119, 757, 349),
    (783, 119, 1125, 349), (1152, 119, 1494, 349),
    (46, 569, 388, 800), (415, 569, 757, 800),
    (783, 569, 1125, 800), (1152, 569, 1494, 800),
]

def download(url: str) -> bytes:
    if not url.startswith("https://"):
        raise ValueError("Photo source needs an HTTPS URL")
    req = urllib.request.Request(url, headers={"User-Agent": "ELOAH-Foi-Cover-Builder/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read()

def prepare_sources():
    snapshot = os.getenv("ELOAH_COVER_SHEET", "")
    if snapshot:
        photo_sheet = Image.open(io.BytesIO(download(snapshot))).convert("RGB")
        if photo_sheet.width < 1494 or photo_sheet.height < 800:
            raise ValueError("Unexpected photograph sheet dimensions")
        for i, region in enumerate(CROPS, 1):
            out = TOPICS / f"scene-{i:02d}.webp"
            photo_sheet.crop(region).save(out, "WEBP", quality=92, method=6)
        print("Eight independent illustration themes extracted")
    for number in (11, 12):
        key = f"ELOAH_COVER_{number}"
        url = os.getenv(key, "")
        if url:
            photo = Image.open(io.BytesIO(download(url))).convert("RGB")
            photo = ImageOps.fit(photo, (1000, 1250), method=Image.Resampling.LANCZOS)
            out = CHAPTERS / f"photo-{number:02d}.webp"
            photo.save(out, "WEBP", quality=84, method=6)
            print(f"Photo {number:02d} generated: {out.stat().st_size} bytes")

def lookup(entry: str, group: str, salt: int) -> Path:
    """Choose a real, clean photographic crop without artificial line or circle overlays."""
    title = entry.casefold()
    def scene(number: int) -> Path:
        return TOPICS / f"scene-{number:02d}.webp"
    keywords = [
        (("madeleine", "magdalena", "marie", "vierge"), [3]),
        (("alpha", "zachée", "zachee", "alphabet", "jésus enfant", "jesus enfant"), [1, 2]),
        (("qumr", "4q529", "ostracon", "papyrus", "fragment", "collation", "manuscrit"), [2, 7]),
        (("résurrection", "resurrection", "passion", "tombeau", "pilate"), [4]),
        (("jérusalem", "jerusalem", "pierre", "apôtre", "apotre", "temple"), [5, 4]),
        (("arbre", "jardin", "éden", "eden", "olivier", "figuier", "nature"), [6]),
        (("source", "écriture", "ecriture", "livre", "genèse", "genese", "coran", "bible", "texte", "bibliothèque"), [7, 2]),
        (("prière", "priere", "méditation", "meditation", "foi", "ange", "archange", "ciel"), [8, 6]),
        (("parabole", "thomas", "prophète", "prophete", "vision", "mystère", "mystere"), [8, 4]),
        (("histoire", "archive", "inventaire", "reconstitution", "transmission"), [7, 5]),
    ]
    for words, options in keywords:
        if any(word in title for word in words):
            choices = [scene(num) for num in options if scene(num).exists()]
            if choices:
                return choices[salt % len(choices)]
    group_options = {
        "Bibliothèque": [2, 7],
        "Collections": [1, 2, 3, 4, 5, 6, 7, 8],
        "Reconstitutions": [4, 5, 6, 7],
        "Sources & illustrations": [2, 5, 6, 7],
        "Manuscrits & enquêtes": [1, 2, 7],
        "Paraboles": [4, 6, 8],
        "Archives": [2, 5, 7],
        "Marie-Madeleine": [3],
        "Chemin personnel": [5, 6, 8],
    }
    candidates = [scene(num) for num in group_options.get(group, list(range(1, 9))) if scene(num).exists()]
    if not candidates:
        raise FileNotFoundError("No clean source photo is available")
    return candidates[salt % len(candidates)]


def font(size: int, serif=True, bold=False):
    candidates = (
        ["/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
         "/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf"] if serif and bold
        else ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
              "/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf"] if serif
        else ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
              else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    )
    for name in candidates:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()

def split_title(title: str, f, draw, max_width: int):
    parts = title.replace("·", " · ").split()
    lines = []
    line = ""
    for word in parts:
        candidate = (line + " " + word).strip()
        if line and draw.textbbox((0, 0), candidate, font=f)[2] > max_width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines

def make_cover(source: Path, title: str, group: str, filename: str, ordinal: int, dest: Path):
    """Photographic cover only: no circles, geometry, frames, lettering or badges baked in."""
    seed = int(hashlib.sha1(filename.encode("utf8")).hexdigest()[:9], 16)
    rng = random.Random(seed)
    image = Image.open(source).convert("RGB")
    # Preserve the photographic subject but use slightly distinct crops for related dossiers.
    position = (0.39 + rng.random() * 0.23, 0.36 + rng.random() * 0.24)
    image = ImageOps.fit(image, (600, 750), method=Image.Resampling.LANCZOS, centering=position)
    image = ImageEnhance.Color(image).enhance(0.94 + rng.random() * 0.12)
    image = ImageEnhance.Contrast(image).enhance(1.01 + rng.random() * 0.04)
    image = ImageEnhance.Brightness(image).enhance(0.98 + rng.random() * 0.06)
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, "WEBP", quality=85, method=6)
    if dest.stat().st_size < 10000:
        raise ValueError("Suspiciously small clean cover " + str(dest))


def main():
    prepare_sources()
    page = BeautifulSoup(PUBLICATIONS.read_text(encoding="utf8"), "html.parser")
    cards = page.select("article.pub-card")
    generated = []
    for n, card in enumerate(cards, 1):
        if card.select_one(".pub-cover img"):
            continue
        title = card.select_one(".pub-info h2").get_text(" ", strip=True)
        group = card.get("data-group", "Dossier")
        link = card.select_one("a.pub-link").get("href", "")
        filename = parse_qs(urlsplit(link).query).get("file", [""])[0]
        if not filename.endswith(".md"):
            raise ValueError("Unknown publication reference " + str(link))
        # The 12 spiritual chapters reuse their 12 original generated photographs.
        if re.search(r"eloah-foi-personnel-(?:0[1-9]|1[0-2])-", filename):
            continue
        dest = ART_DIR / ("generated-" + filename[:-3] + ".webp")
        src = lookup((title + " " + filename), group, n)
        make_cover(src, title, group, filename, n, dest)
        generated.append(dest)
    if len(cards) != 89 or len(generated) != 71:
        raise AssertionError(f"Unexpected inventory: {len(cards)} cards, {len(generated)} new covers")
    print(f"Generated {len(generated)} original covers for the {len(cards)} ELOAH publications")
    print("Total image bytes:", sum(p.stat().st_size for p in generated))

if __name__ == "__main__":
    main()
