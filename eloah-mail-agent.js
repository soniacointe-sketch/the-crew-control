(()=>{
"use strict";
const KEY="eloah-gmail-command-v1",$=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const views={overview:["Vue générale","Les sujets importants et les prochaines décisions."],priority:["Priorités","Commence par les actions qui demandent une vérification rapide."],reply:["Réponses à préparer","Les messages auxquels répondre ou revenir."],money:["Factures & paiements","Contrôler les échéances depuis les espaces officiels, sans payer depuis cet outil."],documents:["Documents & formalités","Pièces à rassembler, dossiers à classer et suivis administratifs."],security:["Comptes & sécurité","Identifier les alertes et vérifier directement dans les applications concernées."],events:["Rendez-vous & dates","Les dates présentes dans les messages, sans création automatique d'événement."],all:["Tous les dossiers","L'ensemble des entrées du rapport importé."],settings:["Import & sécurité","Confidentialité, sauvegarde et limites de l'analyse."]};
const categories=["reply","money","documents","security","events","other"];
let view="overview", editing=null,maxVisible=80;const cloudIds=new Set();
let state={format:"eloah-mail-agent-v1",generated_at:null,scanned:0,counts:{inbox:null,unread:null,drafts:null},items:[]};
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved?.format==="eloah-mail-agent-v1"&&Array.isArray(saved.items))state={...state,...saved}}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify({...state,items:state.items.filter(x=>!cloudIds.has(x.id)||x.source_kind==="imported_report")}));render();return true}catch(err){alert("Impossible de sauvegarder sur ce navigateur. Pense à exporter les données.");return false}}
function safeDate(s){if(!s)return"";const d=new Date(s);return Number.isFinite(d.getTime())?d.toLocaleDateString("fr-FR"):""}
function categoryName(k){return ({reply:"Réponse",money:"Paiement",documents:"Document",security:"Sécurité",events:"Date",other:"Autre"})[k]||"Autre"}
function itemStatus(v){return ["À trier","À faire","À vérifier","En attente","Terminé","Ignoré"].includes(v)?v:"À vérifier"}
function itemPriority(v){return ["P1","P2","P3"].includes(v)?v:"P3"}
function isOpen(item){return !["Terminé","Ignoré","À trier"].includes(item.status)}
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
 $("content").innerHTML=head+(items.length?items.slice(0,maxVisible).map(renderItem).join("")+(items.length>maxVisible?'<div class="more-holder"><button id="moreRecords">Voir les 80 suivants — '+items.length+' résultats</button></div>':""):'<div class="empty"><h3>Aucun dossier à afficher</h3><p>Importe ton rapport Gmail privé, ou change de filtre.</p><button id="emptyImport">Importer un rapport</button></div>');
 const ei=$("emptyImport");if(ei)ei.onclick=()=> $("upload").click();const more=$("moreRecords");if(more)more.onclick=()=>{maxVisible+=80;renderContent()};
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
 const next=data.items.map(x=>{const local=edits.get(x.id);return {...x,source_kind:"imported_report",category:categories.includes(x.category)?x.category:"other",status:local?.status&&local.status!=="À trier"?local.status:itemStatus(x.status),priority:local?.status&&local.status!=="À trier"?local.priority:itemPriority(x.priority),note:local?.note||x.note||"",link:cleanUrl(x.link)}});
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
$("nav").onclick=e=>{const b=e.target.closest("[data-view]");if(b){view=b.dataset.view;maxVisible=80;render()}};
$("content").onclick=e=>{const b=e.target.closest("[data-edit]");if(b)openItem(b.dataset.edit)};
$("editForm").onsubmit=async e=>{e.preventDefault();const x=state.items.find(x=>x.id===editing);if(!x)return;const data=Object.fromEntries(new FormData(e.target));const old={status:x.status,priority:x.priority,note:x.note};x.status=data.status;x.priority=data.priority;x.note=data.note;if(cloudIds.has(x.id)){try{await saveCloudItem(x)}catch(err){Object.assign(x,old);alert("Suivi distant non enregistré : "+err.message);return}}$("editModal").close();save()};
$("cancel").onclick=()=> $("editModal").close();
$("search").oninput=()=>{maxVisible=80;render()};$("statusFilter").onchange=render;$("priorityFilter").onchange=render;
$("uploadButton").onclick=()=> $("upload").click();
$("upload").onchange=e=>{const f=e.target.files?.[0];if(f)importData(f);e.target.value=""};
$("exportButton").onclick=output;
$("launchAgent").onclick=()=>launch("import");
document.querySelectorAll("[data-agent]").forEach(b=>b.onclick=()=>launch(b.dataset.agent));
$("openInstructions").onclick=()=>{view="settings";render()};
render();

const SUPABASE_URL="https://voytsqyorhoveurnguxn.supabase.co";const SUPABASE_KEY="sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy";const AUTH_STORAGE="sb-voytsqyorhoveurnguxn-auth-token";
let tokenCache=null;let cloudLoading=false;
async function bearer(){
 let saved;try{saved=JSON.parse(localStorage.getItem(AUTH_STORAGE)||"null")}catch{}
 if(!saved?.access_token)throw Error("Session Supabase absente. Connecte-toi depuis The Crew Control, puis reviens ici.");
 if(saved.expires_at&&saved.expires_at<Date.now()/1000+60){
  if(!saved.refresh_token)throw Error("Session expirée. Reconnecte-toi.");
  const rr=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:saved.refresh_token})});
  if(!rr.ok)throw Error("Session expirée. Reconnecte-toi.");
  const fresh=await rr.json();saved={...saved,...fresh};localStorage.setItem(AUTH_STORAGE,JSON.stringify(saved));
 }
 tokenCache=saved.access_token;return tokenCache;
}
async function remoteFetch(resource,options={}){
 const access=await bearer();
 const headers={"apikey":SUPABASE_KEY,"Authorization":"Bearer "+access,"Content-Type":"application/json",...(options.headers||{})};
 const r=await fetch(SUPABASE_URL+"/rest/v1/"+resource,{...options,headers});
 if(!r.ok)throw Error("Accès privé impossible (HTTP "+r.status+"). Vérifie la session et les autorisations.");
 return r.status===204?null:r.json();
}
async function saveCloudItem(x){
 return remoteFetch("eloah_mail_items?gmail_id=eq."+encodeURIComponent(x.id),{method:"PATCH",body:JSON.stringify({status:x.status,priority:x.priority,note:String(x.note||"").slice(0,3000),source_kind:"manual_review",reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}),headers:{"Prefer":"return=minimal"}});
}
function cloudState(heading,description,success){
 $("cloudTitle").textContent=heading;$("cloudText").textContent=description;$("cloudBanner").dataset.ready=success?"yes":"no";
}
async function refreshCloud(){
 if(cloudLoading)return;cloudLoading=true;
 const btn=$("refreshCloud");btn.disabled=true;btn.textContent="Chargement du coffre…";
 cloudState("Connexion au coffre ELOAH…","Accès en lecture à la base sécurisée Supabase.",false);
 try{
  const rows=[];for(let offset=0;offset<10000;offset+=500){
   const data=await remoteFetch("eloah_mail_items?select=gmail_id,thread_id,received_at,sender,subject,snippet,gmail_url,labels,has_attachment,category,priority,status,action,due_on,steps,source_kind,reviewed_at,note&order=received_at.desc&limit=500&offset="+offset);
   if(!Array.isArray(data))throw Error("Réponse de la base invalide.");
   rows.push(...data);if(data.length<500)break;
  }
  const stats=await remoteFetch("eloah_mail_status?select=inbox_total,inbox_unread,drafts_total,messages_examined,indexed_total,last_sync_at,coverage_note&limit=1");
  cloudIds.clear();const mapped=rows.map(r=>{
   cloudIds.add(r.gmail_id);
   return {id:r.gmail_id,subject:r.subject||"",sender_name:r.sender||"Courriel",date:r.received_at,category:categories.includes(r.category)?r.category:"other",priority:itemPriority(r.priority),status:itemStatus(r.status),summary:r.snippet||"",action:r.action||"À examiner à partir du message complet",deadline:r.due_on,steps:Array.isArray(r.steps)?r.steps:[],has_attachment:!!r.has_attachment,link:cleanUrl(r.gmail_url)||"https://mail.google.com/mail/u/0/#all/"+encodeURIComponent(r.gmail_id),note:r.note||"",source_kind:r.source_kind};
  });
  const imports=new Map(state.items.filter(x=>x.source_kind==="imported_report").map(x=>[x.id,x]));
  const local=state.items.filter(x=>!cloudIds.has(x.id));
  state.items=mapped.map(x=>imports.has(x.id)?{...x,...imports.get(x.id)}:x).concat(local);
  const st=Array.isArray(stats)?stats[0]:null;
  if(st){state.counts={inbox:st.inbox_total,unread:st.inbox_unread,drafts:st.drafts_total};state.scanned=st.messages_examined||0;state.generated_at=st.last_sync_at||null}
  cloudState("Coffre privé connecté · "+rows.length+" messages indexés","Synchronisation Gmail : dernier import "+(state.generated_at?safeDate(state.generated_at):"non daté")+". Les en-têtes non lus en entier restent « À trier ». "+(st?.coverage_note||""),true);
  render();
 }catch(err){cloudState("Coffre non chargé",err.message,false)}
 finally{btn.disabled=false;btn.textContent="Actualiser mes dossiers ↻";cloudLoading=false}
}

async function pushPrivateReport(){
 const report=state.items.filter(x=>x.source_kind==="imported_report");
 if(!report.length){$("upload").click();return}
 if(!confirm("Transférer "+report.length+" fiches de suivi de ce navigateur vers ton espace privé Supabase ? Cela ne modifie aucun message Gmail."))return;
 const btn=$("pushReport");btn.disabled=true;btn.textContent="Transfert en cours…";
 try{
  const token=await bearer(),u=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{"apikey":SUPABASE_KEY,"Authorization":"Bearer "+token}});
  if(!u.ok)throw Error("Identité non vérifiée : reconnecte-toi");const owner=(await u.json()).id;
  if(!owner)throw Error("Compte privé introuvable");
  const existing=await remoteFetch("eloah_mail_items?select=gmail_id,source_kind&gmail_id=in.("+report.map(x=>encodeURIComponent(x.id)).join(",")+")");
  const known=new Map(existing.map(x=>[x.gmail_id,x.source_kind]));
  for(const x of report){
   const payload={category:x.category,priority:x.priority,status:x.status,action:String(x.action||"").slice(0,3000),
    snippet:String(x.summary||"").slice(0,3000),steps:Array.isArray(x.steps)?x.steps.slice(0,15):[],
    due_on:x.deadline||null,source_kind:"gmail_read",reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()};
   if(!known.has(x.id)){
    await remoteFetch("eloah_mail_items",{method:"POST",headers:{"Prefer":"resolution=ignore-duplicates,return=minimal"},
     body:JSON.stringify({...payload,owner_id:owner,gmail_id:x.id,subject:String(x.subject||"").slice(0,1000),
     sender:String(x.sender_name||"").slice(0,300),received_at:x.date||null,gmail_url:cleanUrl(x.link)||null,has_attachment:!!x.has_attachment})});
   }else if(known.get(x.id)==="gmail_header"){
    await remoteFetch("eloah_mail_items?gmail_id=eq."+encodeURIComponent(x.id)+"&source_kind=eq.gmail_header",
     {method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify(payload)});
   }
   x.source_kind="gmail_read";
  }
  save();await refreshCloud();alert("Rapport intégré au coffre privé.");
 }catch(err){alert("Transfert interrompu : "+err.message)}
 finally{btn.disabled=false;btn.textContent="Enregistrer mon rapport dans le coffre privé"}
}
$("pushReport").onclick=pushPrivateReport;

$("refreshCloud").onclick=refreshCloud;
refreshCloud();

})();