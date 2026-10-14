/* ELOAH · navigation partagée. Aucun accès aux comptes, projets ou stockages privés. */
(() => {
  'use strict';
  if (window.ELOAHPlatform) return;
  const routes = [
    ['Mon accueil', 'mes-univers.html', 'Organiser', 'univers projets accueil'],
    ['Mon organisation', 'eloah-pilotage.html', 'Organiser', 'planning calendrier actions'],
    ['ELOAH Boards', 'eloah-trello.html', 'Organiser', 'tableaux cartes taches'],
    ['ELOAH Studio', 'eloah-partenaire.html?rubrique=ELOAH%20Studio', 'Créer', 'creation design'],
    ['Reel Studio', 'eloah-reel-studio.html', 'Créer', 'video montage reels'],
    ['Mes images', 'eloah-reel-mes-images.html', 'Créer', 'photos visuels'],
    ['Studio d’articles', 'eloah-power-glam-article-studio.html', 'Créer', 'textes redaction blog'],
    ['ELOAH Music', 'eloah-music.html', 'Créer', 'musique sons audio'],
    ['Mes documents', 'eloah-bibliotheque.html?type=fichiers', 'Retrouver', 'bibliotheque fichiers'],
    ['Bases d’expertise', 'eloah-bibliotheque.html?type=bases', 'Retrouver', 'sources savoir recherches'],
    ['Formations', 'eloah-partenaire.html?rubrique=Formations', 'Retrouver', 'apprendre cours'],
    ['Mes entretiens', 'eloah-partenaire.html?rubrique=Entretiens', 'Retrouver', 'rendez vous preparation'],
    ['Mailing', 'eloah-partenaire.html?rubrique=Mailing', 'Créer', 'emails communication'],
    ['Power & Glam', 'power-glam-control.html', 'Univers', 'maison editoriale'],
    ['The Crew Orchies', 'eloah-the-crew.html', 'Univers', 'association danse'],
    ['SONIA OS', 'sonia-os.html', 'Univers', 'agents pilotage'],
    ['ELOAH Cortex', 'eloah-cortex.html', 'Univers', 'centre pilotage'],
    ['IA 2040 · fondatrice', 'eloah-2040.html#assistant-reel', 'Comptes', 'assistant intelligence fondatrice'],
    ['Accès fondatrice', 'eloah-fondatrice.html', 'Comptes', 'connexion sonia prive'],
    ['Mon compte client', 'eloah-espace-prive.html', 'Comptes', 'connexion cliente abonnement'],
    ['Offres ELOAH', 'eloah-offres.html', 'Aide', 'tarifs presentation'],
    ['Installer ELOAH', 'eloah-installer.html', 'Aide', 'application telephone pwa'],
    ['Diagnostic de l’application', 'eloah-diagnostic.html', 'Aide', 'aide fonctionnement connexion']
  ].map(([label, href, group, keywords]) => Object.freeze({label, href, group, keywords}));
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr-FR').trim();
  let host, dialog, search, list, count, previousFocus;
  function element(tag, text, attributes = {}) {
    const node = document.createElement(tag);
    if (text !== null) node.textContent = text;
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }
  function render() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    const found = routes.filter(r => terms.every(term => normalize(`${r.label} ${r.group} ${r.keywords}`).includes(term)));
    list.replaceChildren();
    let group = '';
    for (const entry of found) {
      if (entry.group !== group) {
        group = entry.group;
        list.append(element('h3', group));
      }
      const link = element('a', entry.label, {href:entry.href});
      link.append(element('span', '↗', {'aria-hidden':'true'}));
      list.append(link);
    }
    if (!found.length) list.append(element('p', 'Aucun outil trouvé. Essaie « planning », « vidéo » ou « documents ».', {class:'empty'}));
    count.textContent = `${found.length} outil${found.length > 1 ? 's' : ''}`;
  }
  function build() {
    if (dialog) return;
    host = element('div', null, {id:'eloah-platform-host'});
    const shadow = host.attachShadow({mode:'open'});
    const style = element('style', `
      :host{font:14px/1.5 system-ui,-apple-system,sans-serif;color-scheme:dark}
      *{box-sizing:border-box}dialog{width:min(640px,calc(100vw - 24px));max-height:85dvh;margin:auto;padding:24px;color:#fff1ed;background:#21101f;border:1px solid #96775e;border-radius:20px;box-shadow:0 24px 80px #0009;overflow:auto}
      dialog::backdrop{background:#0b080cc7;backdrop-filter:blur(5px)}
      header{display:flex;align-items:start;justify-content:space-between;gap:16px}
      h2{font:30px/1.2 Georgia,serif;margin:0 0 8px;color:#efd5a9}h3{font:600 10px/1.5 system-ui;text-transform:uppercase;letter-spacing:.13em;color:#cfb799;margin:18px 4px 6px}
      p{font-size:12px;line-height:1.6;color:#cfbfca;margin:0 0 16px}button,input,a{font:inherit}button{min-height:44px;padding:9px 13px;background:#352232;border:1px solid #725768;border-radius:10px;color:#efd5a9;cursor:pointer}
      label{display:block;font-size:12px;color:#efd5a9;margin:10px 0 6px}input{width:100%;min-height:48px;padding:12px 14px;color:#fff4ed;background:#130b16;border:1px solid #997481;border-radius:10px;font-size:16px}
      .meta{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:11px;color:#c9b7c5;margin:9px 0}
      nav{max-height:48dvh;overflow:auto;overscroll-behavior:contain;padding:0 3px 3px}a{min-height:46px;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:11px 13px;border:1px solid #554052;border-radius:10px;margin:6px 0;color:#f4e7df;text-decoration:none;background:#2c1829}a:hover,a:focus-visible{background:#54354b;color:#fff}
      :is(a,button,input):focus-visible{outline:3px solid #efd5a9;outline-offset:2px}
      footer{font-size:11px;color:#cdbfca;border-top:1px solid #574355;padding-top:14px;margin-top:16px}.empty{padding:20px 4px}
      @media(max-width:480px){dialog{padding:18px;border-radius:16px}h2{font-size:26px}nav{max-height:45dvh}}
      @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
    `);
    dialog = element('dialog', null, {'aria-labelledby':'ep-title'});
    const header = element('header', null);
    const titleBlock = element('div', null);
    titleBlock.append(element('h2', 'Retrouver un outil', {id:'ep-title'}), element('p', 'Un accès commun, sans mélanger tes espaces.'));
    const close = element('button', 'Fermer', {type:'button', 'aria-label':'Fermer la recherche'});
    close.addEventListener('click', () => dialog.close());
    header.append(titleBlock, close);
    search = element('input', null, {id:'ep-search', type:'search', autocomplete:'off', placeholder:'Planning, images, formations…'});
    const meta = element('div', null, {class:'meta'});
    count = element('span', '', {role:'status', 'aria-live':'polite'});
    meta.append(count, element('span', 'Recherche locale · Ctrl/Cmd + K'));
    list = element('nav', null, {'aria-label':'Outils disponibles'});
    dialog.append(header, element('label', 'Quel outil cherches-tu ?', {for:'ep-search'}), search, meta, list,
      element('footer', 'Les accès fondatrice et client restent distincts. Cette recherche ne lit aucun projet ni document.'));
    shadow.append(style, dialog);
    document.body.append(host);
    search.addEventListener('input', render);
    search.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); list.querySelector('a')?.focus(); }
      if (event.key === 'Enter') { event.preventDefault(); if (list.querySelectorAll('a').length === 1) list.querySelector('a').click(); }
    });
    list.addEventListener('keydown', event => {
      if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
      const links = Array.from(list.querySelectorAll('a'));
      const index = links.indexOf(shadow.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = index + (event.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) search.focus(); else links[Math.min(next, links.length - 1)]?.focus();
    });
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dialog.close(); } });
    dialog.addEventListener('close', () => { if (previousFocus?.isConnected) previousFocus.focus(); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  }
  function openTools(term = '') {
    build();
    previousFocus = document.activeElement;
    search.value = typeof term === 'string' ? term : '';
    render();
    if (!dialog.open) dialog.showModal();
    search.focus();
  }
  function mount() {
    const menu = document.querySelector('.eloah-global-nav .eloah-menu-links');
    if (menu && !document.getElementById('eloah-tools-trigger')) {
      const trigger = element('button', '⌕ Rechercher un outil', {id:'eloah-tools-trigger', type:'button', 'aria-haspopup':'dialog', 'aria-keyshortcuts':'Control+k Meta+k'});
      trigger.style.cssText = 'display:flex;align-items:center;min-height:44px;width:100%;padding:10px 12px;border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;margin:4px 0 12px';
      trigger.addEventListener('click', () => openTools());
      menu.prepend(trigger);
    }
  }
  window.ELOAHPlatform = Object.freeze({openTools, isToolsOpen:()=>!!dialog?.open, routes:Object.freeze(routes.slice()), version:'11.0'});
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault(); openTools();
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
  window.addEventListener('load', mount, {once:true});
})();
