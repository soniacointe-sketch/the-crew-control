/* ELOAH · Accueil V2. Réorganise l'existant sans supprimer les données. */
(()=>{'use strict';
const main=document.querySelector('main'),home=document.getElementById('eloah-home-v2');
if(!main||!home||home.dataset.enhanced==='1')return;
home.dataset.enhanced='1';
const input=document.getElementById('eloah-search-work'),result=document.getElementById('eloah-search-work-results');
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
function read(key){
 try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data:[]}catch{return []}
}
function index(){
 const list=[],used=new Set();
 function add(title,meta,description,href,kind){
  if(!title||!href)return;
  const key=title+'::'+href;if(used.has(key))return;used.add(key);
  list.push({title:String(title),meta:String(meta||''),description:String(description||''),href:String(href),kind:String(kind||'')});
 }
 main.querySelectorAll('#eloah-home-v2 .eloah-universe').forEach(el=>{
  const a=el.querySelector('.eloah-main-link');const title=el.querySelector('h3')?.textContent||'';
  if(a)add(title,'Univers principal',el.querySelector('p')?.textContent||'',a.getAttribute('href'),'univers');
 });
 main.querySelectorAll('a.card[href]').forEach(el=>{
  const a=el.getAttribute('href'),title=el.querySelector('h2')?.textContent||'';
  if(a&&title)add(title,'Univers et espace',el.querySelector('p')?.textContent||'',a,'univers');
 });
 main.querySelectorAll('#eloah-home-v2 .eloah-shortcut').forEach(el=>
  add(el.textContent.trim(),'Accès direct','',el.getAttribute('href'),'outil'));
 // Seuls les intitulés locaux sont lus ; aucune donnée n'est transmise à un service distant.
 for(const x of read('eloah-planning-v1').slice(0,600)){
  if(!x||typeof x.title!=='string'||x.archived)continue;
  const project=String(x.project||'ELOAH');
  add(x.title,'Planning · '+project,[x.note||'',x.date||'',x.status||''].join(' '),
    'eloah-pilotage.html?projet='+encodeURIComponent(project),'planning');
 }
 for(const x of read('eloah-action-tasks-v1').slice(0,600)){
  if(!x||typeof x.title!=='string'||x.done)continue;
  const project=String(x.project||'ELOAH');
  add(x.title,'Action · '+project,[x.date||'',x.priority||''].join(' '),'eloah-actions.html','action');
 }
 for(const x of read('sonia-universe-v1-itriia').slice(0,700)){
  if(!x||typeof x.title!=='string'||x.archived)continue;
  add(x.title,'Note · '+String(x.module||'Mon Espace'),String(x.note||''),
    'eloah-partenaire.html?rubrique='+encodeURIComponent(x.module||'Mon Espace'),'note');
 }
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(key?.startsWith('eloah-project-v1:')){
    const project=key.slice('eloah-project-v1:'.length);
    if(project)add(project,'Projet ELOAH','Conversation et espace projet',
      'eloah-projet.html?projet='+encodeURIComponent(project),'projet');
   }
  }
 }catch{}
 return list;
}
let records=index();
function makeResult(item){
 const a=document.createElement('a');a.href=item.href;
 const body=document.createElement('span');
 const heading=document.createElement('strong');heading.textContent=item.title;
 const meta=document.createElement('small');meta.textContent=item.meta;
 body.append(heading,meta);
 const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
 a.append(body,arrow);
 return a;
}
function search(){
 const phrase=normalize(input.value.trim());
 result.replaceChildren();
 if(!phrase){result.hidden=true;return}
 const tokens=phrase.split(/\s+/).filter(Boolean);
 const scored=records.map(item=>{
  const fields=normalize(item.title)+' '+normalize(item.meta)+' '+normalize(item.description);
  const relevant=tokens.every(t=>fields.includes(t));
  const score=(normalize(item.title).includes(phrase)?5:0)+(normalize(item.title).startsWith(phrase)?3:0)+(item.kind==='univers'?2:0);
  return {item,relevant,score};
 }).filter(x=>x.relevant).sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title,'fr')).slice(0,14);
 result.hidden=false;
 if(!scored.length){
  const empty=document.createElement('p');
  empty.textContent='Aucun résultat dans les univers, notes et actions locales. Essaie un autre mot ou ouvre « Tous mes univers ».';
  result.append(empty);return;
 }
 const total=document.createElement('p');total.textContent=scored.length+' résultat'+(scored.length>1?'s':'')+' affiché'+(scored.length>1?'s':'')+' (14 maximum).';result.append(total);
 scored.forEach(x=>result.append(makeResult(x.item)));
}
input?.addEventListener('input',search);
input?.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';search();input.focus()}});
window.addEventListener('pageshow',()=>{records=index();search()});
window.addEventListener('storage',()=>{records=index();search()});
// Déplacer les anciennes sections dans des volets sans retirer leurs contenus ni actions.
function collapseOld(){
 const intro=main.querySelector(':scope > .partner-top'),houses=document.getElementById('maisons');
 if(intro&&houses){
  const wrap=document.createElement('details');wrap.id='eloah-legacy-cockpit';
  const title=document.createElement('summary');title.textContent='Outils complémentaires · ancien cockpit, aide et conversation guidée';
  wrap.append(title);main.insertBefore(wrap,intro);
  let node=intro;
  while(node&&node!==houses){const next=node.nextElementSibling;wrap.append(node);node=next}
 }
 const audit=document.getElementById('eloah-audit');
 if(audit&&!document.getElementById('eloah-legacy-audit')){
  const wrap=document.createElement('details');wrap.id='eloah-legacy-audit';
  const title=document.createElement('summary');title.textContent='Historique du chantier et audit technique · document public';
  wrap.append(title);audit.before(wrap);wrap.append(audit);
 }
 // Les modules et les univers historiques restent accessibles ; le lien Tous mes univers saute à cette section.
}
collapseOld();
const briefing=document.getElementById('eloah-morning'),daily=document.getElementById('eloah-daily');
if(briefing||daily){
 let after=home;
 if(briefing){after.after(briefing);after=briefing}
 if(daily){after.after(daily)}
}
// Les anciens boutons d'accès injectés restent accessibles dans un coin secondaire,
// plutôt que de prendre la place de la recherche et des raccourcis du nouvel accueil.
const injected=[...main.querySelectorAll(':scope > a[id]')].filter(a=>['eloah-actions-access','eloah-wordpress-link','pg-article-studio-access','eloah-smith-studio-link'].includes(a.id));
if(injected.length){
 const nav=document.createElement('nav');nav.className='eloah-other-shortcuts';nav.setAttribute('aria-label','Autres outils de travail');
 for(const a of injected)nav.append(a);
 home.append(nav);
}
})();
