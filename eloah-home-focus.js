/* Home focus: read-only views of existing local records. */
(()=>{
'use strict';
const main=document.querySelector('main'),personal=main?.querySelector('.home-personal');
if(!personal||document.getElementById('home-focus'))return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
let unreadable=false;
function read(key,fallback){try{const s=localStorage.getItem(key);return s===null?fallback:JSON.parse(s)}catch{unreadable=true;return fallback}}
const day=()=>{const p=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=t=>p.find(x=>x.type===t).value;return v('year')+'-'+v('month')+'-'+v('day')};
const dateLabel=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')?d.slice(8)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'Sans échéance';
const valid=r=>r&&typeof r==='object'&&typeof r.title==='string'&&!r.archived;
const noteURL=r=>'eloah-partenaire.html?rubrique='+encodeURIComponent(r.module||'Mon Espace');
function records(){
 unreadable=false;
 const raw=read('eloah-planning-v1',[]),notes=read('sonia-universe-v1-itriia',[]);
 if(!Array.isArray(raw)||!Array.isArray(notes))unreadable=true;
 const planning=(Array.isArray(raw)?raw:[]).filter(valid).filter(r=>!read('eloah-project-v1:'+String(r.project||''),{})?.settings?.archived).map(r=>({...r,type:'Planning',universe:String(r.project||'Sans univers'),href:'eloah-pilotage.html?projet='+encodeURIComponent(r.project||'')}));
 const localNotes=(Array.isArray(notes)?notes:[]).filter(valid).filter(r=>r.module==='Mon Espace').map(r=>({...r,status:r.state,type:'Note',universe:'Mon Espace',href:noteURL(r)}));
 return [...planning,...localNotes];
}
const universeLinks=[...main.querySelectorAll('a.card[href^="eloah-projet.html?projet="]')].map(a=>({title:a.querySelector('h2')?.textContent||'',note:a.querySelector('p')?.textContent||'',href:a.getAttribute('href'),type:'Univers',universe:''}));
const finder=document.createElement('section');finder.className='home-finder';finder.setAttribute('aria-label','Recherche dans ELOAH');
finder.innerHTML='<label for="home-find">Retrouver un univers, une action ou une note</label><input id="home-find" type="search" placeholder="Ex. : The Crew, article, planning…" autocomplete="off" aria-controls="home-find-results" aria-describedby="home-find-help"><p id="home-find-help">Univers, planning et notes de Mon Espace enregistrés sur cet appareil.</p><p id="home-find-count" role="status" aria-live="polite"></p><div id="home-find-results" hidden></div>';
personal.before(finder);
const focus=document.createElement('section');focus.id='home-focus';focus.className='home-focus';personal.after(focus);
const q=finder.querySelector('input'),results=finder.querySelector('#home-find-results'),count=finder.querySelector('#home-find-count');
function row(r,meta){return '<a class="home-focus-row" href="'+esc(r.href)+'"><span><strong>'+esc(r.title)+'</strong><small>'+esc(meta)+'</small></span><span aria-hidden="true">→</span></a>'}
function find(){
 const query=norm(q.value.trim());results.hidden=!query;
 if(!query){results.replaceChildren();count.textContent='';return}
 const hits=[...universeLinks,...records()].filter(r=>norm([r.title,r.note,r.universe,r.status].join(' ')).includes(query));
 count.textContent=hits.length+' résultat'+(hits.length===1?'':'s')+(hits.length>12?' · 12 affichés, précise ta recherche.':'.')+(unreadable?' Certaines données locales sont illisibles.':'');
 results.innerHTML=hits.slice(0,12).map(r=>row(r,[r.type,r.universe,r.status].filter(Boolean).join(' · '))).join('')||'<p>Aucun résultat. Essaie un autre mot ou ouvre un univers.</p>';
}
function draw(){
 const today=day(),data=records().filter(r=>r.status!=='Terminé'),dated=data.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date||''));
 const overdue=dated.filter(r=>r.date<today),due=dated.filter(r=>r.date===today);
 const next=data.slice().sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.title.localeCompare(b.title,'fr')).slice(0,3);
 focus.innerHTML='<header><div><p class="home-eyebrow">'+esc(dateLabel(today))+' · HEURE DE PARIS</p><h2>Aujourd’hui</h2></div><a href="eloah-pilotage.html">Ouvrir le planning →</a></header><div class="home-focus-stats"><span><strong>'+due.length+'</strong> échéance'+(due.length===1?'':'s')+' aujourd’hui</span><span><strong>'+overdue.length+'</strong> échéance'+(overdue.length===1?' dépassée':'s dépassées')+'</span><span><strong>'+data.length+'</strong> action'+(data.length===1?' restante':'s restantes')+'</span></div><h3>Mes prochaines actions</h3>'+(next.length?next.map(r=>row(r,[r.universe,r.status||'À faire',dateLabel(r.date)].join(' · '))).join(''):'<p>Aucune action en cours dans le planning ou les notes de Mon Espace. <a href="eloah-pilotage.html">Ajouter ma première action →</a></p>')+'<p class="home-focus-help">'+(unreadable?'Certaines données locales sont illisibles. Les totaux peuvent être incomplets. ':'')+'Vue locale du planning et des notes de Mon Espace, hors éléments terminés ou archivés. Les actions sont classées par échéance ; aucune priorité n’est inventée.</p>';
}
q.addEventListener('input',find);
q.addEventListener('keydown',e=>{if(e.key==='Escape'){q.value='';find()}});
window.addEventListener('storage',()=>{draw();find()});
window.addEventListener('pageshow',()=>{draw();find()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){draw();find()}});
draw();
const style=document.createElement('style');style.textContent='.home-finder{margin:0 0 24px}.home-finder label{display:block;font:600 14px system-ui;margin-bottom:8px}.home-finder input{box-sizing:border-box;width:100%;min-height:48px;border:1px solid #cbd0c6;border-radius:9px;padding:12px 14px;font:16px system-ui;background:#fff;color:#303530}.home-finder p{font:12px/1.5 system-ui;color:#626b5e;margin:8px 0}.home-finder input:focus-visible,.home-focus-row:focus-visible{outline:3px solid #7762af;outline-offset:3px}#home-find-results{max-height:420px;overflow:auto;background:#fff;border:1px solid #ddd;border-radius:10px;padding:8px}.home-focus{border:1px solid #d9ddd3;border-radius:12px;padding:24px;margin:0 0 26px;background:#fafaf6}.home-focus header{display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap;margin:0 0 18px}.home-focus h2{font:29px Georgia;margin:8px 0}.home-focus h3{font:600 14px system-ui;margin:24px 0 10px}.home-focus header>a{font:13px system-ui;min-height:44px;display:inline-flex;align-items:center;color:#695597}.home-focus-stats{display:flex;gap:10px;flex-wrap:wrap}.home-focus-stats>span{flex:1;min-width:120px;border:1px solid #e0e2db;border-radius:8px;background:#fff;padding:12px;font:12px/1.5 system-ui;color:#626b5e}.home-focus-stats strong{display:block;font:26px Georgia;color:#303530;margin-bottom:4px}.home-focus-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 10px;min-height:44px;color:#303530;text-decoration:none;border-bottom:1px solid #e1e4db;overflow-wrap:anywhere}.home-focus-row:hover{background:#f0ecf8}.home-focus-row strong{font:600 14px/1.5 system-ui;display:block}.home-focus-row small{font:12px/1.5 system-ui;display:block;color:#687164;margin-top:4px}.home-focus-help,.home-focus>p{font:12px/1.6 system-ui;color:#687164;margin:16px 0 0}@media(max-width:650px){.home-focus{padding:18px}.home-focus-stats{gap:6px}.home-focus-stats>span{min-width:80px;padding:10px}}';
document.head.append(style);
})();
