"""Check that research pages retain their registered starting question before publishing."""
from pathlib import Path
import json
from lxml import html

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
registry = json.loads((dist / 'data/enquetes.json').read_text())
by_id = {item['id']: item for item in registry['investigations']}
errors = []
checked = 0
for page in sorted(dist.glob('*.html')):
    tree = html.fromstring(page.read_text())
    for article in tree.xpath('//article'):
        ident = article.get('data-investigation')
        if ident not in by_id:
            errors.append(f'{page.name}: enquête absente du registre')
            continue
        investigation = by_id[ident]
        reminders = article.xpath('.//*[@data-research-focus=$ident]', ident=ident)
        if len(reminders) != 1:
            errors.append(f'{page.name}: un rappel de question requis')
            continue
        reminder = reminders[0]
        paragraphs = [' '.join(p.text_content().split()) for p in reminder.xpath('./p')]
        if investigation['original_question'] not in paragraphs:
            errors.append(f'{page.name}: question de départ absente ou modifiée')
        if not reminder.xpath('.//*[@data-step-contribution][normalize-space()]'):
            errors.append(f'{page.name}: rôle de l’étape absent')
        if '/' + page.name != investigation['synthesis']:
            if not reminder.xpath('.//a[@href=$url]', url=investigation['synthesis']):
                errors.append(f'{page.name}: lien vers la synthèse absent')
        checked += 1
for item in by_id.values():
    for path in [item['entry'], item['synthesis']]:
        if not (dist / path.lstrip('/')).exists():
            errors.append(f'{item["id"]}: page de référence absente {path}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Continuité vérifiée : {checked} articles ; question, rôle et synthèse présents.')
