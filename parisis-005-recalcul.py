#!/usr/bin/env python3
# PARISIS ENGINE / PAR-ISIS-005 — Repères modernes uniquement.
# Reproduction indépendante du calcul des distances (Lambert-93 / EPSG:2154).
# Lancer : python3 parisis-005-recalcul.py parisis-005-points-modernes.csv
# Aucun relevé cadastral ancien ni alignement intentionnel n'est démontré ici.
import csv, math, sys

E=0.0818191910428158
N=0.7256077650532670
C=11754255.426096
XS=700000.0
YS=12655612.049876
LON0=math.radians(3.0)

def to_lambert93(lat, lon):
    phi=math.radians(lat)
    lam=math.radians(lon)
    iso=math.log(math.tan(math.pi/4+phi/2) *
                 ((1-E*math.sin(phi))/(1+E*math.sin(phi)))**(E/2))
    radius=C*math.exp(-N*iso)
    return (XS+radius*math.sin(N*(lam-LON0)),
            YS-radius*math.cos(N*(lam-LON0)))

def offset_from_line(a,b,p):
    dx=b[0]-a[0]
    dy=b[1]-a[1]
    norm=math.hypot(dx,dy)
    # Perpendicular offset, signed according to A→B; not point-to-segment distance.
    signed=(dx*(p[1]-a[1])-dy*(p[0]-a[0]))/norm
    param=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(norm*norm)
    return signed,param

path=sys.argv[1] if len(sys.argv)>1 else 'parisis-005-points-modernes.csv'
with open(path,encoding='utf-8-sig',newline='') as f:
    rows=list(csv.DictReader(f))
points={}
for r in rows:
    points[r['id']]=to_lambert93(float(r['latitude_deg']),float(r['longitude_deg']))
a,b=points['A'],points['B']
length=math.dist(a,b)
az=(math.degrees(math.atan2(b[0]-a[0],b[1]-a[1]))+360)%360
print(f'Distance A→B (grille Lambert-93): {length:.2f} m')
print(f'Azimut de grille A→B: {az:.2f} degrés')
for r in rows:
    x,y=points[r['id']]
    off,t=offset_from_line(a,b,(x,y))
    flag='hors du segment A-B' if not 0<=t<=1 else 'projection dans A-B'
    print(f"{r['id']} {r['nom']}: E={x:.2f}, N={y:.2f}, "
          f"écart latéral={off:.2f} m, t={t:.3f} ({flag})")
print('RÉSULTAT MODERNE EXPLORATOIRE : aucune mesure cadastrale ancienne ne peut être inférée.')
