/* ELOAH · navigation partagée. Aucun accès aux comptes, projets ou stockages privés. */
(() => {
  'use strict';
  if (window.ELOAHPlatform) return;
  const routes = [
  [
    "Accueil ELOAH",
    "mes-univers.html",
    "Accueil",
    "point depart accueil"
  ],
  [
    "Mon organisation",
    "eloah-pilotage.html",
    "Mon organisation",
    "planning agenda calendrier projets"
  ],
  [
    "Mes tableaux · Boards",
    "eloah-trello.html",
    "Mon organisation",
    "cartes taches"
  ],
  [
    "Centre d’actions",
    "eloah-actions.html",
    "Mon organisation",
    "taches echeances"
  ],
  [
    "Notes et préparation",
    "eloah-partenaire.html?rubrique=Mon%20Espace",
    "Mon organisation",
    "control partenaire idees"
  ],
  [
    "Mes documents",
    "eloah-bibliotheque.html?type=fichiers",
    "Mon organisation",
    "bibliotheque fichiers"
  ],
  [
    "Bases d’expertise",
    "eloah-bibliotheque.html?type=bases",
    "Mon organisation",
    "sources savoir"
  ],
  [
    "Mes entretiens",
    "eloah-entretiens-control.html",
    "Mon organisation",
    "rendez vous preparation"
  ],
  [
    "Mes routines",
    "eloah-routines.html",
    "Mon organisation",
    "habitudes"
  ],
  [
    "Formations",
    "eloah-partenaire.html?rubrique=Formations",
    "Mon organisation",
    "cours apprendre"
  ],
  [
    "Power & Glam",
    "power-glam-control.html",
    "Mes univers",
    "editorial amour beaute argent desir vie"
  ],
  [
    "The Crew Orchies",
    "index.html",
    "Mes univers",
    "association danse"
  ],
  [
    "Sonia Velka",
    "sonia-velka-control.html",
    "Mes univers",
    "personnel identite"
  ],
  [
    "PARISIS ENGINE",
    "eloah-parisis.html",
    "Mes univers",
    "recherche histoire"
  ],
  [
    "Foi & spiritualité",
    "foi-control.html",
    "Mes univers",
    "priere bible"
  ],
  [
    "Le Lion Blanc",
    "lion-blanc-control.html",
    "Mes univers",
    "association citoyenne"
  ],
  [
    "Dark Energy",
    "dark-energy-control.html",
    "Mes univers",
    "creation"
  ],
  [
    "Etsy Factory",
    "etsy-factory-control.html",
    "Mes univers",
    "produits templates"
  ],
  [
    "Atelier Élan",
    "atelier-elan.html",
    "Mes univers",
    "atelier"
  ],
  [
    "Studio de création",
    "eloah-partenaire.html?rubrique=ELOAH%20Studio",
    "Mes studios",
    "design"
  ],
  [
    "Reel Studio",
    "eloah-reel-studio.html",
    "Mes studios",
    "video montage"
  ],
  [
    "Mes images",
    "eloah-reel-mes-images.html",
    "Mes studios",
    "photos visuels"
  ],
  [
    "Studio d’articles",
    "eloah-power-glam-article-studio.html",
    "Mes studios",
    "textes blog"
  ],
  [
    "ELOAH Music",
    "eloah-music.html",
    "Mes studios",
    "musique sons audio dj mix"
  ],
  [
    "SNAP · Stories",
    "eloah-snap.html",
    "Mes studios",
    "stories photo"
  ],
  [
    "NUMERA",
    "eloah-numera.html",
    "Mes studios",
    "chiffres musique"
  ],
  [
    "Mailing",
    "eloah-partenaire.html?rubrique=Mailing",
    "Mes studios",
    "email newsletter"
  ],
  [
    "WordPress",
    "eloah-wordpress.html",
    "Mes studios",
    "publication site"
  ],
  [
    "Mon assistante · ELOAH 2040",
    "eloah-2040.html#assistant-reel",
    "Mon assistante",
    "ia intelligence fondatrice"
  ],
  [
    "Mes missions · Cortex",
    "eloah-cortex.html",
    "Mon assistante",
    "pilotage validation"
  ],
  [
    "Mes agents · SONIA OS",
    "sonia-os.html",
    "Mon assistante",
    "agents siege"
  ],
  [
    "Ma mémoire · Passerelles",
    "eloah-passerelles.html",
    "Mon assistante",
    "memoire conversations import chatgpt"
  ],
  [
    "MAIA",
    "eloah-maia.html",
    "Mon assistante",
    "assistance"
  ],
  [
    "Agent Courrier",
    "eloah-mail-agent.html",
    "Mon assistante",
    "courrier"
  ],
  [
    "Connexions · Passerelles",
    "eloah-passerelles.html",
    "Réglages",
    "applications modeles reglages"
  ],
  [
    "Compte fondatrice",
    "eloah-fondatrice.html",
    "Réglages",
    "connexion sonia prive"
  ],
  [
    "Compte client",
    "eloah-espace-prive.html",
    "Réglages",
    "connexion cliente"
  ],
  [
    "Sauvegardes",
    "eloah-sauvegardes.html",
    "Réglages",
    "recuperation fichiers"
  ],
  [
    "Supervision · Monitor",
    "eloah-monitor.html",
    "Réglages",
    "surveillance technique"
  ],
  [
    "Gestion clients",
    "eloah-gestion-clients.html",
    "Réglages",
    "abonnements accompagnement"
  ],
  [
    "Mailing & Revenus",
    "eloah-mailing-revenus.html",
    "Réglages",
    "stripe resend transactions"
  ],
  [
    "Offres ELOAH",
    "eloah-offres.html",
    "Réglages",
    "tarifs"
  ],
  [
    "Installer ELOAH",
    "eloah-installer.html",
    "Réglages",
    "telephone application pwa"
  ],
  [
    "Diagnostic",
    "eloah-diagnostic.html",
    "Réglages",
    "aide fonctionnement"
  ]
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

    // Shared tools window: the light editorial palette also applies from alternate entry pages.
    {
      style.textContent += `
        :host{color-scheme:light;color:#082f36}
        dialog{background:#fffcf6;color:#082f36;border:1px solid #dcc5b4;border-radius:10px;box-shadow:0 20px 60px #082f3626}
        dialog::backdrop{background:#082f3680;backdrop-filter:blur(4px)}
        h2{font-family:"Bodoni 72","Bodoni MT",Didot,Georgia,serif;color:#082f36}
        h3,label{color:#126c78}
        p,.meta,footer{color:#47656a}
        button{background:#bcedea;border-color:#8bbdbf;color:#082f36;border-radius:6px}
        button:hover{background:#a9e0dd}
        input{background:#fffdf7;border-color:#7a9c9f;color:#082f36;border-radius:6px}
        input::placeholder{color:#56757b;opacity:1}
        a{background:#f4efe7;border-color:#d3dcd5;color:#082f36;border-radius:6px}
        a:hover,a:focus-visible{background:#bcedea;border-color:#8bbdbf;color:#082f36}
        :is(a,button,input):focus-visible{outline-color:#126c78}
        footer{border-color:#dcc5b4}
        @media(max-width:480px){dialog{border-radius:10px}header{gap:10px}header>div{min-width:0}h2{overflow-wrap:anywhere}header>button{flex-shrink:0}}
      `;
    }
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
  window.ELOAHPlatform = Object.freeze({openTools, isToolsOpen:()=>!!dialog?.open, routes:Object.freeze(routes.slice()), version:'12-six-rubriques'});
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault(); openTools();
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
  window.addEventListener('load', mount, {once:true});
})();

/* Power & Glam: one sidebar, existing destinations and local data preserved. */
(() => {
  'use strict';
  if (location.pathname.split('/').pop() !== 'power-glam-control.html') return;
  function consolidate() {
    if (document.getElementById('pg-menu-sections')) return;
    const side = document.querySelector('body > aside');
    const local = document.getElementById('nav');
    const globalNav = document.querySelector('body > .eloah-global-nav');
    const globalLinks = globalNav?.querySelector('.eloah-menu-links');
    const main = document.querySelector('body > main');
    if (!side || !local || !side.contains(local) || !globalLinks || !main) return;
    const el = (tag, text, id) => {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      if (id) node.id = id;
      return node;
    };
    const style = el('style', '', 'pg-one-menu-style');
    style.textContent = `
      body.eloah-screen.pg-control-one-menu{padding-left:0!important}
      body.pg-control-one-menu>aside{inset:0 auto 0 0!important;width:250px;padding:26px 16px;background:#111;color:#f4efe7;overflow:auto;height:100dvh;z-index:100}
      body.pg-control-one-menu>main{margin-left:250px;width:calc(100% - 250px);padding:0 clamp(20px,3vw,48px);min-width:0}
      body.pg-control-one-menu>aside>.navlabel{display:none}
      body.pg-control-one-menu>aside>.brand{display:block;padding:0 12px;font-size:27px;line-height:1.1;color:#f4efe7}
      body.pg-control-one-menu>aside>.brand span{font-size:32px}
      body.pg-control-one-menu>aside>.brand small{color:#bbb4ab;letter-spacing:.13em;margin-top:15px}
      body.pg-control-one-menu .pg-menu-access{display:grid;gap:8px;margin:22px 0 16px}
      body.pg-control-one-menu .pg-menu-access :is(a,button){display:flex;align-items:center;width:100%;min-height:44px;margin:0;padding:10px 12px;text-decoration:none;text-align:left;background:#191919;border:1px solid #504743;border-radius:7px;color:#f4efe7;font:13px/1.4 system-ui}
      body.pg-control-one-menu .pg-menu-access :is(a,button):hover{background:#302525}
      body.pg-control-one-menu :is(#pg-menu-sections,#pg-other-spaces){min-width:0;margin:0;padding:0;border:0;background:transparent}
      body.pg-control-one-menu :is(#pg-menu-sections,#pg-other-spaces)>summary{color:#f4efe7;min-height:44px;padding:12px;font:600 13px/1.4 system-ui;cursor:pointer}
      body.pg-control-one-menu #pg-menu-sections>summary{display:none}
      body.pg-control-one-menu #pg-menu-current{display:block;color:#cec3bc;font:11px/1.5 system-ui;margin-top:5px}
      body.pg-control-one-menu #pg-menu-sections>#nav{display:grid;gap:3px;margin:0;overflow:visible;max-height:none}
      body.pg-control-one-menu #nav a{min-width:0;min-height:44px;padding:10px 12px;white-space:normal;color:#d8d0c9;font:13px/1.4 system-ui;align-items:center}
      body.pg-control-one-menu #nav a span{display:block;flex:0 0 20px;width:20px;color:#a9a198;font-size:11px}
      body.pg-control-one-menu #nav a.active{background:#312323;color:#fff5ef;border-left:3px solid #d32027}
      body.pg-control-one-menu #nav a:hover{background:#282323;color:#fff}
      body.pg-control-one-menu #pg-other-spaces{border-top:1px solid #48403b;margin-top:16px;padding-top:8px}
      body.pg-control-one-menu #pg-other-spaces .eloah-menu-links{position:static!important;max-height:none!important;width:100%!important;overflow:visible!important;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;padding:0!important;white-space:normal}
      body.pg-control-one-menu #pg-other-spaces .eloah-menu-links a{display:flex;align-items:center;min-height:44px;padding:10px 12px;font:13px/1.4 system-ui;color:#d8d0c9;text-decoration:none;white-space:normal}
      body.pg-control-one-menu #pg-other-spaces .eloah-menu-links a:hover{background:#302525;color:#fff}
      body.pg-control-one-menu #pg-other-spaces .eloah-nav-analytics>summary{background:transparent;color:#f4efe7;border:0;min-height:44px}
      body.pg-control-one-menu>aside :is(a,button,summary):focus-visible{outline:2px solid #ead4b4!important;outline-offset:2px}
      body.pg-control-one-menu>main>header{height:auto;min-height:68px;flex-wrap:wrap;gap:10px;padding:12px 0}
      body.pg-control-one-menu #breadcrumb{flex:1 1 180px;line-height:1.5}
      body.pg-control-one-menu #pg-resources-panel{margin:14px 0 0;border:1px solid var(--line);border-radius:10px;background:#faf7f1;min-width:0}
      body.pg-control-one-menu #pg-resources-panel>summary{cursor:pointer;min-height:52px;padding:15px 18px;color:#312629;font:600 13px/1.6 system-ui}
      body.pg-control-one-menu #pg-resources-panel>summary small{color:#665e58;font:12px/1.5 system-ui;margin-left:10px}
      body.pg-control-one-menu #pg-resources-panel>:not(summary){margin-left:18px;margin-right:18px}
      body.pg-control-one-menu #pg-resources-panel>:last-child{margin-bottom:18px}
      body.pg-control-one-menu #view{min-width:0;padding-top:24px}
      body.pg-control-one-menu #view>.cockpitintro{padding-top:8px}
      body.pg-control-one-menu>main>footer{flex-wrap:wrap}
      @media(max-width:900px){
        body.pg-control-one-menu>aside{position:static!important;inset:auto!important;width:100%;height:auto;padding:16px}
        body.pg-control-one-menu>main{width:100%;margin-left:0;padding:0 16px}
        body.pg-control-one-menu>aside>.brand{font-size:19px;padding:0;line-height:1.3}
        body.pg-control-one-menu>aside>.brand span{display:inline;font-size:21px;margin:0 0 0 4px}
        body.pg-control-one-menu>aside>.brand small{display:none}
        body.pg-control-one-menu .pg-menu-access{grid-template-columns:1fr 1fr;margin:13px 0 10px}
        body.pg-control-one-menu .pg-menu-access :is(a,button){font-size:12px;padding:9px 10px}
        body.pg-control-one-menu #pg-menu-sections>summary{display:list-item;list-style-position:inside;border:1px solid #504743;border-radius:8px}
        body.pg-control-one-menu #pg-menu-sections>#nav{padding:10px 0;grid-template-columns:repeat(2,minmax(0,1fr))}
        body.pg-control-one-menu #pg-other-spaces{margin-top:8px;padding-top:5px}
        body.pg-control-one-menu #pg-resources-panel>summary small{display:block;margin:5px 0 0}
        body.pg-control-one-menu #view{padding-top:19px}
      }
      @media(prefers-reduced-motion:reduce){body.pg-control-one-menu *{scroll-behavior:auto!important}}
    `;
    const sections = el('details', '', 'pg-menu-sections');
    const summary = el('summary', 'Menu Power & Glam');
    const current = el('span', '', 'pg-menu-current');
    summary.append(current);
    local.before(sections);
    sections.append(summary, local);
    local.setAttribute('aria-label', 'Rubriques Power & Glam');
    const other = el('details', '', 'pg-other-spaces');
    const otherSummary = el('summary', 'Autres espaces ELOAH');
    other.append(otherSummary, globalLinks);
    sections.after(other);
    const access = el('div'); access.className = 'pg-menu-access';
    const home = el('a', '← Accueil ELOAH'); home.href = 'mes-univers.html';
    let tools = globalLinks.querySelector('#eloah-tools-trigger');
    if (!tools) {
      tools = el('button', '⌕ Rechercher un outil'); tools.type = 'button';
      tools.addEventListener('click', () => {
        if (window.ELOAHPlatform) window.ELOAHPlatform.openTools();
        else { other.open = true; otherSummary.focus(); }
      });
    }
    tools.setAttribute('data-pg-tools', ''); tools.setAttribute('aria-haspopup', 'dialog');
    access.append(home, tools); sections.before(access);
    // Keep all existing studio/universe links, without repeating a full panel on every view.
    const panels = ['pg-quick-access', 'pg-editorial-doors', 'pg-article-studio-entry'].map(id => document.getElementById(id));
    if (panels.every(node => node?.parentElement === main)) {
      const resources = el('details', '', 'pg-resources-panel');
      const resourceSummary = el('summary', 'Univers & studios');
      resourceSummary.append(el('small', 'Les cinq univers, la photothèque et les raccourcis de création'));
      panels[0].before(resources); resources.append(resourceSummary, ...panels);
    }
    document.head.append(style);
    document.body.classList.add('pg-control-one-menu');
    globalNav.remove();
    const mobile = matchMedia('(max-width:900px)');
    function sync() { sections.open = !mobile.matches; }
    function updateCurrent() {
      const active = local.querySelector('a.active, a[aria-current="page"]');
      current.textContent = active ? active.textContent.replace(/^\s*(?:\d+|[IVX]+|C)\s*/, '').trim() : 'Choisir une rubrique';
    }
    function focusContent() {
      const target = document.querySelector('#view h1') || document.getElementById('view');
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true}); }
    }
    local.addEventListener('click', event => {
      if (!event.target.closest('a[href^="#"]') || !mobile.matches) return;
      sections.open = false; requestAnimationFrame(focusContent);
    });
    sections.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mobile.matches && sections.open) {
        event.preventDefault(); sections.open = false; summary.focus();
      }
    });
    sections.addEventListener('toggle', () => { if (!mobile.matches && !sections.open) sections.open = true; });
    new MutationObserver(updateCurrent).observe(local, {childList:true, subtree:true});
    window.addEventListener('hashchange', updateCurrent);
    mobile.addEventListener('change', sync); sync(); updateCurrent();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', consolidate, {once:true});
  else consolidate();
  window.addEventListener('load', consolidate, {once:true});
})();
