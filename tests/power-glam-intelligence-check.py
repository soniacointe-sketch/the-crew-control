"""Offline structural checks. Browser tests in the delivery use simulated auth/AI."""
from pathlib import Path
import re, subprocess
ROOT = Path(__file__).resolve().parents[1]
js = (ROOT / 'power-glam-intelligence.js').read_text(encoding='utf-8')
css = (ROOT / 'power-glam-intelligence.css').read_text(encoding='utf-8')
loader = (ROOT / 'eloah-lecture-universelle.js').read_text(encoding='utf-8')
subprocess.run(['node', '--check'], input=js, text=True, check=True)
subprocess.run(['node', '--check'], input=loader, text=True, check=True)
assert "!== 'power-glam-control.html'" in js
assert "storageKey:'eloah-founder-auth-v1'" in js
assert '/functions/v1/eloah-2040-founder-ai' in js
assert "scope:'local'" in js
assert 'ticket!==generation' in js and 'authGeneration' in js
assert "window.openEditor(type)" in js
assert 'power-glam-intelligence.js?v=1.0' in loader
assert ':host' in css and 'prefers-reduced-motion' in css
for forbidden in ('localStorage.getItem', 'localStorage.setItem', 'sessionStorage.', 'client.from(', 'service_role', 'sk-proj-', '.submit()'):
    assert forbidden not in js, forbidden
ids = re.findall(r'\bid="([a-z-]+)"', js)
assert len(ids) == len(set(ids)), 'Duplicate shadow DOM IDs'
for name in re.findall(r"q\('([a-z-]+)'\)", js):
    assert name in ids, 'Missing element '+name
for name in ('eloah-fondatrice.html','eloah-power-glam-article-studio.html','power-glam-control.html'):
    assert (ROOT / name).is_file(), 'Missing destination '+name
print('Power & Glam Intelligence: syntax, scope, gateway, DOM and local destinations OK.')
