/* ELOAH · cockpit interactif, connecté uniquement aux données de ce navigateur. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const hero=document.querySelector('main#contenu > .client-hero');
if(!hero)return;
const taskKey='eloah-planning-v1';
const parisDate=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const today=parisDate();
const cDate=new Date(today+'T12:00:00Z');
const formatter=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Paris'});
const pretty=formatter.format(cDate).replace(/^./,m=>m.toUpperCase());
const eventUpcoming=today<='2026-10-17';
const main=document.createElement('section');
main.id='eloah-coach-dashboard';
main.setAttribute('aria-label','Tableau de bord de mon organisation');
main.innerHTML=`
<section class="eloah-coach-card" aria-labelledby="eloah-coach-heading">
<div class="eloah-coach-head"><span class="eloah-coach-kicker">ELOAH · TON TABLEAU DE BORD</span><span class="eloah-coach-date" id="eloah-coach-date"></span></div>
<h2 class="eloah-coach-h2" id="eloah-coach-heading">Ce qui mérite ton attention</h2>
<p class="eloah-coach-intro">Des pistes issues de tes projets connus, à confirmer. Elles ne sont pas des actions enregistrées.</p>
<div class="eloah-coach-priorities">
<article class="eloah-coach-priority"><div class="eloah-coach-head"><span class="eloah-coach-name">01 · The Crew Orchies</span><span class="eloah-coach-flag">À préparer</span></div><p id="eloah-crew-summary"></p><button class="eloah-coach-primary" type="button" data-coach-suggest="crew">Préparer mon événement →</button></article>
<article class="eloah-coach-priority"><div class="eloah-coach-head"><span class="eloah-coach-name">02 · ELOAH</span><span class="eloah-coach-flag">À vérifier</span></div><p>Simplifier l’interface et vérifier la sauvegarde, les projets et les livrables.</p><a class="btn" href="eloah-monitor.html">Ouvrir la supervision →</a></article>
<article class="eloah-coach-priority"><div class="eloah-coach-head"><span class="eloah-coach-name">03 · Power &amp; Glam</span><span class="eloah-coach-flag">À suivre</span></div><p>Avancer les dossiers éditoriaux et vérifier la livraison du Love Journal.</p><button type="button" data-coach-suggest="pg">Préparer cette action →</button></article>
</div>
</section>
<section class="eloah-coach-card" aria-labelledby="eloah-saved-title">
<div class="eloah-coach-head"><h2 class="eloah-coach-h2" id="eloah-saved-title">Mes actions enregistrées</h2><span class="eloah-coach-date" id="eloah-saved-count"></span></div>
<div id="eloah-coach-saved" class="eloah-coach-saved" aria-live="polite"></div>
</section>
<section class="eloah-coach-card" id="eloah-coach-add" aria-labelledby="eloah-add-title">
<h2 class="eloah-coach-h2" id="eloah-add-title">＋ Noter une action</h2>
<p class="eloah-coach-intro">Enregistre une vraie action dans ton planning ELOAH, ici sur cet appareil.</p>
<form id="eloah-coach-form" class="eloah-coach-form">
<div class="eloah-coach-fields"><label class="eloah-coach-label" for="eloah-coach-universe">Dans quel univers ?
<select id="eloah-coach-universe" name="universe">
<option>The Crew Orchies</option><option>Power &amp; Glam</option><option>ELOAH</option><option>PARISIS Engine</option><option>Sonia Velka</option><option>SONIA OS</option><option>Le Lion Blanc</option><option>Personnel</option>
</select></label>
<label class="eloah-coach-label" for="eloah-coach-deadline">Date (facultative)
<input id="eloah-coach-deadline" name="date" type="date"></label></div>
<label class="eloah-coach-label" for="eloah-coach-action">Que dois-tu faire ?
<textarea id="eloah-coach-action" name="action" rows="3" maxlength="200" required placeholder="Ex. Préparer les musiques de l’atelier, terminer un article…"></textarea></label>
<fieldset><legend>Priorité</legend><div class="eloah-coach-radios">
<label><input type="radio" name="priority" value="Urgente">Urgente</label>
<label><input type="radio" name="priority" value="Normale" checked>Normale</label>
<label><input type="radio" name="priority" value="Plus tard">Plus tard</label>
</div></fieldset>
<button type="submit" class="eloah-coach-save">Ajouter à mon suivi →</button>
<p class="eloah-coach-status" id="eloah-coach-status" role="status" aria-live="polite"></p>
</form></section>
<section class="eloah-coach-card" aria-labelledby="eloah-quick-title">
<h2 class="eloah-coach-h2" id="eloah-quick-title">Mes commandes rapides</h2>
<p class="eloah-coach-intro">Ouvre uniquement la partie dont tu as besoin.</p>
<div class="eloah-coach-commands">
<button class="eloah-coach-command" type="button" data-coach-show="mes-projets">▣ &nbsp; Mes projets →</button>
<button class="eloah-coach-command" type="button" data-coach-show="mon-organisation">▦ &nbsp; Mon planning →</button>
<a class="btn eloah-coach-command" href="eloah-monitor.html">◎ &nbsp; Supervision →</a>
<button class="eloah-coach-command" type="button" data-coach-show="pilotage-focus">☑ &nbsp; Mes priorités →</button>
</div>
<nav class="eloah-coach-footnav" aria-label="Mes autres accès">
<button type="button" data-coach-show="services">Mes outils</button>
<button type="button" data-coach-show="mes-demarches">Démarches et comptes</button>
<button type="button" data-coach-show="compte-et-sauvegardes">Sauvegardes</button>
</nav></section>`;
hero.after(main);
$('eloah-coach-date').textContent=pretty;
$('eloah-crew-summary').textContent=eventUpcoming?'Dance Party Latino · 17 octobre, 18h30–20h30. Préparer la séance et vérifier les inscriptions.':'Préparer les prochains ateliers, leurs inscriptions et les messages aux participants.';
const panel=hero.querySelector('.pilotage-panel');
if(panel){panel.classList.add('eloah-coach-metrics');main.after(panel);}
const toFold=['pilotage-focus','mon-organisation','mes-projets','services','mes-demarches','compte-et-sauvegardes'];
for(const id of toFold){const node=$(id);if(node)node.classList.add('eloah-coach-folded');}
const show=(id)=>{
 const node=$(id);if(!node)return;
 node.classList.remove('eloah-coach-folded');
 if(typeof node.eloahSetOpen==='function')node.eloahSetOpen(true);
 if(node.tagName==='DETAILS')node.open=true;
 requestAnimationFrame(()=>node.scrollIntoView({block:'start',behavior:'smooth'}));
};
document.querySelectorAll('[data-coach-show]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.coachShow)));
function followHash(){
 const id=decodeURIComponent(location.hash.slice(1));
 if(!id)return;
 const node=$(id);if(!node)return;
 for(const sid of toFold){const section=$(sid);if(section&&(node===section||section.contains(node)))section.classList.remove('eloah-coach-folded');}
}
window.addEventListener('hashchange',followHash);
followHash();
const status=$('eloah-coach-status'),form=$('eloah-coach-form');
function inform(message,error=false){status.textContent=message;status.dataset.error=String(error);}
document.querySelectorAll('[data-coach-suggest]').forEach(b=>b.addEventListener('click',()=>{
 const isCrew=b.dataset.coachSuggest==='crew';
 $('eloah-coach-universe').value=isCrew?'The Crew Orchies':'Power & Glam';
 $('eloah-coach-action').value=isCrew?(eventUpcoming?'Préparer la Dance Party Latino : séance, musiques, inscriptions et messages':'Préparer le prochain atelier The Crew : séance, inscriptions et communication'):'Vérifier le paiement et la livraison du Love Journal';
 $('eloah-coach-deadline').value=isCrew&&eventUpcoming?'2026-10-17':'';
 form.elements.priority.value=isCrew?'Urgente':'Normale';
 inform('Proposition préremplie. Vérifie-la puis enregistre si tu veux la conserver.');
 $('eloah-coach-add').scrollIntoView({block:'start',behavior:'smooth'});
 $('eloah-coach-action').focus({preventScroll:true});
}));
function loadTasks(){
 const list=JSON.parse(localStorage.getItem(taskKey)||'[]');
 if(!Array.isArray(list))throw Error('Le format du planning est invalide. Aucune donnée remplacée.');
 return list;
}
function refresh(){
 const target=$('eloah-coach-saved');target.replaceChildren();
 let tasks;
 try{tasks=loadTasks().filter(t=>t&&typeof t==='object'&&typeof t.title==='string'&&!t.archived&&t.status!=='Terminé');}
 catch(error){target.textContent='Impossible de lire le planning : '+error.message;return;}
 $('eloah-saved-count').textContent=tasks.length+' ouverte'+(tasks.length>1?'s':'');
 if(!tasks.length){const msg=document.createElement('p');msg.className='eloah-coach-empty';msg.textContent='Aucune action ouverte enregistrée ici. Tu peux en ajouter une juste en dessous.';target.append(msg);return;}
 tasks.sort((a,b)=>{const dates=(a.date||'9999').localeCompare(b.date||'9999');const levels={'Urgente':0,'Normale':1,'Plus tard':2};return (levels[a.priority]??1)-(levels[b.priority]??1)||dates;});
 for(const task of tasks){
   const item=document.createElement('div');item.className='eloah-coach-task';
   const copy=document.createElement('div');
   const title=document.createElement('strong');title.textContent=task.title;
   const meta=document.createElement('small');meta.textContent=[task.project||'Sans univers',task.date||'Sans date',task.priority||'Priorité non définie'].join(' · ');
   copy.append(title,meta);
   const actions=document.createElement('div');actions.className='eloah-coach-task-actions';
   const edit=document.createElement('button');edit.type='button';edit.textContent='Modifier';edit.setAttribute('aria-label','Modifier : '+task.title);
   edit.addEventListener('click',()=>{if(window.ELOAHWorkspace?.editAction)window.ELOAHWorkspace.editAction(task.id);else show('mon-organisation');});
   const done=document.createElement('button');done.type='button';done.textContent='Terminer';done.setAttribute('aria-label','Terminer : '+task.title);
   done.addEventListener('click',()=>{try{const list=loadTasks();const existing=list.find(t=>t.id===task.id);if(!existing)throw Error('Action introuvable.');const next=list.map(t=>t.id===task.id?{...t,status:'Terminé',updated:new Date().toISOString()}:t);localStorage.setItem(taskKey,JSON.stringify(next));window.ELOAHWorkspace?.renderCalendar?.();refresh();}catch(error){inform('Impossible de terminer : '+error.message,true);}});
   actions.append(edit,done);item.append(copy,actions);target.append(item);
 }

}
form.addEventListener('submit',event=>{
 event.preventDefault();
 const title=$('eloah-coach-action').value.trim();
 if(!title){inform('Décris ton action avant de l’enregistrer.',true);return;}
 try{
  const list=loadTasks();
  const entry={id:crypto.randomUUID(),title:title.slice(0,200),project:$('eloah-coach-universe').value,date:$('eloah-coach-deadline').value,status:'À faire',kind:'Action',note:'',priority:form.elements.priority.value,archived:false,updated:new Date().toISOString()};
  localStorage.setItem(taskKey,JSON.stringify([...list,entry]));
  form.reset();form.elements.priority.value='Normale';
  window.ELOAHWorkspace?.renderCalendar?.();
  refresh();inform('Action enregistrée dans le planning de cet appareil. Pense à faire une sauvegarde pour changer de téléphone.');
 }catch(error){inform('Enregistrement impossible : '+error.message,true);}
});
window.addEventListener('storage',e=>{if(!e.key||e.key===taskKey)refresh();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
const calendar=$('ops-calendar');
if(calendar){let snapshot=localStorage.getItem(taskKey);new MutationObserver(()=>{const updated=localStorage.getItem(taskKey);if(updated!==snapshot){snapshot=updated;refresh();}}).observe(calendar,{childList:true});}
refresh();
})();