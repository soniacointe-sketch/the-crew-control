#!/usr/bin/env python3
"""Create individualized, editorial WebP book-cover artworks for ELOAH Foi publications.
Source photos are existing editorial imagery and explicitly provided/generated assets.
No original manuscripts are represented as authenticated facsimiles.
"""
from __future__ import annotations
import hashlib, html, io, os, re, unicodedata, urllib.request
from collections import Counter
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageEnhance, ImageFilter
from bs4 import BeautifulSoup

ROOT = Path(".")
ASSETS = Path("assets/foi-publications")
PERSONAL = Path("assets/foi-chapitres")
W, H = 600, 750
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
SERIF = str(FONT_DIR / "DejaVuSerif.ttf")
SANS = str(FONT_DIR / "DejaVuSans.ttf")
GOLD = (223, 188, 120)
CREAM = (248, 241, 223)

def sha(value):
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:12], 16)

def simplify(text):
    txt = unicodedata.normalize("NFKD", html.unescape(text)).encode("ascii", "ignore").decode()
    return txt.lower()

def fetch_adobe(name, url):
    if not url:
        raise RuntimeError("Missing source URL " + name)
    target = PERSONAL / name
    target.parent.mkdir(parents=True, exist_ok=True)
    print("Fetching", name)
    request = urllib.request.Request(url, headers={"User-Agent":"ELOAH-Editorial/1.0"})
    with urllib.request.urlopen(request, timeout=100) as response:
        data = response.read()
    im = Image.open(io.BytesIO(data)).convert("RGB")
    im.thumbnail((1200, 1500), Image.Resampling.LANCZOS)
    im.save(target, "WEBP", quality=84, method=6)
    if target.stat().st_size < 12000:
        raise RuntimeError("Unexpected small source: " + name)

def fetch_composite(env, temp):
    url = os.environ.get(env,"")
    if not url:
        raise RuntimeError("Missing composite artwork source: " + env)
    request = urllib.request.Request(url, headers={"User-Agent":"ELOAH-Editorial/1.0"})
    with urllib.request.urlopen(request, timeout=100) as response:
        return Image.open(io.BytesIO(response.read())).convert("RGB")

def collage_tiles(composite):
    w,h=composite.size
    tiles=[]
    for row in range(2):
        for col in range(4):
            a=int(col*w/4)+7
            b=int(row*h/2)+7
            z=int((col+1)*w/4)-7
            # retain visually useful photo area, before caption block
            bottom=b+int((h/2-14)*.53)
            tiles.append(composite.crop((a,b,z,bottom)))
    return tiles

def title_for_card(card):
    title=card.select_one(".pub-info h2")
    return title.get_text(" ", strip=True) if title else ""

def group_for_card(card):
    cat=card.select_one(".pub-category")
    return cat.get_text(" ", strip=True) if cat else "Recherche"

def markdown_for_card(card):
    link=card.select_one("a.pub-link")
    if not link: return ""
    m=re.search(r"[?&]file=([^&#]+)",link.get("href",""))
    return m.group(1) if m else ""

def choose_photo(title, group, base_images, tiles):
    key=simplify(title + " " + group)
    map_keys=[
      (("pape", "leon xiv", "augustin"), "p05"),
      (("saint pierre", "autorite", "pierre et"), "p04"),
      (("vierge", "chapelet", "marie et", "marie,", "marie-madeleine", "magdalena"), "mary"),
      (("anges", "archange", "ailes", "michel", "celestes"), "archangel"),
      (("alphabet", "alpha", "aleph", "beth", "lettres", "zachee", "ostracon"), "alphabet"),
      (("architec", "temple", "sacre", "eglise"), "architecture"),
      (("manuscrit", "qumran", "codex", "nag hammadi", "fragments", "collation"), "scroll"),
      (("jacques", "apocryphe"), "apocryphal"),
      (("coran", "genese", "commencement", "bible", "canon", "ecritures"), "book"),
      (("histoire", "archives", "bibliotheque", "alexandrie", "reconstitution", "registre"), "archives"),
      (("priere", "meditation", "spirituel", "foi et"), "prayer"),
      (("journal", "decouvertes", "sommaire", "inventaire", "galerie"), "journal"),
      (("parabole", "thomas", "recits"), "boat"),
      (("arche", "alliance", "salomon", "saba", "jerusalem"), "jerusalem"),
      (("science", "geometrie"), "science"),
      (("deluge", "eau", "noe"), "boat"),
      (("sommeil", "songe", "prophete"), "prophets"),
      (("enfer", "apocalypse", "jugement"), "tomb"),
      (("bayeux", "conquete", "porte"), "history"),
      (("babel", "tour"), "architecture"),
    ]
    chosen = None
    for keys, value in map_keys:
        if any(token in key for token in keys):
            chosen=value
            break
    if chosen == "mary":
        chosen = "p03" if "chapelet" in key else "pub-mary"
    local_names={
      "p05":"photo-05.webp", "p04":"photo-04.webp", "p03":"photo-03.webp",
      "alphabet":"photo-08.webp", "architecture":"photo-09.webp",
      "scroll":"photo-10.webp", "archangel":"photo-06.webp",
      "book":"photo-07.webp", "archives":"photo-10.webp",
      "prayer":"photo-11.webp", "journal":"photo-12.webp",
      "history":"photo-10.webp","science":"photo-08.webp",
    }
    if chosen in local_names:
        return Image.open(PERSONAL/local_names[chosen]).convert("RGB")
    pub_names={
      "pub-mary":"marie-madeleine-sept.webp",
      "apocryphal":"livre-secret-jacques.webp",
    }
    if chosen in pub_names:
        return Image.open(ASSETS/pub_names[chosen]).convert("RGB")
    tile_index = {"jerusalem":1,"boat":7,"prophets":5,"tomb":0}.get(chosen)
    if tile_index is not None: return tiles[tile_index + 8].copy()
    # Deterministic fallback, using a different existing source for each subject.
    choices=[
       base_images["alpha"],base_images["michel"],base_images["jacques"],
       base_images["mary"],base_images["archives"],base_images["bible"],
       *tiles
    ]
    return choices[sha(title)%len(choices)].copy()

def font(path,size):
    return ImageFont.truetype(path,size)

def text_lines(draw, text, face, max_width, max_lines=4):
    words=text.split()
    out=[];line=""
    for word in words:
        test=(line+" "+word).strip()
        if draw.textbbox((0,0),test,font=face)[2] > max_width and line:
            out.append(line)
            line=word
        else: line=test
    if line:out.append(line)
    if len(out)>max_lines:
        out=out[:max_lines]
        last=out[-1]
        while draw.textbbox((0,0),last+"…",font=face)[2] > max_width and last:
            last=last[:-1]
        out[-1]=last.rstrip()+"…"
    return out

def render_cover(subject,group,serial,img):
    seed=sha(subject)
    im=ImageOps.fit(img,(W,H),method=Image.Resampling.LANCZOS,centering=(.5,.36)).convert("RGB")
    # Independent color grading by article and category.
    color=ImageEnhance.Color(im).enhance(.75+(seed%11)/29)
    color=ImageEnhance.Contrast(color).enhance(1.05+(seed%7)/35)
    im=color
    overlay=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(overlay)
    for y in range(H):
        opacity=28 if y<235 else int(26+203*((y-235)/(H-235))**1.4)
        d.line((0,y,W,y),fill=(11,12,18,min(242,opacity)),width=1)
    # Archival bookplate, carefully confined to this publication.
    d.rectangle((18,17,W-19,H-18),outline=(*GOLD,160),width=2)
    d.line((44,65,W-44,65),fill=(*GOLD,180),width=2)
    d.line((44,H-54,W-44,H-54),fill=(*GOLD,160),width=2)
    d.text((45,35),"E L O A H  ·  F O I   &   S P I R I T U A L I T É",
           font=font(SANS,11),fill=(*CREAM,245))
    nr=str(serial).zfill(2)
    d.rounded_rectangle((W-101,81,W-42,127),radius=6,fill=(17,16,20,165),outline=(*GOLD,200),width=1)
    d.text((W-83,93),nr,font=font(SERIF,20),fill=CREAM)
    # Upper photo remains dominant; publication-specific title appears in the lower editorial zone.
    topic=group.upper()
    fc=font(SANS,12 if len(topic)<30 else 11)
    topic_w=d.textbbox((0,0),topic,font=fc)[2]
    d.text(((W-topic_w)/2,H-281),topic,font=fc,fill=GOLD)
    title_face=font(SERIF,38 if len(subject)<34 else 32 if len(subject)<53 else 27)
    lines=text_lines(d,subject,title_face,W-108,max_lines=4)
    while (len(lines)*47 > 166) and title_face.size>24:
        title_face=font(SERIF,title_face.size-2)
        lines=text_lines(d,subject,title_face,W-108,max_lines=4)
    step=title_face.size+9
    start=H-250+(150-len(lines)*step)//2
    for line in lines:
        box=d.textbbox((0,0),line,font=title_face)
        d.text(((W-(box[2]-box[0]))/2,start),line,font=title_face,fill=CREAM,
               stroke_width=1,stroke_fill=(40,29,23,180))
        start+=step
    d.text((W//2-100,H-85),"L I R E   L E   D O S S I E R   ↗",
           font=font(SANS,12),fill=CREAM)
    im=Image.alpha_composite(im.convert("RGBA"),overlay).convert("RGB")
    return im

def main():
    # Two images made for the last personal chapters.
    fetch_adobe("photo-11.webp",os.environ.get("COVER11"))
    fetch_adobe("photo-12.webp",os.environ.get("COVER12"))
    a=fetch_composite("COMPOSITE_A","groupA")
    b=fetch_composite("COMPOSITE_B","groupB")
    tiles=collage_tiles(a)+collage_tiles(b)
    base={}
    for key,name in [("alpha","alpha-aleph.webp"),("michel","michel-4q529.webp"),
                     ("jacques","livre-secret-jacques.webp"),("mary","marie-madeleine-sept.webp"),
                     ("archives","archives-integrales.webp"),("bible","bible-coran.webp")]:
        base[key]=Image.open(ASSETS/name).convert("RGB")
    source=Path("eloah-foi-publications.html")
    soup=BeautifulSoup(source.read_text(encoding="utf-8"),"html.parser")
    missing=[card for card in soup.select(".pub-card") if card.select_one(".pub-cover img") is None]
    if len(missing)!=83:
        raise RuntimeError("Expected 83 missing covers, found "+str(len(missing))+"; inspect catalog before re-running.")
    created=[]
    counter=Counter()
    for card in missing:
        title=title_for_card(card);group=group_for_card(card);filename=markdown_for_card(card)
        if not filename.endswith(".md"):raise RuntimeError("Missing markdown file link for "+title)
        serial=len(created)+7
        dest=ASSETS/("dossier-"+Path(filename).stem+".webp")
        photo=choose_photo(title,group,base,tiles)
        image=render_cover(title,group,serial,photo)
        image.save(dest,"WEBP",quality=82,method=6)
        if dest.stat().st_size<9000:raise RuntimeError("Broken cover "+str(dest))
        created.append(dest)
        counter[group]+=1
    print("Created",len(created),"individual covers; group totals:",dict(counter))
    print("Cover bytes:",sum(p.stat().st_size for p in created))
    assert len(set(created))==83
if __name__=="__main__":
    main()
