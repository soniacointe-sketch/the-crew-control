(()=>{
"use strict";
const B=()=>window.EloahMailBridge,$=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=s=>{s=String(s||"").slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s.slice(8)+"/"+s.slice(5,7)+"/"+s.slice(0,4):"Date non renseignée"};
const open=c=>!["Terminé","Ignoré"].includes(c.status),priority=c=>c.priority==="P1"?0:c.priority==="P2"?1:2;
const statuses=["À faire","À vérifier","En attente","Terminé","Ignoré"],domains=["École","Administratif","Factures","The Crew","Power & Glam","Sécurité","Personnel","Autre"];
let cases=[],links=[],loaded=false,loading=false,filter="open",error="";
const linked=c=>links.filter(x=>x.case_id===c.id);

const todayISO=()=>{const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());return ["year","month","day"].map(k=>p.find(v=>v.type===k).value).join("-")};
const dateOnly=x=>{x=String(x||"");return /^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+"T12:00:00Z"))&&new Date(x+"T12:00:00Z").toISOString().slice(0,10)===x?x:""};
const flags=(c,today=todayISO())=>({waiting:open(c)&&c.status==="En attente",follow:open(c)&&!!dateOnly(c.follow_up_on)&&c.follow_up_on<=today,overdue:open(c)&&!!dateOnly(c.due_on)&&c.due_on<today,today:open(c)&&c.due_on===today,incomplete:open(c)&&(!String(c.next_action||"").trim()||c.status==="En attente"&&!String(c.waiting_for||"").trim()||!!c.due_on&&!String(c.due_source||"").trim())});
const matches=(c,mode,today)=>mode==="all"||mode==="open"&&open(c)||mode==="school"&&c.domain==="École"||mode==="closed"&&!open(c)||mode==="waiting"&&flags(c,today).waiting||mode==="follow"&&flags(c,today).follow||mode==="overdue"&&flags(c,today).overdue||mode==="incomplete"&&flags(c,today).incomplete;
function compare(a,b,today){const rank=c=>{const f=flags(c,today);return f.overdue?0:f.follow?1:f.today?2:c.priority==="P1"?3:f.incomplete?4:f.waiting?5:6};return rank(a)-rank(b)||priority(a)-priority(b)||String(a.follow_up_on||a.due_on||"9999").localeCompare(String(b.follow_up_on||b.due_on||"9999"))||String(a.title).localeCompare(String(b.title),"fr")}
function card(c){const f=flags(c),mail=linked(c).find(m=>/^[a-f0-9]{10,30}$/i.test(m.gmail_id));return '<article class="mailcard v3-case"><div class="mini"><span class="pill '+esc(String(c.priority).toLowerCase())+'">'+esc(c.priority)+'</span><span class="pill">'+esc(c.domain)+'</span><span class="pill">'+esc(c.status)+'</span>'+(f.overdue?'<span class="pill p1">Date limite dépassée</span>':'')+(f.follow?'<span class="pill p2">Suivi à reprendre</span>':'')+(f.incomplete?'<span class="pill p2">À préciser</span>':'')+'</div><h3>'+esc(c.title)+'</h3><p><strong>Prochaine action :</strong> '+esc(c.next_action||"À préciser dans ce dossier")+'</p>'+(c.status==="En attente"?'<p><strong>Réponse attendue :</strong> '+esc(c.waiting_for||"À préciser")+'</p>':'')+'<p class="small">'+(c.due_on?'Date limite : '+fmt(c.due_on)+' · '+esc(c.due_source||"source à préciser"):"Aucune date limite confirmée")+'</p><p class="small">'+(c.follow_up_on?'Date de suivi choisie : '+fmt(c.follow_up_on):"Aucune date de suivi choisie")+' · '+linked(c).length+' message(s) relié(s)</p><div class="actions"><button data-case-open="'+esc(c.id)+'">Ouvrir / modifier</button>'+(mail?'<a class="outline" href="https://mail.google.com/mail/u/0/#all/'+esc(mail.gmail_id)+'" target="_blank" rel="noopener noreferrer">Mail source ↗</a>':'')+'</div></article>'}
let search="";
function render(){
 const b=B();if(!b||!["bureau","cases"].includes(b.getView()))return;
 if(!loaded){$("content").innerHTML='<div class="empty">'+esc(error||"Chargement des dossiers privés…")+(error?'<div class="actions"><button id="v3TryAgain">Réessayer la connexion</button></div>':'')+'</div>';if(error){const retry=$("v3TryAgain");if(retry)retry.onclick=()=>{error="";load(true)}}else if(!loading)load();return}
 const today=todayISO(),active=cases.filter(open),view=b.getView(),q=search.toLocaleLowerCase("fr"),list=cases.filter(c=>(view==="bureau"?open(c):matches(c,filter,today))&&(!q||[c.title,c.domain,c.next_action,c.waiting_for].some(v=>String(v||"").toLocaleLowerCase("fr").includes(q)))).sort((a,b)=>compare(a,b,today)),shown=view==="bureau"?list.slice(0,12):list;
 const tabs=[["open","Ouverts"],["follow","À relancer"],["waiting","En attente"],["overdue","Dates dépassées"],["incomplete","À préciser"],["school","École"],["closed","Clôturés"],["all","Tous"]];
 $("content").innerHTML='<div class="freshness"><strong>Ton suivi privé.</strong> Les relances sont des dates de suivi que tu choisis. Elles ne prouvent ni un envoi ni une réponse reçue ; aucun message ni rappel n’est envoyé automatiquement.'+(cases.length===300?' Liste limitée aux 300 derniers dossiers.':'')+(links.length===1000?' Les liens de courriels affichés sont limités à 1 000.':'')+'</div>'+
 (error?'<p class="freshness" role="alert">'+esc(error)+' Les dernières données chargées restent affichées.</p>':'')+
 '<div class="v3-stats"><div><strong>'+active.length+'</strong><span>Dossiers ouverts</span></div><div><strong>'+active.filter(c=>flags(c,today).waiting).length+'</strong><span>En attente</span></div><div><strong>'+active.filter(c=>flags(c,today).follow).length+'</strong><span>Suivis à reprendre</span></div><div><strong>'+active.filter(c=>flags(c,today).overdue).length+'</strong><span>Dates limites dépassées</span></div></div>'+
 '<div class="actions"><button class="primary" id="v3New">Nouveau dossier</button><button id="v3Reload">Actualiser le suivi ↻</button><button id="v3Export">Exporter en CSV</button></div>'+
 '<div class="v3-tabs" aria-label="Afficher les dossiers">'+tabs.map(([key,label])=>'<button data-v3-filter="'+key+'" aria-pressed="'+(view==="cases"&&filter===key)+'">'+label+'</button>').join("")+'</div>'+
 '<form id="v3Search" class="actions" role="search"><input class="field" name="query" maxlength="200" aria-label="Rechercher dans les dossiers" placeholder="Dossier, prochaine action, réponse attendue…" value="'+esc(search)+'"><button type="submit">Rechercher</button>'+(search?'<button type="button" id="v3ClearSearch">Effacer</button>':'')+'</form>'+
 '<h3>'+(view==="bureau"?"À reprendre":"Mes dossiers")+' <span class="small">· '+list.length+' résultat(s)</span></h3>'+shown.map(card).join("")+(!shown.length?'<div class="empty">'+(cases.length?'Aucun dossier ne correspond à cette vue.':'Aucun dossier enregistré. Commence par « Nouveau dossier ».')+'</div>':'')+
 (view==="bureau"&&list.length>shown.length?'<button data-v3-filter="open">Voir tous les dossiers ouverts →</button>':'')+
 (view==="bureau"?'<div class="panel"><h3>Préparation du travail</h3><div class="actions"><button data-v3-nav="compose">Rédiger un courrier</button><button data-v3-nav="notes">Prendre des notes</button><button data-v3-nav="triage">Tri intelligent</button><button data-v3-nav="spreadsheet">Tableur de suivi</button></div></div>':'');
 document.querySelectorAll("[data-case-open]").forEach(x=>x.onclick=()=>edit(x.dataset.caseOpen));
 document.querySelectorAll("[data-v3-filter]").forEach(x=>x.onclick=()=>{filter=x.dataset.v3Filter;if(b.getView()!=="cases")b.setView("cases");else render()});
 document.querySelectorAll("[data-v3-nav]").forEach(x=>x.onclick=()=>B().setView(x.dataset.v3Nav));
 $("v3Search").onsubmit=event=>{event.preventDefault();search=String(new FormData(event.currentTarget).get("query")||"").trim().slice(0,200);render()};
 if($("v3ClearSearch"))$("v3ClearSearch").onclick=()=>{search="";render()};
 $("v3New").onclick=()=>edit("");$("v3Reload").onclick=()=>load(true);$("v3Export").onclick=exportCSV;
}
async function load(force=false){
 if(loading||loaded&&!force)return;
 loading=true;error="";
 try{
  const [a,b]=await Promise.all([
   B().privateFetch("eloah_mail_cases?select=id,title,domain,priority,status,due_on,due_source,follow_up_on,waiting_for,next_action,details,updated_at&order=updated_at.desc&limit=300"),
   B().privateFetch("eloah_mail_case_messages?select=case_id,gmail_id&limit=1000")
  ]);
  if(!Array.isArray(a)||!Array.isArray(b))throw Error("Réponse invalide");
  cases=a;links=b;loaded=true;
 }catch(ex){error="Actualisation impossible : "+ex.message}
 finally{loading=false;render()}
}
function options(current,values){return values.map(v=>'<option '+(v===current?'selected':'')+'>'+esc(v)+'</option>').join("")}
function edit(id){
 const c=cases.find(x=>x.id===id)||{title:"",domain:"Autre",priority:"P2",status:"À faire",due_on:"",due_source:"",follow_up_on:"",waiting_for:"",next_action:"",details:""};
 $("v3Dialog")?.remove();const d=document.createElement("dialog");d.id="v3Dialog";d.className="v3-dialog";
 d.innerHTML='<form id="v3Form"><div class="eyebrow">DOSSIER ELOAH PRIVÉ</div><h2>'+esc(id?"Suivre mon dossier":"Nouveau dossier")+'</h2>'+
 '<label>Nom du dossier<input class="field" name="title" required maxlength="180" value="'+esc(c.title)+'"></label>'+
 '<div class="v3-formgrid"><label>Domaine<select class="field" name="domain">'+options(c.domain,domains)+'</select></label><label>Priorité<select class="field" name="priority">'+options(c.priority,["P1","P2","P3"])+'</select></label></div>'+
 '<label>État<select class="field" name="status">'+options(c.status,statuses)+'</select></label>'+
 '<label>Date limite confirmée<input type="date" class="field" name="due_on" value="'+esc(String(c.due_on||"").slice(0,10))+'"></label>'+
 '<label>Source de cette date<input class="field" name="due_source" maxlength="350" value="'+esc(c.due_source||"")+'" placeholder="Courriel daté, ou saisie manuelle"></label>'+
 '<fieldset class="v3-follow-fields"><legend>Suivre la réponse</legend><label>Réponse ou interlocuteur attendu<input class="field" name="waiting_for" maxlength="500" value="'+esc(c.waiting_for||"")+'" placeholder="Ex. Une confirmation du service concerné"></label><label>Date de suivi choisie (facultative)<input class="field" name="follow_up_on" type="date" value="'+esc(dateOnly(c.follow_up_on))+'"></label><p class="small">Cette date sert à retrouver le dossier dans « À relancer ». Elle ne remplace pas sa date limite et ne programme aucun envoi.</p></fieldset>'+
 '<label>Prochaine action<textarea class="field" name="next_action" maxlength="3000" rows="3">'+esc(c.next_action||"")+'</textarea></label>'+
 '<label>Notes privées<textarea class="field" name="details" maxlength="10000" rows="4">'+esc(c.details||"")+'</textarea></label>'+
 (id?'<section class="v3-related"><h3>Mails liés</h3>'+linked(c).map(m=>{const x=B().getItems().find(z=>z.id===m.gmail_id);return '<div class="v3-line"><span>'+esc(x?.subject||"Courriel lié")+'</span><button type="button" data-v3-reply="'+esc(m.gmail_id)+'">Préparer réponse</button><button type="button" data-v3-openmail="'+esc(m.gmail_id)+'">Gmail ↗</button></div>'}).join("")+
 '<label>Associer un courriel déjà qualifié<select id="v3MailSelect" class="field"><option value="">Choisir…</option>'+B().getItems().filter(m=>m.source_kind==="gmail_read"&&!linked(c).some(l=>l.gmail_id===m.id)).slice(0,110).map(m=>'<option value="'+esc(m.id)+'">'+esc(m.subject).slice(0,140)+'</option>').join("")+'</select></label><button type="button" id="v3Link">Relier le mail</button><h3>Historique des actions</h3><div id="v3History" class="small">Chargement de l’historique privé…</div></section>':'')+
 '<div class="dialogbuttons"><button type="button" id="v3Cancel">Annuler</button><button type="submit" class="primary">Enregistrer</button></div></form>';
 document.body.appendChild(d);d.showModal();d.querySelector("#v3Cancel").onclick=()=>{if(d.dataset.saving!=="yes")d.close()};d.addEventListener("cancel",event=>{if(d.dataset.saving==="yes")event.preventDefault()});d.onclose=()=>d.remove();
 d.querySelector("#v3Form").onsubmit=async event=>{

  event.preventDefault();if(d.dataset.saving==="yes")return;
  const v=Object.fromEntries(new FormData(event.currentTarget)),due=dateOnly(v.due_on),follow=dateOnly(v.follow_up_on);
  if(!String(v.title||"").trim()){alert("Donne un nom au dossier.");return}
  if(!statuses.includes(v.status)||!domains.includes(v.domain)||!["P1","P2","P3"].includes(v.priority)){alert("État, domaine ou priorité invalide.");return}
  if(v.due_on&&!due||v.follow_up_on&&!follow){alert("Vérifie les dates renseignées.");return}
  if(due&&!String(v.due_source||"").trim()){alert("Indique la source de la date limite, ou « saisie manuelle ».");return}
  if(open(v)&&!String(v.next_action||"").trim()){alert("Précise la prochaine action avant d’enregistrer ce dossier ouvert.");return}
  if(v.status==="En attente"&&!String(v.waiting_for||"").trim()){alert("Précise la réponse ou l’interlocuteur attendu.");return}
  const data={title:String(v.title).trim().slice(0,180),domain:v.domain,priority:v.priority,status:v.status,due_on:due||null,due_source:due?String(v.due_source).trim().slice(0,350):null,follow_up_on:follow||null,waiting_for:String(v.waiting_for||"").trim().slice(0,500)||null,next_action:String(v.next_action||"").trim().slice(0,3000),details:String(v.details||"").slice(0,10000),updated_at:new Date().toISOString()};
  d.dataset.saving="yes";const submit=d.querySelector('[type="submit"]');submit.disabled=true;
  try{
   const resource=id?"eloah_mail_cases?id=eq."+encodeURIComponent(id)+(c.updated_at?"&updated_at=eq."+encodeURIComponent(c.updated_at):""):"eloah_mail_cases";
   const saved=await B().privateFetch(resource,{method:id?"PATCH":"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(data)});
   if(!Array.isArray(saved)||saved.length!==1)throw Error("Le dossier a changé ailleurs ou son accès a expiré. Actualise le suivi avant de réessayer ; tes champs restent ouverts.");
   d.dataset.saving="no";d.close();await load(true);
  }catch(ex){alert("Impossible d’enregistrer : "+ex.message)}
  finally{d.dataset.saving="no";if(submit.isConnected)submit.disabled=false}

 };
 if(id){
  d.querySelectorAll("[data-v3-reply]").forEach(b=>b.onclick=()=>{d.close();window.EloahMailWorkbench?.selectMail(b.dataset.v3Reply)});
  B().privateFetch("eloah_mail_case_history?select=description,created_at&case_id=eq."+encodeURIComponent(id)+"&order=created_at.desc&limit=40").then(rows=>{const el=$("v3History");if(el)el.innerHTML=(rows||[]).map(x=>'<p>'+esc(fmt(x.created_at)+" · "+x.description)+'</p>').join("")||"Aucun changement enregistré."}).catch(()=>{const el=$("v3History");if(el)el.textContent="Historique indisponible";});
  d.querySelectorAll("[data-v3-openmail]").forEach(b=>b.onclick=()=>{if(/^[a-f0-9]{10,30}$/i.test(b.dataset.v3Openmail))window.open("https://mail.google.com/mail/u/0/#all/"+b.dataset.v3Openmail,"_blank","noopener,noreferrer")});
  d.querySelector("#v3Link").onclick=async()=>{
   const mail=d.querySelector("#v3MailSelect").value;if(!mail)return;
   try{await B().privateFetch("eloah_mail_case_messages",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify({case_id:id,gmail_id:mail})});d.close();await load(true);edit(id)}catch(ex){alert(ex.message)}
  };
 }
}
function exportCSV(){
 const enc=x=>'"'+(/^[=+\-@\t\r]/.test(String(x||""))?"'":"")+String(x??"").replace(/[\r\n]+/g," ").replace(/"/g,'""')+'"';
 const lines=[["Dossier","Domaine","Priorité","Statut","Date limite","Source de la date limite","Date de suivi choisie","Réponse attendue","Prochaine action","Mails liés"].map(enc).join(";")];
 for(const c of cases)lines.push([c.title,c.domain,c.priority,c.status,c.due_on||"",c.due_source||"",c.follow_up_on||"",c.waiting_for||"",c.next_action,linked(c).length].map(enc).join(";"));
 const u=URL.createObjectURL(new Blob(["\ufeffsep=;\r\n"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");a.href=u;a.download="eloah-dossiers-courrier.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
window.EloahMailV3={render,load,openCase:edit};
if(["bureau","cases"].includes(B()?.getView()))render();
})();