"""Validate the ELOAH 11 release without network or credentials."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re, subprocess
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.urls=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag in ('a','link','script'):
   u=a.get('href') or a.get('src')
   if u:self.urls.append(u)
p=Page();p.feed((ROOT/'eloah-2040.html').read_text())
assert len(p.ids)==len(set(p.ids)), 'Duplicate DOM IDs'
for url in p.urls:
 u=urlsplit(url)
 if not u.scheme and u.path:assert (ROOT/unquote(u.path)).is_file(), 'Missing file: '+url
code=(ROOT/'eloah-platform.js').read_text()
for href in re.findall(r"\['[^']+', '([^']+\.html[^']*)'",code):
 assert (ROOT/unquote(urlsplit(href).path)).is_file(), 'Missing catalogue file: '+href
for name in ['eloah-platform.js','eloah-mobile-app.js','eloah-navigation.js','eloah-2040-ui.js','eloah-2040-ai.js']:
 subprocess.run(['node','--input-type=module','--check'],input=(ROOT/name).read_text(),text=True,check=True)
ai=(ROOT/'eloah-2040-ai.js').read_text()
assert 'eloah-2040-founder-ai' in ai
assert "storageKey:'eloah-founder-auth-v1'" in ai
assert "scope:'local'" in ai
assert 'ticket!==revision' in ai
assert 'localStorage.clear(' not in ai
print('Static release checks: OK')
