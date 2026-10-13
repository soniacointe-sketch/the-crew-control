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
    title = entry.lower()
    def photo(idx):
        return CHAPTERS / f"photo-{idx:02d}.webp"
    def tile(idx):
        return TOPICS / f"scene-{idx:02d}.webp"
    rules = [
        (("magdalena", "madeleine"), tile(3)),
        (("marie-", "marie_", "vierge"), photo(3)),
        (("jesus", "jésus", "zachee", "zachée", "resurrection", "résurrection"), tile(1)),
        (("ange", "archange", "michel", "celeste", "céleste"), photo(6)),
        (("pierre", "clefs", "clés", "autorite", "autorité"), photo(4)),
        (("qumran", "qumrân", "4q529", "papyrus", "ostracon", "collation"), tile(2)),
        (("alphabet", "alpha", "aleph", "lettre", "ecriture", "écriture"), photo(8)),
        (("eglise", "église", "temple", "architecture", "symbol", "flamme"), photo(9)),
        (("jardin", "arbre", "eden", "éden"), tile(6)),
        (("salomon", "saba", "babel", "alexandrie", "alexandria"), tile(5)),
        (("parabole", "logia", "prophetie", "prophétie"), tile(8)),
        (("bible", "coran", "genese", "genèse", "livre", "manuscrit", "enoch", "hénoch"), photo(7)),
        (("archives", "histoire", "source", "registre", "document", "reconstitution"), photo(10)),
        (("spirituel", "priere", "prière", "meditation", "méditation"), photo(11)),
    ]
    for words, candidate in rules:
        if any(w in title for w in words) and candidate.exists():
            return candidate
    group_choices = {
        "Bibliothèque": [tile(7), photo(10)],
        "Collections": [tile(2), tile(4), tile(8), photo(7)],
        "Reconstitutions": [tile(5), tile(6), tile(4), photo(9)],
        "Sources & illustrations": [tile(2), tile(7), photo(10), photo(8)],
        "Manuscrits & enquêtes": [tile(2), photo(10), photo(8)],
        "Paraboles": [tile(8), tile(1), photo(2)],
        "Archives": [tile(5), photo(10)],
        "Marie-Madeleine": [tile(3)],
        "Chemin personnel": [photo(11), tile(8)],
    }
    pool = [p for p in group_choices.get(group, []) if p.exists()]
    if not pool:
        pool = [p for p in TOPICS.glob("*.webp")]
    if not pool:
        raise FileNotFoundError("Missing illustration source images")
    return pool[salt % len(pool)]

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
    seed = int(hashlib.sha1(filename.encode("utf8")).hexdigest()[:9], 16)
    rng = random.Random(seed)
    image = Image.open(source).convert("RGB")
    centering = (0.38 + rng.random() * .25, 0.34 + rng.random() * .27)
    image = ImageOps.fit(image, (600, 750), method=Image.Resampling.LANCZOS,
                         centering=centering)
    image = ImageEnhance.Color(image).enhance(0.69 + .19 * rng.random())
    image = ImageEnhance.Contrast(image).enhance(1.06)
    image = ImageEnhance.Brightness(image).enhance(0.76)
    rgba = image.convert("RGBA")
    overlay = Image.new("RGBA", (600, 750), (0, 0, 0, 0))
    pix = overlay.load()
    for y in range(750):
        t = y / 750
        # Strong lower vignette: text remains readable without obscuring the main photograph.
        fade = max(0, (t - .37) / .63)
        alpha = int(55 + 188 * fade ** 1.45 + 18 * (1 - t))
        for x in range(600):
            side = abs((x - 300) / 300)
            a = min(247, alpha + int(27 * side ** 1.9))
            pix[x, y] = (10, 10, 17, a)
    rgba = Image.alpha_composite(rgba, overlay)
    draw = ImageDraw.Draw(rgba, "RGBA")
    palette = {
        "Bibliothèque": (224, 194, 138),
        "Collections": (208, 191, 143),
        "Reconstitutions": (223, 165, 116),
        "Sources & illustrations": (169, 196, 192),
        "Manuscrits & enquêtes": (210, 177, 118),
        "Paraboles": (222, 191, 133),
        "Archives": (188, 180, 160),
        "Marie-Madeleine": (226, 181, 172),
        "Chemin personnel": (221, 192, 147),
    }
    gold = palette.get(group, (224, 194, 138))
    g = (*gold, 230)
    draw.rectangle((28, 28, 572, 722), outline=(*gold, 135), width=2)
    draw.line((56, 101, 545, 101), fill=(*gold, 175), width=2)
    draw.line((56, 669, 545, 669), fill=(*gold, 155), width=2)
    draw.text((55, 61), "E L O A H   /   F O I   &   S P I R I T U A L I T É",
              font=font(15, serif=False, bold=True), fill=(245, 225, 187, 255))
    # The editorial crest changes with each entry, producing a distinct illustration.
    cx = int(295 + rng.randrange(-47, 48)); cy = int(240 + rng.randrange(-55, 56))
    rings = 82 + (seed % 39)
    for rad, fade in [(rings + 38, 28), (rings, 95), (rings // 2, 70)]:
        draw.ellipse((cx-rad, cy-rad, cx+rad, cy+rad), outline=(*gold, fade), width=2)
    for k in range(12):
        ang = (math.pi * 2 * k / 12) + (seed % 30) / 30
        r1, r2 = rings + 46, rings + 62
        draw.line((cx + r1 * math.cos(ang), cy + r1 * math.sin(ang),
                   cx + r2 * math.cos(ang), cy + r2 * math.sin(ang)),
                  fill=(*gold, 60), width=2)
    draw.line((56, 449, 120, 449), fill=g, width=3)
    grp = group.upper()
    grp_f = font(14, serif=False, bold=True)
    if draw.textbbox((0, 0), grp, font=grp_f)[2] > 470:
        grp_f = font(12, serif=False, bold=True)
    draw.text((56, 460), grp, font=grp_f, fill=g)
    normalized = re.sub(r"\s+", " ", title).strip()
    text_font = font(35, serif=True, bold=True)
    lines = split_title(normalized, text_font, draw, 490)
    while len(lines) > 4 and text_font.size > 25:
        text_font = font(text_font.size - 2, serif=True, bold=True)
        lines = split_title(normalized, text_font, draw, 490)
    lh = text_font.size + 12
    total_h = lh * len(lines)
    y0 = max(500, 641 - total_h)
    for n, line in enumerate(lines):
        draw.text((55, y0 + n * lh), line, font=text_font, fill=(250, 244, 229, 255),
                  stroke_width=1, stroke_fill=(10, 10, 16, 100))
    draw.text((56, 686), "OUVRIR LE DOSSIER  ↗", font=font(14, serif=False, bold=True), fill=g)
    draw.text((546, 685), f"{ordinal:02d}", anchor="ra",
              font=font(23, serif=True), fill=(*gold, 225))
    rgb = rgba.convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb.save(dest, "WEBP", quality=82, method=5)
    if dest.stat().st_size < 10000:
        raise ValueError("Suspiciously small generated cover " + str(dest))

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
