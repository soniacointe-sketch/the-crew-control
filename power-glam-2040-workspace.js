/* Power & Glam 2040 — presentation controls only.
   No account reads, network calls or business-data writes. */
(() => {
  'use strict';
  if (location.pathname.split('/').pop() !== 'power-glam-control.html') return;
  const init = () => {
    const main = document.querySelector('body > main');
    const view = document.getElementById('view');
    const nav = document.getElementById('nav');
    if (!main || !view || !nav || !document.body.classList.contains('pg-control-one-menu') || document.getElementById('pg2040-display')) return;
    const make = (tag, text, attrs = {}) => {
      const node = document.createElement(tag);
      if (text !== null) node.textContent = text;
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      return node;
    };
    const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr-FR').trim();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let work = false, paused = reduced.matches, filter = 'all', menuTerm = '';
    const display = make('div', null, {id:'pg2040-display', role:'group', 'aria-label':'Affichage du cockpit'});
    const workButton = make('button', 'Mode travail', {id:'pg2040-work', type:'button', 'aria-pressed':'false', title:'Réduire le décor et les espacements sans masquer les outils'});
    const motionButton = make('button', '', {id:'pg2040-motion', type:'button', 'aria-pressed':'false'});
    display.append(workButton, motionButton);
    main.querySelector(':scope > header')?.append(display);
    function refreshDisplay() {
      document.body.classList.toggle('pg2040-work', work);
      document.body.classList.toggle('pg2040-paused', paused || reduced.matches);
      workButton.setAttribute('aria-pressed', String(work));
      motionButton.setAttribute('aria-pressed', String(paused || reduced.matches));
      workButton.textContent = work ? 'Quitter le mode travail' : 'Mode travail';
      motionButton.textContent = paused || reduced.matches ? 'Animation arrêtée' : 'Arrêter l’animation';
      motionButton.disabled = reduced.matches;
      motionButton.title = reduced.matches ? 'Animations réduites dans les préférences de cet appareil.' : 'Arrêter ou reprendre les anneaux décoratifs.';
    }
    workButton.addEventListener('click', () => { work = !work; refreshDisplay(); });
    motionButton.addEventListener('click', () => { paused = !paused; refreshDisplay(); });
    reduced.addEventListener('change', () => { paused = reduced.matches; refreshDisplay(); });
    refreshDisplay();

    const searchBox = make('div', null, {id:'pg2040-menu-search'});
    const input = make('input', null, {id:'pg2040-menu-query', type:'search', placeholder:'Trouver une rubrique…', autocomplete:'off', maxlength:'80', 'aria-controls':'nav'});
    const count = make('span', '', {id:'pg2040-menu-count', role:'status', 'aria-live':'polite'});
    const reset = make('button', 'Tout afficher', {type:'button', id:'pg2040-menu-reset'});
    reset.hidden = true;
    searchBox.append(make('label', 'Dans Power & Glam', {for:input.id}), input, count, reset);
    nav.before(searchBox);
    function filterMenu() {
      const words = normalize(menuTerm).split(/\s+/).filter(Boolean);
      const links = Array.from(nav.querySelectorAll('a'));
      let visible = 0;
      for (const link of links) {
        const match = words.every(word => normalize(link.textContent).includes(word));
        link.hidden = !match; if (match) visible++;
      }
      count.textContent = words.length ? `${visible} rubrique${visible > 1 ? 's' : ''} trouvée${visible > 1 ? 's' : ''}` : `${links.length} rubriques`;
      reset.hidden = !menuTerm;
    }
    function clearMenu() { menuTerm = ''; input.value = ''; filterMenu(); }
    input.addEventListener('input', () => { menuTerm = input.value; filterMenu(); });
    reset.addEventListener('click', () => { clearMenu(); input.focus(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); clearMenu(); }
      if (event.key === 'ArrowDown') { event.preventDefault(); nav.querySelector('a:not([hidden])')?.focus(); }
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) clearMenu(); });
    new MutationObserver(filterMenu).observe(nav, {childList:true, subtree:true});
    filterMenu();

    const groups = {sites:'editorial', unified:'editorial', mailing:'editorial', creative:'creation', personal:'creation', program:'creation', health:'pilotage', stripe:'pilotage', vault:'pilotage'};
    const labels = {all:'Tous les espaces', editorial:'Publier', creation:'Créer', pilotage:'Piloter'};
    function applyFilter() {
      const cards = Array.from(view.querySelectorAll('.cockpitgrid > .cockpitcard'));
      if (!cards.length) return;
      let visible = 0;
      cards.forEach(card => {
        const key = (card.getAttribute('href') || '').replace(/^#/, '');
        card.hidden = filter !== 'all' && groups[key] !== filter;
        if (!card.hidden) visible++;
      });
      view.querySelectorAll('[data-pg2040-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pg2040Filter === filter)));
      const result = document.getElementById('pg2040-card-count');
      if (result) result.textContent = `${visible} espace${visible > 1 ? 's' : ''} · liens et statuts existants`;
    }
    function enhanceView() {
      const hero = view.querySelector('.cockpitintro');
      const grid = view.querySelector('.cockpitgrid');
      if (!hero || !grid || hero.querySelector('.pg2040-hero-actions')) return;
      const paragraph = hero.querySelector(':scope > p');
      if (paragraph?.textContent === 'Pilotez vos sites, votre mailing et votre studio depuis ici.') paragraph.textContent = 'Tes idées, tes contenus et ta prochaine publication. Choisis par où commencer.';
      const halo = make('div', null, {class:'pg2040-halo', 'aria-hidden':'true'});
      for (let i=0; i<3; i++) halo.append(make('i', null));
      hero.prepend(halo);
      const actions = make('div', null, {class:'pg2040-hero-actions', 'aria-label':'Actions de création'});
      // The existing editor handles this event; nothing is saved by this module.
      actions.append(make('button', '＋ Écrire un contenu', {type:'button', 'data-add':'contents', class:'pg2040-main-action'}), make('a', 'Mon planning ↗', {href:'#calendar'}), make('a', 'ELOAH Intelligence ↗', {href:'eloah-2040.html#assistant-reel', title:'Ouvrir l’assistante ELOAH 2040 — connexion fondatrice requise'}));
      hero.append(actions);
      grid.id = 'pg2040-spaces';
      const bar = make('div', null, {class:'pg2040-space-bar'});
      const tabs = make('div', null, {class:'pg2040-filters', role:'group', 'aria-label':'Filtrer les espaces du cockpit'});
      Object.entries(labels).forEach(([key, label]) => {
        const button = make('button', label, {type:'button', 'data-pg2040-filter':key, 'aria-pressed':String(filter===key), 'aria-controls':grid.id});
        button.addEventListener('click', () => { filter = key; applyFilter(); });
        tabs.append(button);
      });
      bar.append(tabs, make('span', '', {id:'pg2040-card-count', role:'status', 'aria-live':'polite'}));
      grid.before(bar);
      grid.querySelectorAll('.cockpitcard').forEach(card => {
        const key = card.getAttribute('href').slice(1);
        card.dataset.pg2040Group = groups[key] || 'other';
      });
      applyFilter();
    }
    // Only listen for view replacement, not every hover, keystroke or DOM attribute.
    new MutationObserver(enhanceView).observe(view, {childList:true});
    enhanceView();
    // Keyboard focus for the current in-page route; existing hash routing is untouched.
    function reflectCurrent() {
      for (const link of nav.querySelectorAll('a')) {
        if (link.classList.contains('active')) link.setAttribute('aria-current','page');
        else link.removeAttribute('aria-current');
      }
    }
    new MutationObserver(reflectCurrent).observe(nav, {childList:true});
    window.addEventListener('hashchange', reflectCurrent); reflectCurrent();
  };
  function start() {
    init();
    if (document.getElementById('pg2040-display')) return;
    const ready = new MutationObserver(() => {
      if (!document.body.classList.contains('pg-control-one-menu')) return;
      init(); ready.disconnect();
    });
    ready.observe(document.body, {attributes:true, attributeFilter:['class']});
    window.addEventListener('pagehide', () => ready.disconnect(), {once:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
