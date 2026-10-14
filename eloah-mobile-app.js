/* Navigation compacte dédiée à ELOAH installé sur téléphone. */
(()=>{'use strict';
const mobile=matchMedia('(max-width: 760px)');const standalone=matchMedia('(display-mode: standalone)');
if(!mobile.matches)return;
const installed=standalone.matches||navigator.standalone===true;
if(!installed){
  const path=location.pathname.split('/').pop();
  if(path!=='mes-univers.html'&&path!=='eloah-installer.html'&&path!=='eloah-diagnostic.html'){
    const link=document.createElement('a');
    link.href='eloah-installer.html';
    link.textContent='Installer ELOAH';
    link.setAttribute('aria-label','Installer ELOAH sur mon téléphone');
    link.style.cssText='position:fixed;right:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:10000;background:#922763;color:#fff;text-decoration:none;border:1px solid #c35498;border-radius:30px;padding:12px 16px;font:700 12px system-ui;box-shadow:0 8px 22px #1609124d';
    document.body.append(link);
  }
  return;
}
const style=document.createElement('style');style.textContent=`#eloah-mobile-dock{position:fixed;bottom:0;left:0;right:0;z-index:20000;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));padding:8px 6px max(8px,env(safe-area-inset-bottom));background:#190a19;color:#f7eaf3;border-top:1px solid #633052;box-shadow:0 -5px 28px #180a1833;font:11px/1.3 system-ui,sans-serif}#eloah-mobile-dock a{min-width:0;min-height:48px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:3px;color:#d6b9cf;text-decoration:none;border-radius:10px;text-align:center}#eloah-mobile-dock a[aria-current=page]{color:#fff;background:#542044}#eloah-mobile-dock svg{height:21px;width:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}body{padding-bottom:calc(80px + env(safe-area-inset-bottom))!important}#eloah-mobile-dock a:focus-visible{outline:2px solid #f292cf;outline-offset:-2px}`;document.head.append(style);
const links=[['Accueil','mes-univers.html','<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>'],['Projets','eloah-pilotage.html','<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>'],['Tableaux','eloah-trello.html','<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 7v10m6-10v6"/>'],['IA 2040','eloah-2040.html#assistant-reel','<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>'],['Compte','eloah-espace-prive.html','<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>']];
const dock=document.createElement('nav');dock.id='eloah-mobile-dock';dock.setAttribute('aria-label','Navigation ELOAH mobile');const current=location.pathname.split('/').pop();links.forEach(([label,url,svg])=>{const a=document.createElement('a');a.href=url;if(url===current)a.setAttribute('aria-current','page');a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+svg+'</svg><span>'+label+'</span>';dock.append(a)});document.body.append(dock);
})();