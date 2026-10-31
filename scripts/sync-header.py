from pathlib import Path
from lxml import html, etree
from copy import deepcopy
root=Path(__file__).resolve().parent.parent; dist=root/'dist'
d=html.parse(str(dist/'index.html')); candidates=d.xpath('//header[@class="review-header"]')
if not candidates: candidates=html.parse(str(dist/'archives/parisis-fouquet-panoramas.html')).xpath('//header[contains(@class,"review-header")]')
header=candidates[0]; header.set('id','parisis-site-header')
count=0
import sys
files=[dist/p for p in sys.argv[1:]] if len(sys.argv)>1 else list(dist.rglob('*.html'))
for f in files:
 if f.name == 'atlas-verdier.html': continue
 tree=html.parse(str(f)); body=tree.find('body')
 if body is None: continue
 for old in tree.xpath('//header[contains(concat(" ",normalize-space(@class)," ")," review-header ")]'):
  old.getparent().remove(old)
 body.insert(0,deepcopy(header))
 for old in tree.xpath('//link[starts-with(@href,"/site-header.css")]'):old.getparent().remove(old)
 body.append(etree.Element('link',rel='stylesheet',href='/site-header.css?v=17'))
 f.write_bytes(etree.tostring(tree,encoding='utf-8',method='html',doctype='<!doctype html>'))
 count+=1
print('En-tête commun appliqué :',count)
