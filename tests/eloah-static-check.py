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
# ELOAH routine preference-save regression: button works without preloaded auth.
routine_html=(ROOT/'eloah-routines.html').read_text()
routine_code=(ROOT/'eloah-routines.js').read_text()
routine_catalogue=(ROOT/'eloah-routines-catalogue.js').read_text()
rp=Page();rp.feed(routine_html)
assert len(rp.ids)==len(set(rp.ids)), 'Duplicate routine DOM IDs'
assert 'id="save-preferences"' in routine_html
save_button=next(tag for tag in re.findall(r'<button[^>]*>',routine_html) if 'id="save-preferences"' in tag)
assert ' disabled' not in save_button.lower(), 'Preferences button must be clickable before login'
for required in ('localSave(id,value)','localClear(id)','routine-login','save-preferences'):
 assert required in routine_code, 'Routine save fallback missing: '+required
for f in ['eloah-routines.js','eloah-routines-catalogue.js']:
 subprocess.run(['node','--input-type=module','--check'],input=(ROOT/f).read_text(),text=True,check=True)
for url in rp.urls:
 u=urlsplit(url)
 if not u.scheme and u.path:assert (ROOT/unquote(u.path)).is_file(), 'Missing routine dependency: '+url
for required in ('digest-items','x.next_action','eloah-mail-agent.html','eq("priority","P1")'):
 assert required in routine_code, 'Source-backed digest rendering missing: '+required
assert 'digest-items' in routine_html, 'Digest CSS missing'
print('Static release checks: OK')
