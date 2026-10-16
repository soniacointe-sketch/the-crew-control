/* ELOAH Pilotage — focus local non destructif ; aucun envoi réseau. */
(()=>{
'use strict';
const KEY='eloah-planning-v1',root=document.getElementById('pilotage-focus');
if(!root)return;
const $=id=>document.getElementById(id);
const host=$('pilotage-focus-list'),counter=$('pilotage-focus-count');
const total=$('pilotage-progress-total'),done=$('pilotage-progress-done');
const progress=$('pilotage-progress-bar'),meta=$('pilotage-progress-meta');
const tabs=[...root.querySelectorAll('[data-focus-filter]')];
let selected='priority',lastSnapshot='';
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const goodDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
const formatter=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'});
const niceDate=s=>formatter.format(new Date(s+'T12:00:00Z'));
function read(){
 try{const val=JSON.parse(localStorage.getItem(KEY)||'[]');
  return Array.isArray(val)?val.filter(x=>x&&typeof x==='object'&&!x.archived&&typeof x.title==='string'&&typeof x.id==='string'):null;
 }catch{return null;}
}
function when(t,now){
 if(!goodDate(t.date))return {label:'Sans date',tone:'neutral'};
 if(t.date<now)return {label:'En retard · '+niceDate(t.date),tone:'late'};
 if(t.date===now)return {label:"Aujourd'hui",tone:'today'};
 const tomorrow=new Date(now+'T12:00:00Z');tomorrow.setUTCDate(tomorrow.getUTCDate()+1);
 if(t.date===tomorrow.toISOString().slice(0,10))return {label:'Demain',tone:'soon'};
 return {label:niceDate(t.date),tone:'soon'};
}
function node(tag,cls,txt){
 const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;
}
function editAction(id){
 if(window.ELOAHWorkspace?.openAction){window.ELOAHWorkspace.openAction(id);return;}
 const calendar=$('ops-calendar');if(!calendar)return;
 let filter=$('ops-project-filter');
 if(filter&&filter.value){filter.value='';filter.dispatchEvent(new Event('change',{bubbles:true}));}
 let view=$('ops-view');
 if(view&&view.value!=='Liste'){view.value='Liste';view.dispatchEvent(new Event('change',{bubbles:true}));}
 const edit=[...calendar.querySelectorAll('[data-task-edit]')].find(b=>b.dataset.taskEdit===id);
 if(edit){edit.click();return;}
 calendar.scrollIntoView({behavior:'smooth',block:'start'});
 if($('ops-status'))$('ops-status').textContent="Action introuvable dans le planning. Réessaie depuis la liste.";
}
function render(){
 const all=read(),now=today();
 host.replaceChildren();
 if(all===null){
  counter.textContent='Non disponible';total.textContent='—';done.textContent='—';progress.style.width='0%';
  meta.textContent='Lecture du planning indisponible sur cet appareil.';
  host.append(node('p','focus-empty','Le stockage local est inaccessible. Aucune donnée n’a été modifiée.'));return;
 }
 const active=all.filter(x=>x.status!=='Terminé');
 const completed=all.filter(x=>x.status==='Terminé');
 total.textContent=String(all.length);done.textContent=String(completed.length);
 const pct=all.length?Math.round(100*completed.length/all.length):0;
 progress.style.width=pct+'%';progress.setAttribute('aria-valuenow',String(pct));
 meta.textContent=all.length?(pct+' % terminées · aperçu local sans synchronisation'):'Aucune action enregistrée pour le moment.';
 const end=new Date(now+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+7);
 const weekEnd=end.toISOString().slice(0,10);
 const q=($('pilotage-action-search')?.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const list=active.filter(x=>{if(q&&!q.split(/\s+/).every(w=>[x.title,x.project,x.status].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(w)))return false;
  if(selected==='today')return goodDate(x.date)&&x.date===now;
  if(selected==='late')return goodDate(x.date)&&x.date<now;
  if(selected==='week')return goodDate(x.date)&&x.date>=now&&x.date<=weekEnd;
  if(selected==='unscheduled')return !goodDate(x.date);
  return true;
 });
 const rank=s=>({'En cours':0,'À valider':1,'À faire':2}[s]??3);
 list.sort((a,b)=>{const da=goodDate(a.date)?a.date:'9999-12-31',db=goodDate(b.date)?b.date:'9999-12-31';
  return da.localeCompare(db)||rank(a.status)-rank(b.status)||a.title.localeCompare(b.title,'fr');});
 counter.textContent=list.length+' '+(list.length>1?'actions':'action')+' à afficher';
 if(!list.length){
  const empty=node('div','focus-empty');
  empty.append(node('strong','','Rien à afficher dans ce filtre.'));
  empty.append(node('p','',all.length?'Choisis un autre filtre ou ajoute une action.':'Commence par noter une première action.'));
  const add=node('button','focus-action-btn','＋ Ajouter une action');add.type='button';
  add.addEventListener('click',()=>$('client-quick-add')?.click());empty.append(add);host.append(empty);return;
 }
 const fragment=document.createDocumentFragment();
 for(const a of list.slice(0,6)){
  const t=when(a,now),card=node('article','focus-item');
  const mark=node('span','focus-item-mark',a.status==='En cours'?'◐':a.status==='À valider'?'◇':'○');
  mark.setAttribute('aria-hidden','true');
  const content=node('div','focus-item-copy');
  const title=node('strong','focus-item-title',a.title.slice(0,200));
  const bottom=node('div','focus-item-meta');
  bottom.append(node('span','focus-item-project',String(a.project||'Personnel').slice(0,80)),
                node('span','focus-due '+t.tone,t.label),
                node('span','focus-item-state',String(a.status||'À faire').slice(0,30)));
  content.append(title,bottom);
  const button=node('button','focus-open','Ouvrir →');button.type='button';
  button.setAttribute('aria-label',"Ouvrir la fiche de l’action "+a.title.slice(0,100));
  button.addEventListener('click',()=>editAction(a.id));
  card.append(mark,content,button);fragment.append(card);
 }
 host.append(fragment);
 if(list.length>6)host.append(node('p','focus-list-foot','6 actions sur '+list.length+' affichées. Voir le planning pour la liste complète.'));
}
$('pilotage-action-search')?.addEventListener('input',render);
for(const b of tabs)b.addEventListener('click',()=>{
 if(!['priority','today','late','week','unscheduled'].includes(b.dataset.focusFilter))return;
 selected=b.dataset.focusFilter;
 for(const t of tabs)t.setAttribute('aria-pressed',String(t===b));
 render();
});
$('pilotage-focus-add')?.addEventListener('click',()=>$('client-quick-add')?.click());
window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)render();});
const calendar=$('ops-calendar');
if(calendar)new MutationObserver(()=>{
 const value=localStorage.getItem(KEY)||'[]';
 if(value!==lastSnapshot){lastSnapshot=value;render();}
}).observe(calendar,{childList:true,subtree:false});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
window.addEventListener('pageshow',render);
lastSnapshot=localStorage.getItem(KEY)||'[]';
render();
})();