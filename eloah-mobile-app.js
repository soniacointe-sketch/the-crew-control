/* ELOAH 11 · navigation mobile sans changement de session ni de thème des pages. */
(() => {
  'use strict';
  if (window.__eloahMobileDock) return;
  window.__eloahMobileDock = true;
  const mobile = matchMedia('(max-width: 760px)');
  let dock = null;
  const current = location.pathname.split('/').pop() || 'mes-univers.html';
  const founder = current === 'eloah-2040.html' || current === 'eloah-fondatrice.html';
  const icons = {
    home:'<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    boards:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 7v10m6-10v6"/>',
    tools:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    account:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  function openTools(term) {
    if (window.ELOAHPlatform) { window.ELOAHPlatform.openTools(term); return; }
    location.assign(term === 'Comptes' ? (founder ? 'eloah-fondatrice.html' : 'eloah-espace-prive.html') : 'mes-univers.html');
  }
  function editorFocused() {
    const active = document.activeElement;
    return !!active && (active.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(active.tagName));
  }
  function syncKeyboard() { if (dock) dock.hidden = editorFocused(); }
  function build() {
    if (!mobile.matches) {
      dock?.remove(); dock = null; document.body.classList.remove('eloah-has-mobile-dock'); return;
    }
    if (dock) return;
    if (!document.getElementById('eloah-mobile-style')) {
      const style = document.createElement('style'); style.id='eloah-mobile-style';
      style.textContent=`
      @media(max-width:760px){
       body.eloah-has-mobile-dock{padding-bottom:calc(84px + env(safe-area-inset-bottom))!important}
       #eloah-mobile-dock{box-sizing:border-box;position:fixed;inset:auto 0 0;z-index:20000;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;padding:8px 6px max(9px,env(safe-area-inset-bottom));background:#171016;color:#f7ede5;border-top:1px solid #665052;box-shadow:0 -5px 24px #0003;font:11px/1.3 system-ui,sans-serif}
       #eloah-mobile-dock[hidden]{display:none!important}
       #eloah-mobile-dock :is(a,button){box-sizing:border-box;min-width:0;min-height:48px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;padding:4px 2px;margin:0;border:1px solid transparent;border-radius:10px;color:#d8c3cb;background:transparent;text-decoration:none;font:inherit;text-align:center;cursor:pointer}
       #eloah-mobile-dock [aria-current="page"]{color:#ffe2b3;background:#442438;border-color:#755260}
       #eloah-mobile-dock svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
       #eloah-mobile-dock :is(a,button):focus-visible{outline:2px solid #efd5a9;outline-offset:-2px}
       body.eloah-has-mobile-dock #eloah-music-dock{bottom:calc(78px + env(safe-area-inset-bottom))!important}
      }`;
      document.head.append(style);
    }
    dock=document.createElement('nav');dock.id='eloah-mobile-dock';dock.setAttribute('aria-label','Navigation ELOAH mobile');
    const links=[
      ['Accueil','mes-univers.html','home'],
      ['Organisation','eloah-pilotage.html','calendar'],
      ['Tableaux','eloah-trello.html','boards'],
      ['Outils',null,'tools'],
      [founder?'Fondatrice':'Compte',founder?'eloah-fondatrice.html':null,'account']
    ];
    for (const [label,href,icon] of links) {
      const item=document.createElement(href?'a':'button');
      if(href){item.href=href;if(href.split(/[?#]/)[0]===current)item.setAttribute('aria-current','page')}
      else {item.type='button';item.setAttribute('aria-haspopup','dialog');item.addEventListener('click',()=>openTools(icon==='account'?'Comptes':''))}
      item.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg><span>${label}</span>`;
      dock.append(item);
    }
    document.body.append(dock);document.body.classList.add('eloah-has-mobile-dock');syncKeyboard();
  }
  if(!window.ELOAHPlatform&&!document.querySelector('script[data-eloah-platform]')){
    const script=document.createElement('script');script.src='eloah-platform.js?v=11.0';script.dataset.eloahPlatform='1';script.defer=true;document.head.append(script);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
  mobile.addEventListener('change',build);
  document.addEventListener('focusin',syncKeyboard);
  document.addEventListener('focusout',()=>setTimeout(syncKeyboard,0));
})();
