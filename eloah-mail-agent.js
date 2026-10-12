(()=>{
"use strict";
const KEY="eloah-gmail-command-v1",$=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const views={overview:["Vue générale","Les sujets importants et les prochaines décisions."],priority:["Priorités","Commence par les actions qui demandent une vérification rapide."],reply:["Réponses à préparer","Les messages auxquels répondre ou revenir."],money:["Factures & paiements","Contrôler les échéances depuis les espaces officiels, sans payer depuis cet outil."],documents:["Documents & formalités","Pièces à rassembler, dossiers à classer et suivis administratifs."],security:["Comptes & sécurité","Identifier les alertes et vérifier directement dans les applications concernées."],events:["Rendez-vous & dates","Les dates présentes dans les messages, sans création automatique d'événement."],all:["Tous les dossiers","L'ensemble des entrées du rapport importé."],settings:["Import & sécurité","Confidentialité, sauvegarde et limites de l'analyse."]};
const categories=["reply","money","documents","security","events","other"];
let view="overview", editing=null;
let state={format:"eloah-mail-agent-v1",generated_at:null,scanned:0,counts:{inbox:null,unread:null,drafts:null},items:[]};
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved?.format==="eloah-mail-agent-v1"&&Array.isArray(saved.items))state={...state,...saved}}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));render();return true}catch(err){alert("Impossible de sauvegarder sur ce navigateur. Pense à exporter les données.");return false}}
function safeDate(s){if(!s)return"";const d=new Date(s);return Number.isFinite(d.getTime())?d.toLocaleDateString("fr-FR"):""}
function categoryName(k){return ({reply:"Réponse",money:"Paiement",documents:"Document",security:"Sécurité",events:"Date",other:"Autre"})[k]||"Autre"}
function itemStatus(v){return ["À faire","À vérifier","En attente","Terminé","Ignoré"].includes(v)?v:"À vérifier"}
function itemPriority(v){return ["P1","P2","P3"].includes(v)?v:"P3"}
function isOpen(item){return !["Terminé","Ignoré"].includes(item.status)}
function sorter(a,b){const priority={P1:0,P2:1,P3:2};return (priority[a.priority]??3)-(priority[b.priority]??3)||String(a.deadline||"9999").localeCompare(String(b.deadline||"9999"))||String(b.date||"").localeCompare(String(a.date||""))}
function cleanUrl(s){try{const u=new URL(String(s||""));return u.protocol==="https:"&&u.hostname==="mail.google.com"?u.href:""}catch{return""}}
function renderCounts(){
 const count=state.items.filter(isOpen);
 const metrics=[
 ["Courriels en boîte",state.counts.inbox==null?"—":Number(state.counts.inbox).toLocaleString("fr-FR")],
 ["Non lus",state.counts.unread==null?"—":Number(state.counts.unread).toLocaleString("fr-FR")],
 ["Actions à suivre",count.length],
 ["Priorités P1",count.filter(x=>x.priority==="P1").length]
 ];
 $("metrics").innerHTML=metrics.map(x=>'<article class="metric"><label>'+x[0]+'</label><strong>'+x[1]+'</strong></article>').join("");
 const time=state.generated_at?safeDate(state.generated_at):"aucune date";$("syncStatus").textContent=state.items.length?state.items.length+" entrées importées · "+Number(state.scanned||0)+" messages examinés dans le rapport · "+time:"Aucun rapport importé. Clique sur « Importer un rapport privé ».";
}
function matchingItems(){
 let items=state.items.filter(x=>view==="overview"?isOpen(x):view==="priority"?isOpen(x)&&x.priority==="P1":view==="all"||view==="settings"?true:x.category===view);
 const q=$("search").value.toLocaleLowerCase(),status=$("statusFilter").value,priority=$("priorityFilter").value;
 return items.filter(x=>!q||[x.subject,x.summary,x.action,x.from,x.note].join(" ").toLocaleLowerCase().includes(q)).filter(x=>!status||x.status===status).filter(x=>!priority||x.priority===priority).sort(sorter);
}
function renderItem(item){
 const status=itemStatus(item.status),priority=itemPriority(item.priority),url=cleanUrl(item.link),steps=Array.isArray(item.steps)?item.steps:[];
 return '<article class="mailcard"><div class="mailtop"><div><div class="mini"><span class="pill '+priority.toLowerCase()+'">'+priority+'</span><span class="pill">'+esc(categoryName(item.category))+'</span><span class="pill '+(status==="Terminé"?"done":"")+'">'+esc(status)+'</span></div><h3>'+esc(item.subject||"Sans objet")+'</h3><span class="small">'+esc(item.sender_name||"Courriel")+" · "+esc(safeDate(item.date)||"Date à relever")+(item.has_attachment?" · Pièce jointe":"")+'</span></div></div><p>'+esc(item.summary||"Aucun résumé.")+'</p><div class="recordnote"><strong>À faire :</strong> '+esc(item.action||"Examiner la demande.")+(item.deadline?'<div>Échéance indiquée : '+esc(safeDate(item.deadline)||item.deadline)+'</div>':"")+'</div>'+(steps.length?'<ul class="tasks">'+steps.slice(0,6).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':"")+(item.note?'<p class="small"><strong>Mon suivi :</strong> '+esc(item.note)+'</p>':"")+'<div class="actions"><button data-edit="'+esc(item.id)+'">Suivre / modifier</button>'+(url?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Lire dans Gmail ↗</a>':'<a href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noopener noreferrer">Ouvrir Gmail ↗</a>')+'</div></article>'
}
function renderContent(){
 const items=matchingItems(),head='<div class="freshness"><strong>Couverture du rapport :</strong> '+Number(state.scanned||0)+' messages examinés · Données figées '+(state.generated_at?safeDate(state.generated_at):"—")+'. Le site ne lit pas Gmail automatiquement. Les compteurs et les actions peuvent avoir changé depuis l’analyse.</div>';
 if(view==="settings"){
 $("content").innerHTML='<section class="panel"><h3>Comment alimenter ton centre de commande</h3><p>1. Dans ChatGPT, utilise l’agent avec Gmail connecté. 2. Fais générer un fichier JSON « eloah-mail-agent-v1 ». 3. Importe le fichier depuis cette page. Les données restent uniquement sur ton appareil.</p><p>Le tableau de bord <strong>n’a pas d’accès direct à Gmail</strong>. Il ne peut pas envoyer de mails, supprimer des messages ni effectuer des paiements.</p><button id="importSettings">Importer un fichier JSON</button><button id="clearLocal">Effacer les dossiers locaux</button><p class="small">La suppression concerne uniquement ce navigateur, pas Gmail.</p></section>';
 $("importSettings").onclick=()=> $("upload").click();$("clearLocal").onclick=()=>{if(confirm("Supprimer uniquement les données importées dans ce navigateur ?")){state={format:"eloah-mail-agent-v1",generated_at:null,scanned:0,counts:{inbox:null,unread:null,drafts:null},items:[]};save()}};return
 }
 $("content").innerHTML=head+(items.length?items.map(renderItem).join(""):'<div class="empty"><h3>Aucun dossier à afficher</h3><p>Importe ton rapport Gmail privé, ou change de filtre.</p><button id="emptyImport">Importer un rapport</button></div>');
 const ei=$("emptyImport");if(ei)ei.onclick=()=> $("upload").click();
}
function render(){
 $("nav").querySelectorAll("button").forEach(b=>{b.classList.toggle("active",b.dataset.view===view)});
 $("viewTitle").textContent=views[view][0];$("viewDescription").textContent=views[view][1];$("viewType").textContent=view==="overview"?"TABLEAU DE BORD":"DOSSIERS · "+view.toUpperCase();
 renderCounts();renderContent()
}
function openItem(id){const x=state.items.find(x=>x.id===id);if(!x)return;editing=id;$("itemHeading").textContent=x.subject||"Sans objet";const f=$("editForm");f.elements.status.value=itemStatus(x.status);f.elements.priority.value=itemPriority(x.priority);f.elements.note.value=x.note||"";$("editModal").showModal()}
function output(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="eloah-agent-courrier-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),900)
}
function importData(file){
 if(file.size>10*1024*1024){alert("Fichier trop volumineux (maximum 10 Mo).");return}
 file.text().then(t=>{const data=JSON.parse(t);if(data.format!=="eloah-mail-agent-v1"||!Array.isArray(data.items)||data.items.length>10000)throw Error("Format incompatible.");
 const seen=new Set();for(const x of data.items){if(!x||typeof x.id!=="string"||x.id.length>150||typeof x.subject!=="string"||seen.has(x.id))throw Error("Une entrée n’est pas valide.");seen.add(x.id)}
 if(!confirm("Importer "+data.items.length+" entrées ? Les notes et statuts locaux déjà modifiés seront préservés."))return;
 const edits=new Map(state.items.map(x=>[x.id,{status:x.status,priority:x.priority,note:x.note}]));
 const next=data.items.map(x=>{const local=edits.get(x.id);return {...x,category:categories.includes(x.category)?x.category:"other",status:local?.status||itemStatus(x.status),priority:local?.priority||itemPriority(x.priority),note:local?.note||x.note||"",link:cleanUrl(x.link)}});
 const previous=state.items.filter(x=>!seen.has(x.id));state={format:"eloah-mail-agent-v1",generated_at:data.generated_at||new Date().toISOString(),scanned:Number(data.scanned)||data.items.length,counts:{inbox:Number.isFinite(Number(data.counts?.inbox))?Number(data.counts.inbox):null,unread:Number.isFinite(Number(data.counts?.unread))?Number(data.counts.unread):null,drafts:Number.isFinite(Number(data.counts?.drafts))?Number(data.counts.drafts):null},items:next.concat(previous)};save()
 }).catch(err=>alert("Import impossible : "+err.message))
}
const prompts={
 today:"Analyse ma boîte Gmail connectée, classe les messages qui nécessitent une décision et donne-moi un plan de travail concret par priorité P1/P2/P3. Distingue urgences confirmées, alertes à vérifier et simple information. Aucun envoi, paiement, suppression, archivage ou label sans validation.",
 unread:"Inspecte mes messages Gmail non lus par lots raisonnables, reprends les fils complets utiles, identifie ce qui reste à faire et traite les doublons. Dis combien de messages ont réellement été parcourus, et lesquels n’ont pas été analysés. Ne modifie rien dans Gmail.",
 reply:"Dans mes emails Gmail connectés, identifie les messages auxquels je dois répondre. Prépare les projets de réponses séparés, en français naturel, avec questions en suspens. Ne crée et n’envoie aucun mail sans validation.",
 admin:"Analyse mes messages Gmail liés aux formalités, factures et échéances. Vérifie dates, statuts, montants et doublons. Les liens de paiement et les alertes de sécurité doivent être vérifiés directement dans les comptes officiels. Aucun paiement ni changement de compte.",
 import:"Analyse Gmail connecté et prépare un fichier JSON téléchargeable compatible avec le panneau ELOAH Agent Courrier. Format {format:'eloah-mail-agent-v1',generated_at: ISO,scanned: nombre exact de messages effectivement examinés,counts:{inbox,unread,drafts},items:[{id:message_id,subject,sender_name,date,category:'reply'|'money'|'documents'|'security'|'events'|'other',priority:'P1'|'P2'|'P3',status:'À faire'|'À vérifier'|'En attente'|'Terminé',summary,action,deadline: ISO facultatif,steps:tableau de phrases,has_attachment:bool,link:URL Gmail officielle, note:''}]} sans recopier les corps complets des mails ni codes secrets. Fournis le fichier en téléchargement dans ChatGPT, jamais sur GitHub. Dédoublonne, prends en compte les messages déjà traités, indique le nombre réellement lu et ne réalise aucune action externe."
};
function launch(mode){const q='SONIA OS · ELOAH / AGENT COURRIER. Mandat A1 uniquement.\n'+(prompts[mode]||prompts.import)+'\nTu as accès au connecteur Gmail dans ChatGPT si connecté. Travaille directement sur les messages réels et signale les limites de couverture. Aucun contenu personnel dans des URLs externes.';window.open("https://chatgpt.com/?q="+encodeURIComponent(q),"_blank","noopener,noreferrer")}
$("nav").onclick=e=>{const b=e.target.closest("[data-view]");if(b){view=b.dataset.view;render()}};
$("content").onclick=e=>{const b=e.target.closest("[data-edit]");if(b)openItem(b.dataset.edit)};
$("editForm").onsubmit=e=>{e.preventDefault();const x=state.items.find(x=>x.id===editing);if(!x)return;const data=Object.fromEntries(new FormData(e.target));x.status=data.status;x.priority=data.priority;x.note=data.note;$("editModal").close();save()};
$("cancel").onclick=()=> $("editModal").close();
$("search").oninput=render;$("statusFilter").onchange=render;$("priorityFilter").onchange=render;
$("uploadButton").onclick=()=> $("upload").click();
$("upload").onchange=e=>{const f=e.target.files?.[0];if(f)importData(f);e.target.value=""};
$("exportButton").onclick=output;
$("launchAgent").onclick=()=>launch("import");
document.querySelectorAll("[data-agent]").forEach(b=>b.onclick=()=>launch(b.dataset.agent));
$("openInstructions").onclick=()=>{view="settings";render()};
render();
})();