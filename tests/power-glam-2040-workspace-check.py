"""Static checks for the Power & Glam-only presentation module (Python 3 + Node.js)."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parents[1]
js = (root / 'power-glam-2040-workspace.js').read_text(encoding='utf-8')
css = (root / 'power-glam-2040-workspace.css').read_text(encoding='utf-8')
loader = (root / 'eloah-lecture-universelle.js').read_text(encoding='utf-8')
subprocess.run(['node', '--check'], input=js, text=True, check=True)
subprocess.run(['node', '--check'], input=loader, text=True, check=True)
assert "!== 'power-glam-control.html'" in js
assert all(token not in js for token in ('localStorage', 'sessionStorage', 'fetch(', 'supabase', 'XMLHttpRequest'))
assert 'power-glam-2040-workspace.css?v=20261015-2' in loader
assert 'power-glam-2040-workspace.js?v=20261015-2' in loader
assert 'prefers-reduced-motion' in css and 'pg2040-paused' in css
assert "'aria-pressed'" in js and "'aria-controls'" in js
for name in ['power-glam-control.html', 'eloah-2040.html']:
    assert (root / name).is_file(), name
print('Power & Glam 2040: syntax, page scope, local controls and loader OK.')
