/* Shared navigation behaviour. No storage, authentication or business state changes. */
(() => {
  'use strict';
  if (window.ELOAHNavigationHarmony || window.self !== window.top) return;
  window.ELOAHNavigationHarmony = true;
  function init() {
    const body = document.body;
    const page = location.pathname.split('/').pop();
    const global = document.querySelector('body > .eloah-global-nav');
    // Only primary navigation: never convert document inspectors, forms or file drawers.
    let side = document.querySelector('body > aside:has(nav), body > .layout > aside:has(nav), body > .shell > aside.side, body > .shell > aside.sidebar, body > .app > aside.side, #app > aside.side, #appShell > aside.side, body > .layout > aside.sidebar');
    if (side && getComputedStyle(side).display === 'none' && ['mes-univers.html','eloah-partenaire.html'].includes(page)) side = null;
    if (!side) side = document.querySelector('.pe-universal-bar') || global;
    if (!side) return;
    // An authenticated shell may still be hidden. Never surface its menu before sign-in.
    const ancestors = []; for (let node = side.parentElement; node && node !== body; node = node.parentElement) ancestors.push(node);
    if (ancestors.some(node => node.hidden || getComputedStyle(node).display === 'none')) {
      const observer = new MutationObserver(() => {
        if (ancestors.every(node => !node.hidden && getComputedStyle(node).display !== 'none')) { observer.disconnect(); init(); }
      });
      ancestors.forEach(node => observer.observe(node, {attributes:true, attributeFilter:['hidden','class','style']}));
      return;
    }
    side.classList.add('eloah-harmonized-side');
    const originalRole = side.getAttribute('role');
    const originalLabel = side.getAttribute('aria-label');
    if (!side.id) side.id = 'eloah-primary-navigation';
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'eloah-navigation-harmony.css?v=20261016-1'; document.head.append(css);
    if (global && side !== global) {
      const links = global.querySelector('.eloah-menu-links');
      if (links) {
        const group = document.createElement('details'); group.className = 'eloah-harmony-spaces';
        const summary = document.createElement('summary'); summary.textContent = 'Autres espaces ELOAH';
        group.append(summary, links); side.append(group);
      }
      global.classList.add('eloah-harmony-redundant');
      body.classList.add('eloah-harmony-native');
    }
    const parisisBar = document.querySelector('.pe-universal-bar');
    if (parisisBar && side !== parisisBar) {
      const links = parisisBar.querySelector('.pe-universal-desktop');
      if (links) {
        const group = document.createElement('details'); group.className = 'eloah-harmony-spaces';
        const summary = document.createElement('summary'); summary.textContent = 'Parcourir PARISIS';
        links.classList.remove('pe-universal-desktop'); group.append(summary, links); side.append(group);
      }
      parisisBar.classList.add('eloah-harmony-redundant');
    }
    if (!side.querySelector('a[href="mes-univers.html"]')) {
      const home = document.createElement('a'); home.href = 'mes-univers.html'; home.textContent = '← Accueil ELOAH'; home.className = 'eloah-harmony-home'; side.prepend(home);
    }
    const bar = document.createElement('div'); bar.className = 'eloah-harmony-bar';
    const home = document.createElement('a'); home.href = 'mes-univers.html'; home.textContent = '← ELOAH';
    const button = document.createElement('button'); button.type = 'button'; button.textContent = '☰ Menu';
    button.setAttribute('aria-controls', side.id); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Ouvrir le menu de navigation');
    button.style.cssText = 'background:transparent!important;color:inherit!important;-webkit-text-fill-color:currentColor!important';
    bar.append(home, button); body.prepend(bar);
    const closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.className = 'eloah-harmony-close'; closeButton.textContent = 'Fermer le menu ×'; closeButton.style.cssText = 'background:transparent!important;color:inherit!important;-webkit-text-fill-color:currentColor!important'; side.prepend(closeButton);
    const backdrop = document.createElement('div'); backdrop.className = 'eloah-harmony-backdrop'; backdrop.setAttribute('aria-hidden', 'true'); body.append(backdrop);
    const mobile = matchMedia('(max-width:1000px)');
    let opened = false, savedOverflow = '', inertElements = [];
    // Keep the existing nodes and handlers; only the shared container controls visibility.
    function expandSections() {
      side.querySelectorAll('.eloah-menu, .eloah-local-menu, #pg-menu-sections, #sonia-os-menu-sections, .pe-universal-mobile').forEach(details => { details.open = true; });
    }
    function lockBackground() {
      let current = side;
      while (current && current !== body) {
        for (const sibling of current.parentElement.children) {
          if (sibling === current || sibling === backdrop || sibling.matches('script,style,link')) continue;
          inertElements.push([sibling, sibling.inert]); sibling.inert = true;
        }
        current = current.parentElement;
      }
    }
    function unlockBackground() { inertElements.forEach(([node, value]) => { node.inert = value; }); inertElements = []; }
    function close(restoreFocus = true) {
      if (!opened) return;
      opened = false; body.classList.remove('eloah-navigation-open'); button.setAttribute('aria-expanded','false');
      body.style.overflow = savedOverflow; unlockBackground();
      if (originalRole) side.setAttribute('role', originalRole); else side.removeAttribute('role');
      side.removeAttribute('aria-modal');
      if (originalLabel) side.setAttribute('aria-label', originalLabel); else side.removeAttribute('aria-label');
      if (restoreFocus) button.focus();
    }
    function open() {
      if (!mobile.matches || opened) return;
      opened = true; savedOverflow = body.style.overflow; body.style.overflow = 'hidden';
      expandSections(); body.classList.add('eloah-navigation-open'); button.setAttribute('aria-expanded','true');
      side.setAttribute('role','dialog'); side.setAttribute('aria-modal','true'); side.setAttribute('aria-label','Menu de navigation');
      lockBackground(); closeButton.focus();
    }
    button.addEventListener('click', open); closeButton.addEventListener('click', () => close()); backdrop.addEventListener('click', () => close());
    // Retire old mobile triggers without removing elements their scripts still use.
    document.querySelectorAll('button[aria-controls="'+side.id+'"], #mobileMenu, #toggleMenu').forEach(old => {
      if (old !== button && !side.contains(old)) old.classList.add('eloah-harmony-old-toggle');
    });
    side.addEventListener('keydown', event => {
      if (!opened) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (event.key !== 'Tab') return;
      const items = [...side.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex="0"]')].filter(node => !node.disabled && node.getClientRects().length && !node.closest('[inert]'));
      const first = items[0], last = items.at(-1);
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }, true);
    side.addEventListener('click', event => {
      const action = event.target.closest('a[href],button[data-go],button[data-view],button[data-id],button[data-section]');
      if (!action || action === closeButton || !opened) return;
      if (action.tagName === 'A' && (action.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey)) return;
      close(false);
      requestAnimationFrame(() => {
        const target = document.querySelector('main h1, #view, main');
        if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); }
      });
    });
    function sync() { close(false); body.classList.toggle('eloah-harmony-mobile', mobile.matches); if (!mobile.matches) expandSections(); }
    mobile.addEventListener('change', sync); sync();
    window.addEventListener('pageshow', () => close(false));
    function updateCurrent() {
      side.querySelectorAll('a[href]').forEach(a => {
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return;
        const same = url.pathname === location.pathname && url.search === location.search && url.hash === location.hash;
        if (same) a.setAttribute('aria-current','page');
        else if (a.getAttribute('aria-current') === 'page') a.removeAttribute('aria-current');
      });
    }
    window.addEventListener('hashchange', updateCurrent); window.addEventListener('popstate', updateCurrent); updateCurrent();
  }
  // Existing universe scripts consolidate their menus first, including async platform loading.
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, {once:true});
})();
