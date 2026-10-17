/* ELOAH · Six dossiers numérotés du pilotage historique.
   Consultation sans création automatique de tâches, synchronisation locale explicite. */
(()=>{
'use strict';
const dashboard=document.getElementById('eloah-coach-dashboard');
const host=dashboard?.querySelector('.eloah-coach-card');
if(!dashboard||!host)return;
const TASK_KEY='eloah-planning-v1', LEGACY_KEY='sonia-universe-v1-itriia';
const items=[
 {id:'eloah-plan-20261013-01',title:'ELOAH · Harmoniser tous les menus et la navigation mobile',module:'Développement',project:'ELOAH',note:'Uniformiser les menus latéraux sur toutes les pages ; vérifier le hamburger automatique sur mobile, les liens, les retours et les écrans 320/390 px.',url:'mes-univers.html'},
 {id:'eloah-plan-20261013-02',title:'ELOAH Formations · Créer l’espace élèves et les inscriptions',module:'Formations',project:'ELOAH',note:'Structurer les formations ELOAH, Power & Glam et The Crew Academy. Construire les parcours, fiches pédagogiques, accès élèves, suivi des inscriptions et paiements sécurisés (encore à développer).',url:'eloah-partenaire.html?rubrique=Formations'},
 {id:'eloah-plan-20261013-03',title:'Foi & Spiritualité · Compléter la bibliothèque et les publications',module:'Bases d’Expertise',project:'ELOAH',note:'Réunir les douze chapitres, les apocryphes, les dossiers Magdalena, les images patrimoniales, les sources et les lecteurs audio ; vérifier chaque lien et conserver les archives.',url:'eloah-foi-spiritualite.html'},
 {id:'eloah-plan-20261013-04',title:'PARISIS ENGINE · Poursuivre l’atlas et vérifier les axes',module:'Projets',project:'PARISIS Engine',note:'Conserver les anciens points et liaisons. Poursuivre les fiches AXE-014 et PAR-ISIS-005 avec cartes historiques, coordonnées sourcées, GeoJSON, mesures reproductibles et distinction faits / hypothèses.',url:'eloah-parisis.html'},
 {id:'eloah-plan-20261013-05',title:'Power & Glam · Finaliser la publication et la vente des créations',module:'ELOAH Studio',project:'Power & Glam',note:'Vérifier le PDF du Love Journal après paiement, préparer les publications illustrées, le lecteur audio, les collections Etsy et les modèles créatifs de SMITH Studio.',url:'https://powerglam1.wordpress.com/'},
 {id:'eloah-plan-20261013-06',title:'The Crew · Sécuriser les événements et le suivi administratif',module:'Projets',project:'The Crew Orchies',note:'Vérifier la billetterie Latino du 17 octobre et Flashback du 24 octobre, les paiements et les inscriptions ; contrôler le statut WordPress Premium et le SIRET dans LeCompteAsso.',url:'https://thecreworchies.blog/'}
];
host.id='eloah-numbered-pilotage';
host.setAttribute('aria-labelledby','eloah-numbered-title');
host.innerHTML='<div class="eloah-coach-head"><span class="eloah-coach-kicker">ELOAH · SIX DOSSIERS REPÉRÉS</span><span class="eloah-coach-date">Octobre 2026</span></div><h2 class="eloah-coach-h2" id="eloah-numbered-title">Pilotage des projets et actions</h2><p class="eloah-coach-intro">Les six priorités de l’ancien « Mon Espace », conservées dans leur ordre initial. Leur présence ne signifie pas qu’elles sont réalisées. Ajoute-les au planning pour les suivre réellement.</p><div class="eloah-numbered-summary" id="eloah-numbered-summary" role="status" aria-live="polite"></div><div class="eloah-numbered-grid" id="eloah-numbered-grid"></div><p id="eloah-numbered-message" class="eloah-numbered-message" role="status" aria-live="polite"></p><p class="eloah-numbered-foot">Source : les six priorités préparées dans « Mon Espace » en octobre 2026. Leurs notes et états locaux sont lus sans être effacés. Le suivi du planning reste enregistré sur cet appareil, sans synchronisation automatique.</p>';
const $=id=>document.getElementById(id);
const grid=$('eloah-numbered-grid'), message=$('eloah-numbered-message'),summary=$('eloah-numbered-summary');
const node=(tag,cls,text)=>{
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!==undefined)e.textContent=text;
 return e;
};
function read(key){
 const text=localStorage.getItem(key);
 if(!text)return [];
 const data=JSON.parse(text);
 if(!Array.isArray(data))throw Error('Format de données non reconnu : '+key+'. Aucune donnée remplacée.');
 return data;
}
function load(){
 const tasks=read(TASK_KEY),legacy=read(LEGACY_KEY);
 return {tasks,legacy};
}
function taskFor(item,tasks){
 return tasks.filter(t=>t&&typeof t==='object'&&(t.sourcePlanId===item.id||t.title===item.title))
 .sort((a,b)=>String(b.updated||'').localeCompare(String(a.updated||'')))[0]||null;
}
function render(){
 grid.replaceChildren();
 let tasks,legacy;
 try{({tasks,legacy}=load());}
 catch(error){
  summary.textContent='Impossible de lire les données locales.';
  message.textContent=error.message;
  message.dataset.error='true';
  return;
 }
 const counts={tracked:0,done:0};
 for(const [index,item] of items.entries()){
  const historical=legacy.find(x=>x&&x.id===item.id);
  const task=taskFor(item,tasks);
  if(task&&!task.archived)counts.tracked++;
  const completed=task&&!task.archived?task.status==='Terminé':historical?.state==='Terminé';
  if(completed)counts.done++;
  const state=task
    ? (task.archived?'Archivé dans le planning':task.status||'À faire')
    : historical
      ? (historical.archived?'Archivé dans Mon Espace':historical.state||'À qualifier')
      : 'À organiser';
  const title=typeof historical?.title==='string'&&historical.title.trim()?historical.title:item.title;
  const brief=typeof historical?.note==='string'&&historical.note.trim()?historical.note:item.note;
  const card=node('article','eloah-numbered-card');
  const top=node('div','eloah-numbered-top');
  const number=node('span','eloah-numbered-index',String(index+1).padStart(2,'0'));
  const stateEl=node('span','eloah-numbered-state',state);
  if(completed)stateEl.dataset.done='true';
  top.append(number,stateEl);
  const heading=node('h3','eloah-numbered-heading',title);
  const category=node('p','eloah-numbered-category',item.module);
  const description=node('p','eloah-numbered-description',brief);
  const actions=node('div','eloah-numbered-actions');
  const link=node('a','btn','Ouvrir le dossier ↗');
  link.href=item.url;
  if(/^https?:\/\//.test(item.url)){link.target='_blank';link.rel='noopener noreferrer';}
  actions.append(link);
  if(task&&!task.archived){
   const edit=node('button','','Modifier le suivi');
   edit.type='button';
   edit.addEventListener('click',()=>{
    if(window.ELOAHWorkspace?.editAction)window.ELOAHWorkspace.editAction(task.id);
    else showMessage('Éditeur indisponible : ouvre le planning complet.',true);
   });
   const done=node('button','',task.status==='Terminé'?'Rouvrir':'Terminer');
   done.type='button';
   done.addEventListener('click',()=>{
    try{
     const current=read(TASK_KEY);
     const found=current.find(x=>x.id===task.id);
     if(!found)throw Error('Action introuvable dans le planning.');
     const next=current.map(x=>x.id===task.id?{...x,status:x.status==='Terminé'?'À faire':'Terminé',updated:new Date().toISOString()}:x);
     localStorage.setItem(TASK_KEY,JSON.stringify(next));
     window.ELOAHWorkspace?.renderCalendar?.();
     render();
     showMessage('Statut mis à jour dans le planning local.');
    }catch(error){showMessage('Modification impossible : '+error.message,true);}
   });
   actions.append(edit,done);
  }else if(task&&task.archived){
   const restore=node('button','eloah-coach-primary','Réactiver le suivi');
   restore.type='button';
   restore.addEventListener('click',()=>{
    try{
     const current=read(TASK_KEY);
     const existing=current.find(x=>x.id===task.id);
     if(!existing)throw Error('Action archivée introuvable.');
     const next=current.map(x=>x.id===task.id?{...x,archived:false,status:x.status==='Terminé'?'À faire':x.status||'À faire',updated:new Date().toISOString()}:x);
     localStorage.setItem(TASK_KEY,JSON.stringify(next));
     window.ELOAHWorkspace?.renderCalendar?.();
     render();
     showMessage('Dossier '+String(index+1).padStart(2,'0')+' réactivé dans le planning.');
    }catch(error){showMessage('Réactivation impossible : '+error.message,true);}
   });
   actions.append(restore);
  }else{
   const add=node('button','eloah-coach-primary','Suivre dans mon planning');
   add.type='button';
   add.addEventListener('click',()=>{
    try{
     const current=read(TASK_KEY);
     if(taskFor(item,current)){render();showMessage('Ce dossier figure déjà dans le planning.');return;}
     const created={
      id:crypto.randomUUID(),title:item.title,project:item.project,date:/^\d{4}-\d{2}-\d{2}$/.test(historical?.date||'')?historical.date:'',
      status:historical?.state&&['À faire','En cours','À valider','Terminé'].includes(historical.state)?historical.state:'À faire',
      kind:'Action',note:brief,priority:'Normale',archived:false,sourcePlanId:item.id,
      updated:new Date().toISOString()
     };
     localStorage.setItem(TASK_KEY,JSON.stringify([...current,created]));
     window.ELOAHWorkspace?.renderCalendar?.();
     render();
     showMessage('Dossier '+String(index+1).padStart(2,'0')+' ajouté au planning de cet appareil.');
    }catch(error){showMessage('Enregistrement impossible : '+error.message,true);}
   });
   actions.append(add);
  }
  card.append(top,heading,category,description,actions);
  grid.append(card);
 }
 summary.textContent=items.length+' dossiers numérotés · '+counts.tracked+(counts.tracked===1?' suivi':' suivis')+' dans le planning · '+counts.done+(counts.done===1?' terminé':' terminés')+' d’après les états locaux';
}
function showMessage(text,error=false){message.textContent=text;message.dataset.error=String(error);}
window.addEventListener('storage',e=>{
 if(e.key===null||e.key===TASK_KEY||e.key===LEGACY_KEY)render();
});
window.addEventListener('pageshow',render);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
const calendar=$('ops-calendar');
if(calendar){
 let old=localStorage.getItem(TASK_KEY);
 new MutationObserver(()=>{
  const next=localStorage.getItem(TASK_KEY);
  if(next!==old){old=next;render();}
 }).observe(calendar,{childList:true,subtree:false});
}
render();
})();