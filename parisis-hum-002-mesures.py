#!/usr/bin/env python3
"""PARISIS ENGINE · HUM-002 / ARCHIVES-02, 13 octobre 2026.
Reproduit uniquement les écarts géométriques modernes exploratoires.
Dépendance : pip install pyproj
Source des coordonnées : parisis-hum-002-reperes.csv, même dossier.
"""
import csv
from math import atan2, degrees, hypot
from pathlib import Path
from pyproj import Transformer

source = Path(__file__).with_name("parisis-hum-002-reperes.csv")
with source.open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))
project = Transformer.from_crs("EPSG:4326", "EPSG:2154", always_xy=True)
p = {r["id"]: project.transform(float(r["longitude_wgs84"]),
                                float(r["latitude_wgs84"])) for r in rows}

def audit(start, finish, point):
    x1,y1 = p[start]; x2,y2 = p[finish]; px,py = p[point]
    dx,dy = x2-x1,y2-y1
    baseline = hypot(dx,dy)
    offset = abs(dx*(py-y1)-dy*(px-x1))/baseline
    progress = ((px-x1)*dx+(py-y1)*dy)/baseline**2
    azimut = (degrees(atan2(dx,dy))+360)%360
    return baseline,offset,progress,azimut

for depart,arrivee,controle in [
  ("rue","chaillot","tombe"),
  ("place","cours","pyramide"),
  ("place","cours","arts")
]:
    L,e,u,a=audit(depart,arrivee,controle)
    print(f"{depart} -> {arrivee} / {controle} : "
          f"distance {L:.1f} m ; écart {e:.1f} m ; "
          f"position relative {u:.4f} ; azimut {a:.2f}°")

# F2 exploratoire, pas une preuve d'intention historique.
# Coordonnée du Palais de Chaillot ≠ ancienne entrée du Musée du cinéma.
# La pyramide et les Arts et Métiers sont des points approchés.
# Il manque les emprises et plans d'époque, les tolérances et les témoins aléatoires.
