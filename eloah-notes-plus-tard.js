/* ELOAH · Mes notes à reprendre plus tard.
   Vue locale, en lecture seule, des fiches existantes. Aucune synchronisation,
   aucune collecte de données clientes, aucun rappel, aucune modification automatique.
*/
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('rubrique') !== 'Mon Espace') return;
  const storageKey = 'sonia-universe-v1-itriia';
  const list = document.getElementById('list');
  const search = document.getElementById('search');
  if (!list || !search) return;

  const section = document.createElement('section');
  section.id = 'eloah-notes-plus-tard';
  section.className = 'eloah-deferred-shelf';
  section.setAttribute('aria-labelledby', 'eloah-deferred-title');
  const header = document.createElement('div');
  header.className = 'eloah-deferred-head';
  const headline = document.createElement('div');
  const kicker = document.createElement('p');
  kicker.className = 'eloah-deferred-kicker';
  kicker.textContent = 'MON ESPACE · NOTES';
  const title = document.createElement('h3');
  title.id = 'eloah-deferred-title';
  title.textContent = 'À reprendre plus tard';
  headline.append(kicker, title);
  const counter = document.createElement('span');
  counter.className = 'eloah-deferred-counter';
  counter.setAttribute('aria-live', 'polite');
  header.append(headline, counter);
  const desc = document.createElement('p');
  desc.className = 'eloah-deferred-desc';
  desc.textContent = 'Tes notes volontairement mises en attente, sans date imposée. Elles restent dans ce navigateur.';
  const results = document.createElement('div');
  results.className = 'eloah-deferred-results';
  const status = document.createElement('p');
  status.className = 'eloah-deferred-storage';
  section.append(header, desc, results, status);
  list.parentNode.insertBefore(section, list);

  function loadItems() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(value)) throw Error('invalid_notes');
      return value.filter(item =>
        item && typeof item.title === 'string' &&
        /^À reprendre plus tard(?:\s*[·:—-]|\s*$)/i.test(item.title.trim()) &&
        typeof item.id === 'string' && item.module === 'Mon Espace' &&
        !item.archived && item.state !== 'Terminé'
      );
    } catch {
      return null;
    }
  }

  function focusNote(item) {
    search.value = item.title;
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const edit = [...list.querySelectorAll('button[data-edit]')]
      .find(el => el.dataset.edit === item.id);
    const card = edit?.closest('article.row');
    if (card) {
      card.classList.add('eloah-deferred-target');
      card.scrollIntoView({ block: 'center', behavior: 'smooth' });
      edit.focus({ preventScroll: true });
    } else {
      status.textContent = 'La fiche n’est pas visible. Efface la recherche et réessaie.';
    }
  }

  function update() {
    results.replaceChildren();
    const rows = loadItems();
    if (rows === null) {
      counter.textContent = '—';
      status.textContent = 'Lecture des notes locales impossible. Les données existantes n’ont pas été modifiées.';
      return;
    }
    counter.textContent = rows.length + (rows.length > 1 ? ' notes' : ' note');
    status.textContent = 'Aucun rappel automatique. Aucune synchronisation entre appareils.';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'eloah-deferred-empty';
      empty.textContent = 'Aucune note en attente sur cet appareil.';
      results.append(empty);
      return;
    }
    for (const item of rows.slice(0, 30)) {
      const row = document.createElement('div');
      row.className = 'eloah-deferred-item';
      const content = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = item.title.slice(0, 180);
      const meta = document.createElement('small');
      meta.textContent = (item.state || 'À faire') + ' · ' + (item.date ? 'Échéance : ' + item.date : 'Sans échéance');
      content.append(strong, meta);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'eloah-deferred-open';
      button.textContent = 'Voir la fiche →';
      button.setAttribute('aria-label', 'Retrouver la fiche ' + item.title.slice(0, 140));
      button.addEventListener('click', () => focusNote(item));
      row.append(content, button);
      results.append(row);
    }
    if (rows.length > 30) status.textContent = '30 notes affichées. Utilise la recherche pour les autres. Aucune synchronisation automatique.';
  }

  document.getElementById('form')?.addEventListener('submit', () => setTimeout(update, 0));
  list.addEventListener('click', event => {
    if (event.target.closest('button[data-archive]')) setTimeout(update, 0);
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) update();
  });
  update();
})();