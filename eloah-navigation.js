/* Universal ELOAH narration, available on all pages loading this navigation. */
(()=>{if(document.querySelector('script[data-eloah-reader]'))return;const el=document.createElement('script');el.src='eloah-lecture-universelle.js?v=20261013b';el.defer=true;el.dataset.eloahReader='1';document.head.appendChild(el);})();
/* Canonical ELOAH navigation. Existing storage remains untouched. */
(()=>{'use strict';
if(document.querySelector('.eloah-global-nav'))return;
const page=location.pathname.split('/').pop(),query=new URLSearchParams(location.search);
const routes=[["Accueil général","mes-univers.html"],["Mon Espace","eloah-partenaire.html?rubrique=Mon%20Espace"],["ELOAH Studio","eloah-partenaire.html?rubrique=ELOAH%20Studio"],["Coffre-fort","eloah-partenaire.html?rubrique=Coffre-fort"],["Entretiens","eloah-partenaire.html?rubrique=Entretiens"],["Mailing","eloah-partenaire.html?rubrique=Mailing"],["Documents","eloah-partenaire.html?rubrique=Documents"],["Mon abonnement","eloah-partenaire.html?rubrique=Mon%20abonnement"],["Crédits IA","eloah-partenaire.html?rubrique=Cr%C3%A9dits%20IA"],["Formations","eloah-partenaire.html?rubrique=Formations"],["Analytics","eloah-partenaire.html?rubrique=Analytics"],["Projets","eloah-partenaire.html?rubrique=Projets"],["Bases d’Expertise","eloah-partenaire.html?rubrique=Bases%20d%E2%80%99Expertise"],["Chroniques","eloah-partenaire.html?rubrique=Chroniques"],["Mon profil","eloah-partenaire.html?rubrique=Mon%20profil"]];
routes.unshift(['Contrôle parcours 07 ↗','eloah-controle-parcours-07.html']);
const assistantRoute=['Assistant IA','eloah-projet.html?projet=ELOAH']; routes.push(assistantRoute)
let universe=query.get('projet')||'';
try{universe=universe||JSON.parse(document.getElementById('config')?.textContent||'{}').name||''}catch{}
if(['eloah-the-crew.html','eloah-academy.html','eloah-import.html','index.html'].includes(page))universe='The Crew Orchies';
if(page==='sonia-os.html')universe='SONIA OS';
if(page==='power-glam-control.html')universe='Power & Glam';
if(page==='eloah-maia.html')universe='MAIA';
const assistant=assistantRoute;assistant[1]='eloah-projet.html?projet='+encodeURIComponent(universe||'ELOAH');
const nav=document.createElement('nav');nav.className='eloah-global-nav';nav.setAttribute('aria-label','Navigation commune ELOAH');
function navLink(label,href,cls=''){const target=new URL(href,location.href);const current=target.pathname.split('/').pop()===page&&[...target.searchParams].every(([key,value])=>query.get(key)===value);return '<a class="'+cls+'" href="'+href+'"'+(current?' aria-current="page"':'')+'>'+label+'</a>'}
nav.innerHTML=navLink('ELOAH · Accueil','mes-univers.html','eloah-wordmark')+navLink('Changer d’univers','mes-univers.html#maisons','eloah-switch')+'<div class="eloah-nav-shortcuts">'+[['Mon Espace','eloah-partenaire.html?rubrique=Mon%20Espace'],['Mailing','eloah-partenaire.html?rubrique=Mailing'],['Documents','eloah-partenaire.html?rubrique=Documents']].map(r=>navLink(...r)).join('')+'</div><details class="eloah-menu"><summary>Menu</summary><div class="eloah-menu-links">'+routes.filter(r=>r[0]!=='Accueil général').map(r=>{
 if(r[0]==='Analytics'){
  const links=[['Dashboard Personnel','dashboard'],['Métriques Projet','projets'],['Coûts & Performance','couts']];
  return '<details class="eloah-nav-analytics"><summary>Analytics <span aria-hidden="true">⌄</span></summary><div class="eloah-nav-analytics-entries">'+links.map(([label,id])=>navLink(label,'eloah-partenaire.html?rubrique=Analytics&vue='+id)).join('')+'</div></details>';
 }
 return navLink(...r);
}).join('')+'</div></details>';
document.body.prepend(nav);
document.body.classList.add('eloah-screen');
document.body.dataset.eloahPage=page;
const menu=nav.querySelector('details');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus()}});
document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
document.querySelectorAll('a[href="mes-univers.html"],a[href="mes-univers.html#maisons"]').forEach(a=>{
 if(nav.contains(a)||a.children.length)return;
 const label=a.textContent.trim();
 if(['Mes univers','Retour','Accueil','Accueil général','ELOAH / Espaces dédiés'].includes(label.replace(/^[←⌂▦]\s*/,''))){a.textContent='← Accueil ELOAH';a.href='mes-univers.html'}
 if(/^(Changer|Choisir|Parcourir) (d’univers|un univers|mes univers)/.test(label)){a.textContent='Changer d’univers';a.href='mes-univers.html#maisons'}
});
const localAside=document.querySelector('.layout>aside,.shell>aside.side');
if(localAside&&(document.getElementById('config')||['eloah-the-crew.html','eloah-maia.html'].includes(page))){
 const sections=document.createElement('details');sections.className='eloah-local-menu';
 const summary=document.createElement('summary');summary.textContent='Rubriques'+(universe?' · '+universe:'');
 const content=document.createElement('div');content.className='eloah-local-content';
 while(localAside.firstChild)content.append(localAside.firstChild);
 sections.append(summary,content);localAside.append(sections);
 const mobile=matchMedia('(max-width:1000px)');sections.open=!mobile.matches;mobile.addEventListener('change',e=>{sections.open=!e.matches});
}
document.querySelectorAll('a').forEach(a=>{if(['Accueil ELOAH','← Retour à ELOAH'].includes(a.textContent.trim())){a.href='mes-univers.html';a.textContent='← Accueil ELOAH'}});
const heading=document.querySelector('h1');
if(document.getElementById('config')&&heading&&universe){heading.textContent=universe;document.title=(page==='eloah-partenaire.html'?'Notes & préparation':universe)+' · ELOAH'}
const style=document.createElement('style');style.textContent='.eloah-global-nav{display:flex;align-items:center;gap:6px;padding:10px 20px;background:#f4f3ee;border-bottom:1px solid #dddfd7;color:#303530;overflow-x:auto;white-space:nowrap;font:12px/1.5 system-ui;min-height:52px}.eloah-global-nav a{display:block;padding:7px 11px;text-decoration:none;color:inherit;border-radius:5px}.eloah-global-nav a:hover,.eloah-global-nav a[aria-current]{background:#eae6f2;color:#695597}.eloah-global-nav .eloah-wordmark{letter-spacing:.2em;font-weight:750;margin-right:14px}.eloah-global-nav a:focus-visible{outline:2px solid #7762af}.eloah-project-picker{font:12px system-ui;max-width:190px;background:var(--panel,#fff);padding:8px;border:1px solid #ddd;border-radius:5px}.eloah-recent{margin:25px 0;padding:24px;border:1px solid #dedfd7;border-radius:12px;background:#fff}.eloah-recent h2{font:26px Georgia;margin:0 0 15px}.eloah-recent-grid{display:flex;gap:10px;flex-wrap:wrap}.eloah-recent-grid a{padding:12px 16px;border:1px solid #dedfd7;border-radius:8px;text-decoration:none;color:#333}.eloah-recent p{font:13px/1.7 system-ui;color:#6d7269}@media(max-width:740px){.eloah-global-nav{padding:8px;min-height:48px}.eloah-global-nav a{padding:6px 9px}.eloah-project-picker{max-width:130px}}';document.head.appendChild(style);
const harmony=document.createElement('style');harmony.textContent=`
.eloah-global-nav{position:relative;z-index:20;box-sizing:border-box;margin:0;height:52px;min-height:52px;overflow:visible;flex-wrap:nowrap;padding:4px 16px;gap:6px;flex-shrink:0}
.eloah-global-nav a,.eloah-global-nav summary{box-sizing:border-box;min-height:44px;display:flex;align-items:center;padding:8px 12px;font:13px/1.3 system-ui;color:#303530}
.eloah-global-nav .eloah-wordmark{letter-spacing:.07em;margin-right:0;font-weight:750;white-space:nowrap}
.eloah-nav-shortcuts{display:flex;margin-left:auto;gap:3px}
.eloah-global-nav .eloah-menu{position:relative;margin:0 0 0 auto;padding:0;border:0;background:transparent;color:#303530;flex-shrink:0}
.eloah-menu summary{cursor:pointer;list-style:none;gap:8px;border:1px solid #d7d9d1;border-radius:7px;background:#fff}
.eloah-menu summary::after{content:'⌄'}.eloah-menu summary::-webkit-details-marker{display:none}
.eloah-menu[open] summary{background:#eee8f7}
.eloah-menu-links{position:absolute;right:0;top:calc(100% + 8px);width:min(285px,calc(100vw - 24px));max-height:calc(100dvh - 76px);overflow:auto;border:1px solid #d7d9d1;padding:8px;background:#fff;border-radius:12px;box-shadow:0 14px 35px #1c25252b;white-space:normal}
.eloah-menu-links a{border-radius:6px}
.eloah-screen :where(main,aside,.layout>*,.panel,.panel-card,.split>*,.grid>*){min-width:0}
.eloah-screen :where(button,a,input,select,textarea,summary):focus-visible{outline:2px solid #7762af;outline-offset:3px}
.eloah-screen :where(dialog){max-width:calc(100vw - 24px);max-height:90dvh;box-sizing:border-box}
.eloah-screen .ops-actions{align-items:end}
@media(min-width:701px){.eloah-screen[data-eloah-page="power-glam-control.html"]>aside{top:52px}}
.eloah-local-menu>summary{display:none}.eloah-local-menu{margin:0;border:0;padding:0}.eloah-local-content{min-width:0}
@media(max-width:1000px){.eloah-screen :is(.layout,.shell):has(.eloah-local-menu){grid-template-columns:minmax(0,1fr)}.eloah-screen :is(.layout,.shell)>aside:has(.eloah-local-menu){display:block;padding:8px 16px}.eloah-local-menu>summary{display:flex;align-items:center;min-height:44px;cursor:pointer;list-style:none;font:13px system-ui;gap:10px}.eloah-local-menu>summary::after{content:'⌄';margin-left:auto}.eloah-local-content{padding:12px 0}.eloah-local-content nav{display:flex;flex-wrap:wrap;overflow:visible}.eloah-local-content .brand{display:none}.eloah-local-content>p{display:none}.eloah-local-content .side-link{display:block}}
@media(max-width:900px){.eloah-nav-shortcuts{display:none}.eloah-global-nav .eloah-switch{margin-left:auto}.eloah-global-nav .eloah-menu{margin-left:0}}
@media(max-width:740px){
.eloah-global-nav{height:52px;min-height:52px;padding:4px 8px;gap:3px}
.eloah-global-nav a,.eloah-global-nav summary{font-size:12px;padding:8px}
.eloah-global-nav .eloah-wordmark{letter-spacing:0}
.eloah-screen :where(button,.btn,.button,summary){min-height:44px}
.eloah-screen :where(input:not([type=checkbox]):not([type=radio]),textarea,select){font-size:16px}
.eloah-screen :where(.toolbar,.expert-head,.bar,.ops-actions){flex-wrap:wrap}
.eloah-screen :where(.toolbar input,.toolbar select){min-width:0;max-width:100%}
.eloah-screen :where(.row,.panel,.panel-card){overflow-wrap:anywhere}
.eloah-screen .project-head{flex-wrap:wrap;padding:10px 12px;gap:8px}
.eloah-screen .project-head h1{flex:1;min-width:110px;overflow-wrap:anywhere}
.eloah-screen .project-head .eloah-project-picker{max-width:100%;width:100%;order:5}
.eloah-screen[data-eloah-page="eloah-projet.html"] .shell{height:auto;min-height:calc(100dvh - 109px)}
.eloah-screen[data-eloah-page="eloah-projet.html"] #messages{flex:none;overflow:visible;min-height:180px}
.eloah-screen[data-eloah-page="eloah-projet.html"] #panel{overflow:visible}
.eloah-screen .tools{align-items:center}
.eloah-screen .tools>*{flex-shrink:0}
.eloah-screen[data-eloah-page="eloah-projet.html"] .files-side.open{top:109px}
.eloah-screen .compose-bottom{flex-wrap:wrap}.eloah-screen .compose-bottom>div{display:flex;flex-wrap:wrap;gap:6px}
.eloah-screen .expert-grid{grid-template-columns:minmax(0,1fr)}
.eloah-screen .ops-grid{grid-template-columns:minmax(0,1fr)}
.eloah-screen .ops-actions>*{max-width:100%}
}
@media(max-width:360px){.eloah-global-nav a,.eloah-global-nav summary{font-size:11px;padding:6px}.eloah-global-nav{gap:2px}.eloah-global-nav .eloah-wordmark{margin:0}}
@media(prefers-reduced-motion:reduce){.eloah-screen *{scroll-behavior:auto!important;animation:none!important}}
.eloah-menu-links .eloah-nav-analytics{border:0;margin:0;padding:0}
.eloah-menu-links .eloah-nav-analytics>summary{display:flex;align-items:center;justify-content:space-between;min-height:43px;cursor:pointer;list-style:none;padding:8px 12px;border-radius:6px;font:13px/1.4 system-ui;color:#303530}
.eloah-menu-links .eloah-nav-analytics>summary::-webkit-details-marker{display:none}
.eloah-menu-links .eloah-nav-analytics[open]>summary{background:#ece6f5;color:#604c8f}
.eloah-menu-links .eloah-nav-analytics-entries{display:grid;margin-left:11px;border-left:2px solid #d5cae8;padding-left:8px;gap:2px}
.eloah-menu-links .eloah-nav-analytics-entries a{min-height:41px;font-size:12px}
`;document.head.appendChild(harmony);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function projects(){const out=[];try{for(const k of Object.keys(localStorage).filter(k=>k.startsWith('eloah-project-v1:'))){try{const s=JSON.parse(localStorage.getItem(k));if(Array.isArray(s?.threads))out.push({key:k.slice(17),name:s.settings?.name||k.slice(17),updated:s.updated,deadline:s.settings?.deadline,archived:s.settings?.archived})}catch{}}}catch{}return out.sort((a,b)=>(b.updated||'').localeCompare(a.updated||''))}
if(page==='mes-univers.html'){
 document.querySelectorAll('a[href="eloah-projet.html"]').forEach(a=>{a.href='mes-univers.html';a.textContent='Accueil général'});
 const legacy={'Projets':'mes-univers.html#maisons','Documents':'eloah-bibliotheque.html?type=fichiers','Bases d’Expertise':'eloah-bibliotheque.html?type=bases','Mon profil':'eloah-projet.html?projet=ELOAH&onglet=parametres&compte=1'};
 document.querySelectorAll('a[href*="eloah-partenaire.html"]').forEach(a=>{const u=new URL(a.href),r=u.searchParams.get('rubrique');if(legacy[r])a.href=legacy[r]});
 const items=projects().filter(p=>!p.archived);const section=document.createElement('section');section.className='eloah-recent';section.innerHTML='<h2>Reprendre mon travail</h2>'+(items.length?'<div class="eloah-recent-grid">'+items.slice(0,6).map(p=>'<a href="eloah-projet.html?projet='+encodeURIComponent(p.key)+'">'+escape(p.name)+'</a>').join('')+'</div>':'<p>Ouvre un univers ci-dessous pour commencer. Les projets utilisés sur cet appareil apparaîtront ici.</p>')+'<p><a href="eloah-bibliotheque.html?type=bases">Mes bases d’expertise</a> · <a href="eloah-bibliotheque.html?type=fichiers">Tous mes documents</a> · <a href="'+'eloah-projet.html?projet=ELOAH&onglet=parametres&compte=1'+'">Mes sauvegardes en ligne</a></p>';
 const deadline=items.filter(p=>p.deadline).sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,4);if(deadline.length)section.innerHTML+='<p><strong>Échéances des projets</strong><br>'+deadline.map(p=>escape(p.name)+' · '+escape(p.deadline)).join('<br>')+'</p>';
 document.querySelector('main .cockpit-grid,main [aria-label="Cockpit partenaire"]')?.before(section);
}
if(page==='eloah-projet.html'){
 const layoutStyle=document.createElement('style');layoutStyle.textContent='.shell{height:calc(100dvh - 109px)}@media(max-width:740px){.shell{height:calc(100dvh - 109px)}.files-side.open{top:109px}}';document.head.appendChild(layoutStyle);const projectName=query.get('projet')||'The Crew Orchies';const picker=document.createElement('select');picker.className='eloah-project-picker';picker.setAttribute('aria-label','Changer d’univers');const map=new Map([['The Crew Orchies','The Crew Orchies'],['Power & Glam','Power & Glam'],['SONIA OS','SONIA OS'],['ELOAH','ELOAH'],...projects().map(p=>[p.key,p.name])]);if(!map.has(projectName))map.set(projectName,projectName);picker.innerHTML=[...map].map(([k,v])=>'<option value="'+escape(k)+'" '+(k===projectName?'selected':'')+'>'+escape(v)+'</option>').join('');picker.onchange=()=>location.href='eloah-projet.html?projet='+encodeURIComponent(picker.value);document.querySelector('.project-head').append(picker);
 const view=query.get('onglet');if(view==='fichiers')showTab('Fichiers');if(view==='bases'){openedBase=query.get('baseId')||null;showTab('Bases d’Expertise');if(query.get('construire')==='1')buildBase()}
 if(query.get('compte')==='1')document.getElementById('cloud-entry')?.click();
}
if(page==='eloah-partenaire.html'||document.getElementById('config')){
const theme=document.createElement('style');theme.textContent='body{background:#f6f5f0!important;color:#303530!important;--bg:#f6f5f0;--text:#303530;--muted:#6d746b;--line:#dedfd7;--accent:#7762af}aside{background:#f0f0eb!important;border-color:#dedfd7!important}aside .brand,main h1,main h2,main h3{color:#303530!important}.panel,.hero,.row,dialog,.metrics>div{background:#fff!important;border-color:#dedfd7!important;color:#303530!important}input,select,textarea{background:#fff!important;color:#303530!important;border-color:#d9dcd4!important}button,.button{background:#fff!important;color:#4f5750!important;border-color:#d9dcd4}.eyebrow{color:#737969!important}.metrics strong{color:#7762af!important}button.primary{background:#7762af!important;color:white!important}#moduleHelp{border-color:#d9dcd4!important;color:#687164!important}aside a,aside button{color:#626b60!important}aside button.active{background:#e9e4f2!important;color:#715c9c!important}';document.head.appendChild(theme);
if(page==='eloah-partenaire.html'){
 document.querySelector('h1').textContent='Notes & préparation';document.querySelector('.hero h2').textContent='Tes idées, briefs et prochaines étapes.';
 document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;const destinations={'Projets':'mes-univers.html#maisons','Documents':'eloah-bibliotheque.html?type=fichiers','Bases d’Expertise':'eloah-bibliotheque.html?type=bases','Mon profil':'eloah-projet.html?projet=ELOAH&onglet=parametres&compte=1'};if(destinations[b.dataset.view]){e.preventDefault();e.stopImmediatePropagation();location.href=destinations[b.dataset.view]}},true);
 const initial=query.get('rubrique');const redirects={'Projets':'mes-univers.html#maisons','Documents':'eloah-bibliotheque.html?type=fichiers','Bases d’Expertise':'eloah-bibliotheque.html?type=bases'};if(redirects[initial]&&!query.has('archives'))location.replace(redirects[initial]);
}
}
})();


/* Catalogue d'accès commun : les pages d'univers pointent vers le même assistant, mais chaque projet conserve ses propres données locales. */
(()=>{
'use strict';
const universeNames=["The Crew Orchies","Power & Glam","SONIA OS","Sonia Velka","Le Lion Blanc","PARISIS Engine","ELOAH P&G","Dark Energy","MAIA","Etsy Factory","Musique & identité artistique","SMITH Studio","SONIA HUMAN VOICE ENGINE","AUDIO-FIRST EXPERIENCE ENGINE","BUZZ AGENT","SONIA ALERT / OSINT","Foi & spiritualité","SONIA FUTURES INTELLIGENCE","SYMBOL ATLAS","SONIA Labs","LE SIÈGE","AION OS V2 / V3","ELOAH","Agent Authority Fabric"];
window.ELOAHUniverseRegistry=universeNames.slice();
const query=new URLSearchParams(location.search);
const page=location.pathname.split('/').pop();
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function localProjects(){const list=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('eloah-project-v1:')){const n=k.slice('eloah-project-v1:'.length);if(n&&!list.includes(n))list.push(n)}}}catch{}return list}
if(page==='eloah-projet.html'){
  const picker=document.querySelector('.eloah-project-picker');
  if(picker){
    const current=picker.value;
    for(const name of [...new Set([...universeNames,...localProjects()])]){
      if(![...picker.options].some(opt=>opt.value===name))picker.add(new Option(name,name));
    }
    picker.value=current;
  }
  try{
    let saved=null;try{saved=JSON.parse(sessionStorage.getItem('eloah-assistant-prefill-v2')||'null')}catch{}
    const pending=saved||((query.has('demande')&&query.get('demande'))?{project:query.get('projet')||'The Crew Orchies',prompt:query.get('demande'),at:Date.now()}:null);
    const selected=query.get('projet')||'The Crew Orchies';
    if(pending?.project===selected&&typeof pending.prompt==='string'&&pending.prompt.trim()&&Date.now()-pending.at<1800000){
      try{sessionStorage.removeItem('eloah-assistant-prefill-v2')}catch{}
      if(typeof newThread==='function')newThread();
      const textarea=document.getElementById('message-input');
      if(textarea){textarea.value=pending.prompt.slice(0,12000);textarea.focus()}
      if(typeof notify==='function')notify('Demande préparée pour '+selected+'. Relis-la puis choisis « Répondre dans ELOAH (IA) » ou ChatGPT.');
    }
  }catch{}
}
if(page==='mes-univers.html'){
  const form=document.getElementById('guided-form');
  if(form){
    const known=[...new Set([...universeNames,...localProjects()])];
    const hub=document.createElement('section');
    hub.className='eloah-assistant-universe-hub';
    hub.innerHTML='<div class="eloah-hub-head"><div><span class="eloah-hub-overline">ASSISTANT DE PROJET — ELOAH V2</span><h2>Un assistant pour tous tes univers</h2><p>Choisis ton projet, décris ton travail et retrouve son contexte, ses sources et ses livrables. Chaque univers conserve ses données séparément.</p></div><span class="eloah-hub-count">'+universeNames.length+' espaces référencés</span></div><label for="eloah-home-universe">Univers actif <select id="eloah-home-universe" required><option value="">Choisir un univers…</option><option value="__cross__">Mission transversale — plusieurs univers</option>'+known.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join('')+'</select></label><p class="eloah-hub-small">En mode transversal, tu choisis les autres projets et sources à inclure avant toute demande IA. Rien n’est fusionné automatiquement.</p>';
    form.before(hub);
    const submit=form.querySelector('button[type="submit"]');
    if(submit)submit.textContent="Préparer dans ELOAH →";
    form.querySelector('textarea')?.setAttribute('placeholder','Ex. prépare le prochain post, crée un dossier sourcé ou poursuis mon projet…');
    const note=form.nextElementSibling;
    if(note?.classList.contains('notice'))note.textContent='La demande ouvre le projet ELOAH choisi et préremplit son assistant. Elle n’est ni transmise à une IA ni publiée sans ton clic explicite.';
    const style=document.createElement('style');
    style.textContent='.eloah-assistant-universe-hub{padding:24px;margin:22px 0 0;background:#fdfbf7;border:1px solid #d9d6cd}.eloah-hub-head{display:flex;justify-content:space-between;gap:15px;align-items:start;flex-wrap:wrap}.eloah-hub-head h2{font:30px Georgia,serif;margin:8px 0}.eloah-hub-head p{font:13px/1.65 system-ui;color:#6b6e66;max-width:760px}.eloah-hub-overline{font:10px system-ui;letter-spacing:.13em;color:#75766c}.eloah-hub-count{padding:6px 11px;border:1px solid #ded6bf;color:#655b42;font:11px system-ui}.eloah-assistant-universe-hub label{display:block;font:12px system-ui;color:#555e56;margin-top:16px}.eloah-assistant-universe-hub select{display:block;width:100%;max-width:530px;padding:13px;margin:8px 0;font:14px system-ui;border:1px solid #c5c7c0;background:#fff;color:#242824}.eloah-hub-small{font:11px/1.5 system-ui;color:#747872;margin:10px 0 0}.guided{margin-top:0!important}.eloah-hub-error{font:12px system-ui;color:#a03e3e;margin:5px 0}@media(max-width:700px){.eloah-assistant-universe-hub{padding:16px}.eloah-hub-head h2{font-size:25px}}';
    document.head.appendChild(style);
    document.querySelectorAll('#maisons ~ section a[href^="eloah-projet.html?projet="] .open').forEach(el=>{el.textContent='Ouvrir projet & assistant IA ↗'});
  }
}
})();
