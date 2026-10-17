/* ELOAH accueil — ouvrir les accordéons parents quand un lien cible leur contenu. */
(() => {
  'use strict';
  const decodeHash = hash => {
    try { return decodeURIComponent((hash || '').replace(/^#/, '')); }
    catch { return ''; }
  };
  function reveal(hash) {
    const id = decodeHash(hash);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    for (let node = target; node; node = node.parentElement) {
      if (node.matches?.('details.home-accordion')) node.open = true;
    }
  }
  document.addEventListener('click', event => {
    const a = event.target.closest?.('a[href]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    reveal(url.hash);
  });
  window.addEventListener('hashchange', () => reveal(location.hash));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => reveal(location.hash), {once:true});
  } else reveal(location.hash);
})();