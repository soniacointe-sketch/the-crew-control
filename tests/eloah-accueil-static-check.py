"""Offline regression checks for the public ELOAH home. No account or network access."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import subprocess

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.urls, self.tags, self.photos = [], [], {}, 0
    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if 'id' in attributes:
            self.ids.append(attributes['id'])
            self.tags[attributes['id']] = tag
        if tag in ('a', 'link', 'script'):
            url = attributes.get('href') or attributes.get('src')
            if url:
                self.urls.append(url)
        if tag == 'img' and attributes.get('loading') == 'lazy':
            self.photos += 1

page = Page()
page.feed((ROOT / 'mes-univers.html').read_text(encoding='utf-8'))
assert len(page.ids) == len(set(page.ids)), 'Duplicate IDs'
for url in page.urls:
    target = urlsplit(url)
    if not target.scheme and not target.netloc and target.path:
        assert (ROOT / unquote(target.path)).is_file(), 'Missing file: ' + url
    if not target.path and target.fragment:
        assert unquote(target.fragment) in page.ids, 'Missing anchor: ' + url
assert page.tags['mes-projets'] == 'details'
assert page.tags['services'] == 'details'
assert page.tags['maisons'] == 'details'
assert page.photos == 60, 'The existing photo references must be preserved'
for element in ('eloah-search-work', 'home-universe-reset', 'home-new-project', 'home-tasks', 'home-directory'):
    assert element in page.ids, 'Missing interactive element: ' + element
code = (ROOT / 'eloah-accueil-pro.js').read_text(encoding='utf-8')
subprocess.run(['node', '--check'], input=code, text=True, check=True)
assert 'localStorage.setItem' not in code, 'Home summaries are read-only'
assert 'localStorage.removeItem' not in code, 'Home summaries may not remove stored data'
assert 'localStorage.clear' not in code
assert 'supabase' not in code.lower(), 'Authentication remains in the existing account pages'
print('ELOAH home: IDs, local targets, disclosure panels, 60 images and JavaScript OK.')
