(function(){
"use strict";
const API="https://voytsqyorhoveurnguxn.supabase.co/functions/v1/crew-projects-manage";
const ST=[["active","En cours"],["planned","À lancer"],["approved","Validé"],["paused","En pause"],["completed","Terminé"],["idea","À étudier"]];
const PR=[["high","Haute"],["normal","Normale"],["low","Basse"]];
let projects=[],current=null,filter="all",category="all",query="",busy=false;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const name=(x,choices)=>choices.find(v=>v[0]===x)?.[1]||x;
const img=p=>(/^project-covers\/[a-z0-9-]+\.svg$|^https:\/\//i).test(p?.cover_url||"")?p.cover_url:"project-covers/univers.svg";
const body=()=>document.getElementById("drawerBody");
function badge(p){return '<span class="crew-proj-badge">'+esc(name(p.status,ST))+'</span> <span class="crew-proj-badge '+(p.priority==="high"?"priority-high":"")+'">Priorité '+esc(name(p.priority,PR))+'</span>';}
function prog(p){const steps=p.steps||[];return '<div class="crew-proj-bar"><b style="width:'+(p.progress??0)+'%"></b></div><p class="crew-proj-note">'+(steps.length?steps.filter(s=>s.completed).length+" / "+steps.length+" étapes · "+p.progress+" %":"Aucune étape définie")+'</p>';}
async function api(payload){
const {data:{session}}=await sb.auth.getSession();if(!session)throw Error("Connecte-toi avec Espace Sonia.");
const r=await fetch(API,{method:"POST",headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},body:JSON.stringify(payload)});
const data=await r.json();if(!r.ok)throw Error(data.error||"Erreur de sauvegarde");return data;
}
async function reload(){projects=(await api({action:"list"})).projects||[];miniPaint();return projects;}
function nav(){
const n=document.querySelector(".nav");if(!n||n.querySelector("[data-projects-trigger]"))return;
const a=document.createElement("a");a.href="#";a.dataset.projectsTrigger="true";a.textContent="✦ CRÉATION / PROJETS";
const anchor=n.querySelector('[data-view="events"]');if(anchor)anchor.before(a);else n.append(a);
}
function mini(){
const p=document.querySelector(".crew-premium");if(!p||p.querySelector("#crew-projects-home"))return;
const node=document.createElement("section");node.id="crew-projects-home";node.className="crew-projects-home";
node.innerHTML='<div class="crew-projects-header"><div><h2>✦ Projets en cours</h2><p>Livres, mascottes, bracelets, identité & créations The Crew.</p></div><button type="button" data-projects-trigger class="crew-projects-btn">Tous les projets →</button></div><div id="crew-projects-mini"><p class="crew-proj-note">Chargement des projets…</p></div>';
const first=p.querySelector(".cp-grid");first?first.before(node):p.append(node);
}
function miniPaint(){
mini();const target=document.getElementById("crew-projects-mini");if(!target)return;
const select=["livre-coloriage","cahier-vacances","mascottes","groupes-identite"].map(x=>projects.find(p=>p.slug===x)).filter(Boolean);
if(!select.length)select.push(...projects.slice(0,3));
const ideas=projects.filter(p=>p.slug.startsWith("idee-"));
target.innerHTML=(ideas.length?'<div class="crew-proj-ideas-cta"><div><strong>'+ideas.length+' nouvelles idées à étudier</strong><p>Livres, goodies, ateliers, numérique et événements : toutes classées dans ton suivi.</p></div><button type="button" class="crew-projects-btn" data-project-ideas>Explorer les idées →</button></div>':"")+'<div class="crew-projects-cover-grid">'+select.map(p=>'<article class="crew-projects-cover-card"><img src="'+esc(img(p))+'" alt="Visuel du projet '+esc(p.title)+'" loading="lazy"><div class="crew-projects-cover-body">'+badge(p)+'<h3>'+esc(p.title)+'</h3><p>'+esc(p.next_action||"Prochaine étape à définir")+'</p>'+prog(p)+'<button type="button" data-project-open="'+esc(p.id)+'">Ouvrir / continuer →</button></div></article>').join("")+'</div>';
}
function page(html){const d=document.getElementById("drawer"),b=body(),t=document.getElementById("drawerTitle");if(!d||!b||!t)return;d.style.display="block";t.textContent="CRÉATION / PROJETS";b.innerHTML='<section class="crew-proj-dashboard">'+html+'</section>';}
function card(p){return '<article class="crew-proj-card"><img src="'+esc(img(p))+'" alt="Visuel du projet '+esc(p.title)+'" loading="lazy"><div class="crew-proj-card-content">'+badge(p)+'<h4>'+esc(p.title)+'</h4><p>'+esc(p.category)+'</p>'+prog(p)+'<p><strong>À faire :</strong> '+esc(p.next_action||"À définir")+'</p><button type="button" data-project-open="'+esc(p.id)+'">Ouvrir le projet →</button></div></article>';}
const filters=[["all","Tous"],["active","En cours"],["planned","À lancer"],["approved","Validés"],["completed","Terminés"],["idea","Idées à étudier"],["paused","En pause"]];
function list(){
current=null;
page('<header class="crew-proj-banner"><div><h3>Création · Projets</h3><p>Construire, suivre, valider et terminer les créations The Crew.</p></div><button type="button" class="crew-projects-btn" data-project-new>＋ Nouveau projet</button></header><div class="crew-proj-toolbar"><input id="crew-project-search" class="crew-proj-search" type="search" placeholder="Rechercher un projet..." value="'+esc(query)+'"><span class="crew-proj-badge">'+projects.length+' projets · '+projects.filter(p=>p.slug.startsWith("idee-")).length+' idées nouvelles</span></div>'+
'<div class="crew-proj-categorybar"><label for="crew-project-category">Univers :</label><select id="crew-project-category"><option value="all">Toutes les catégories</option>'+[...new Set(projects.map(p=>p.category))].sort().map(c=>'<option value="'+esc(c)+'"'+(category===c?" selected":"")+'>'+esc(c)+'</option>').join("")+'</select></div><nav class="crew-proj-filters">'+filters.map(([k,t])=>'<button type="button" data-project-filter="'+k+'" class="'+(filter===k?"active":"")+'">'+t+'</button>').join("")+'</nav><div id="crew-project-list" class="crew-proj-grid"></div><p class="crew-proj-note">L’avancement est calculé uniquement à partir des étapes cochées.</p>');
listPaint();
}
function listPaint(){
const holder=body()?.querySelector("#crew-project-list");if(!holder)return;
const matches=projects.filter(p=>(filter==="all"||p.status===filter)&&(category==="all"||p.category===category)&&[p.title,p.category,p.description,p.next_action].join(" ").toLowerCase().includes(query.toLowerCase()));
holder.innerHTML=matches.map(card).join("")||'<p class="crew-proj-note">Aucun projet dans cette catégorie.</p>';
}
function detail(id){
const p=projects.find(x=>x.id===id);if(!p)return;current=p;
page('<div class="crew-proj-actions"><button class="crew-projects-btn-secondary" data-project-back>← Tous les projets</button><button class="crew-projects-btn" data-project-edit>✎ Modifier le projet</button></div><article class="crew-proj-detail"><img class="crew-proj-detail-hero" src="'+esc(img(p))+'" alt="Visuel du projet">'+badge(p)+'<h3>'+esc(p.title)+'</h3><p>'+esc(p.description)+'</p>'+prog(p)+'<section class="crew-proj-detail-panel"><h4>Prochaine action</h4><p>'+esc(p.next_action||"À définir")+'</p>'+(p.due_date?'<p>Échéance : '+esc(p.due_date)+'</p>':"")+'</section><section class="crew-proj-detail-panel"><h4>Étapes du projet</h4>'+(p.steps||[]).map(s=>'<label class="crew-proj-step"><input type="checkbox" data-step-id="'+esc(s.id)+'" '+(s.completed?"checked":"")+'><span class="'+(s.completed?"done":"")+'">'+esc(s.title)+'</span></label>').join("")+'<form id="crew-project-new-step" class="crew-proj-step-form"><input name="title" required maxlength="240" placeholder="Ajouter une étape…"><button class="crew-projects-btn" type="submit">＋ Étape</button></form><p class="crew-proj-message" id="crew-project-step-msg"></p></section>'+(p.notes?'<section class="crew-proj-detail-panel"><h4>Notes</h4><p>'+esc(p.notes)+'</p></section>':"")+'</article>');
}
function option(values,selected){return values.map(([k,n])=>'<option value="'+k+'"'+(selected===k?" selected":"")+'>'+esc(n)+'</option>').join("");}
function edit(p){
const s=p||{};
page('<div class="crew-proj-actions"><button class="crew-projects-btn-secondary" data-project-back>← Retour</button></div><article class="crew-proj-detail"><h3>'+(p?"Modifier le projet":"Nouveau projet")+'</h3><form class="crew-proj-detail-panel" id="crew-project-editor" data-id="'+esc(s.id||"")+'"><div class="crew-proj-form"><label>Titre<input name="title" required maxlength="160" value="'+esc(s.title||"")+'"></label><label>Catégorie<input name="category" required maxlength="85" value="'+esc(s.category||"Création")+'"></label><label>Statut<select name="status">'+option(ST,s.status||"idea")+'</select></label><label>Priorité<select name="priority">'+option(PR,s.priority||"normal")+'</select></label><label class="full">Description<textarea name="description" maxlength="1000">'+esc(s.description||"")+'</textarea></label><label class="full">Prochaine action<input name="next_action" maxlength="350" value="'+esc(s.next_action||"")+'"></label><label>Échéance<input type="date" name="due_date" value="'+esc(s.due_date||"")+'"></label><label>Visuel (lien ou fichier du site)<input name="cover_url" maxlength="600" value="'+esc(s.cover_url||"project-covers/univers.svg")+'"></label><label class="full">Notes<textarea name="notes" maxlength="2000">'+esc(s.notes||"")+'</textarea></label></div><div class="crew-proj-actions"><button class="crew-projects-btn" type="submit">Enregistrer</button>'+(p?'<button class="crew-projects-btn-secondary" data-project-archive type="button">Archiver</button>':"")+'</div><p id="crew-project-editor-msg" class="crew-proj-message"></p></form></article>');
}
async function open(){
page('<p class="crew-proj-note">Chargement…</p>');
try{await reload();list();}catch(err){page('<p class="crew-proj-note">'+esc(err.message)+'</p>');}
}
document.addEventListener("click",async e=>{
const t=e.target.closest("[data-projects-trigger],[data-project-ideas],[data-project-open],[data-project-filter],[data-project-back],[data-project-new],[data-project-edit],[data-project-archive]");
if(!t)return;e.preventDefault();e.stopImmediatePropagation();
if(t.hasAttribute("data-projects-trigger")){open();return;}
if(t.hasAttribute("data-project-ideas")){filter="idea";category="all";open();return;}
if(t.hasAttribute("data-project-open")){if(!projects.length)await reload();detail(t.dataset.projectOpen);return;}
if(t.hasAttribute("data-project-filter")){filter=t.dataset.projectFilter;list();return;}
if(t.hasAttribute("data-project-back")){list();return;}
if(t.hasAttribute("data-project-new")){edit(null);return;}
if(t.hasAttribute("data-project-edit")){edit(current);return;}
if(t.hasAttribute("data-project-archive")&&current){
if(!confirm("Archiver ce projet ? Il quittera les listes, sans effacer les fichiers."))return;
t.disabled=true;try{await api({action:"archive_project",id:current.id,confirm:true});current=null;await reload();list();}catch(err){alert(err.message);t.disabled=false;}
}
},true);
document.addEventListener("input",e=>{if(e.target.id==="crew-project-search"){query=e.target.value;listPaint();}});
document.addEventListener("change",e=>{if(e.target.id==="crew-project-category"){category=e.target.value;listPaint();}});
document.addEventListener("change",async e=>{
const el=e.target.closest("[data-step-id]");if(!el||!current||busy)return;
busy=true;el.disabled=true;
try{await api({action:"toggle_step",project_id:current.id,id:el.dataset.stepId,completed:el.checked});const id=current.id;await reload();detail(id);}
catch(err){alert(err.message);el.checked=!el.checked;el.disabled=false;}finally{busy=false;}
});
document.addEventListener("submit",async e=>{
const form=e.target;
if(form.id==="crew-project-editor"){
e.preventDefault();if(busy)return;busy=true;const msg=form.querySelector("#crew-project-editor-msg"),button=form.querySelector("[type=submit]");
button.disabled=true;msg.textContent="Enregistrement…";
try{const values=Object.fromEntries(new FormData(form).entries()),id=form.dataset.id;
const result=await api({action:"save_project",...values,...(id?{id}:{})});await reload();detail(result.project.id);}
catch(err){msg.textContent=err.message;button.disabled=false;}finally{busy=false;}
}else if(form.id==="crew-project-new-step"){
e.preventDefault();if(!current||busy)return;busy=true;const m=body()?.querySelector("#crew-project-step-msg"),button=form.querySelector("[type=submit]");
button.disabled=true;if(m)m.textContent="Enregistrement…";
try{const id=current.id;await api({action:"save_step",project_id:id,title:form.elements.title.value,completed:false});await reload();detail(id);}
catch(err){if(m)m.textContent=err.message;button.disabled=false;}finally{busy=false;}
}
},true);
function init(){nav();mini();reload().catch(err=>{const el=document.getElementById("crew-projects-mini");if(el)el.innerHTML='<p class="crew-proj-note">'+esc(err.message)+'</p>';});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
try{sb.auth.onAuthStateChange((ev,s)=>{if(ev==="SIGNED_IN"&&s)reload().catch(()=>{});});}catch(e){}
window.CrewCreativeProjects={open,reload};
})();