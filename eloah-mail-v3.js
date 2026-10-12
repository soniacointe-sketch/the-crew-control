(()=>{
"use strict";
const B=()=>window.EloahMailBridge,$=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=s=>{s=String(s||"").slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s.slice(8)+"/"+s.slice(5,7)+"/"+s.slice(0,4):"Date non renseignée"};
const open=c=>!["Terminé","Ignoré"].includes(c.status),priority=c=>c.priority==="P1"?0:c.priority==="P2"?1:2;
const statuses=["À faire","À vérifier","En attente","Terminé","Ignoré"],domains=["École","Administratif","Factures","The Crew","Power & Glam","Sécurité","Personnel","Autre"];
let cases=[],links=[],loaded=false,loading=false,filter="open",error="";
const linked=c=>links.filter(x=>x.case_id===c.id);
function card(c){return '<article class="mailcard v3-case"><div class="mini"><span class="pill '+c.priority.toLowerCase()+'">'+esc(c.priority)+'</span><span class="pill">'+esc(c.domain)+'</span><span class="pill">'+esc(c.status)+'</span></div><h3>'+esc(c.title)+'</h3><p><strong>À faire :</strong> '+esc(c.next_action||"À définir")+'</p><p class="small">'+(c.due_on?"Échéance : "+fmt(c.due_on)+" · "+esc(c.due_source||"source non précisée"):"Pas de date vérifiée")+' · '+linked(c).length+' message(s) relié(s)</p><div class="actions"><button data-case-open="'+esc(c.id)+'">Ouvrir / modifier</button></div></article>'}
function render(){
 const b=B();if(!b||!["bureau","cases"].includes(b.getView()))return;
 if(!loaded){$("content").innerHTML='<div class="empty">'+esc(error||"Chargement des dossiers privés…")+(error?'<div class="actions"><button id="v3TryAgain">Réessayer la connexion</button></div>':'')+'</div>';if(error){const retry=$("v3TryAgain");if(retry)retry.onclick=()=>{error="";load(true)}}else if(!loading)load();return}
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const active=cases.filter(open),urg=active.filter(x=>x.priority==="P1"),due=active.filter(x=>x.due_on).sort((a,b)=>String(a.due_on).localeCompare(String(b.due_on)));
 const view=b.getView(),shown=view==="bureau"?urg:cases.filter(c=>filter==="all"||filter==="open"&&open(c)||filter==="school"&&c.domain==="École"||filter==="closed"&&!open(c));
 const dates=due.filter(x=>x.due_on<=today),upcoming=due.filter(x=>x.due_on>today);
 $("content").innerHTML='<div class="freshness"><strong>V3 · Dossiers privés :</strong> tu gardes la décision finale. Seuls les messages déjà lus sont regroupés ; les dates manquantes ne sont pas inventées. Gmail n’est pas modifié.</div>'+
 '<div class="v3-stats"><div><strong>'+active.length+'</strong><span>Dossiers ouverts</span></div><div><strong>'+urg.length+'</strong><span>Priorités P1</span></div><div><strong>'+dates.length+'</strong><span>Échéances arrivées</span></div><div><strong>'+cases.length+'</strong><span>Dossiers suivis</span></div></div>'+
 '<div class="actions"><button class="primary" id="v3New">Nouveau dossier</button><button id="v3Reload">Actualiser le coffre ↻</button><button id="v3Export">Exporter en CSV</button></div>'+
 (view==="bureau"?'<section class="panel"><h3>Urgences et dates</h3>'+dates.map(card).join("")+(upcoming.length?'<h3>Prochaines échéances</h3>'+upcoming.slice(0,5).map(card).join(""):'')+(!due.length?'<p class="small">Aucune date enregistrée.</p>':'')+'</section><h3>Priorités à décider</h3>':'<div class="v3-tabs"><button data-v3-filter="open">Ouverts</button><button data-v3-filter="school">École</button><button data-v3-filter="closed">Terminés</button><button data-v3-filter="all">Tous</button></div>')+
 shown.sort((a,b)=>priority(a)-priority(b)||String(a.due_on||"9999").localeCompare(String(b.due_on||"9999"))).map(card).join("")+
 (!shown.length?'<div class="empty">Aucun dossier pour ce filtre.</div>':'')+
 (view==="bureau"?'<div class="panel"><h3>Préparation du travail</h3><div class="actions"><button data-v3-nav="compose">Rédiger un courrier</button><button data-v3-nav="notes">Prendre des notes</button><button data-v3-nav="triage">Tri intelligent</button><button data-v3-nav="spreadsheet">Tableur de suivi</button></div></div>':'');
 document.querySelectorAll("[data-case-open]").forEach(x=>x.onclick=()=>edit(x.dataset.caseOpen));
 document.querySelectorAll("[data-v3-filter]").forEach(x=>x.onclick=()=>{filter=x.dataset.v3Filter;render()});
 document.querySelectorAll("[data-v3-nav]").forEach(x=>x.onclick=()=>B().setView(x.dataset.v3Nav));
 $("v3New").onclick=()=>edit("");$("v3Reload").onclick=()=>load(true);$("v3Export").onclick=exportCSV;
}
async function load(force=false){
 if(loading||loaded&&!force)return;
 loading=true;error="";
 try{
  const [a,b]=await Promise.all([
   B().privateFetch("eloah_mail_cases?select=id,title,domain,priority,status,due_on,due_source,next_action,details,updated_at&order=updated_at.desc&limit=300"),
   B().privateFetch("eloah_mail_case_messages?select=case_id,gmail_id&limit=1000")
  ]);
  if(!Array.isArray(a)||!Array.isArray(b))throw Error("Réponse invalide");
  cases=a;links=b;loaded=true;
 }catch(ex){error="Connexion privée nécessaire : "+ex.message;loaded=false}
 finally{loading=false;render()}
}
function options(current,values){return values.map(v=>'<option '+(v===current?'selected':'')+'>'+esc(v)+'</option>').join("")}
function edit(id){
 const c=cases.find(x=>x.id===id)||{title:"",domain:"Autre",priority:"P2",status:"À faire",due_on:"",due_source:"",next_action:"",details:""};
 $("v3Dialog")?.remove();const d=document.createElement("dialog");d.id="v3Dialog";d.className="v3-dialog";
 d.innerHTML='<form id="v3Form"><div class="eyebrow">DOSSIER ELOAH PRIVÉ</div><h2>'+esc(id?"Suivre mon dossier":"Nouveau dossier")+'</h2>'+
 '<label>Nom du dossier<input class="field" name="title" required maxlength="180" value="'+esc(c.title)+'"></label>'+
 '<div class="v3-formgrid"><label>Domaine<select class="field" name="domain">'+options(c.domain,domains)+'</select></label><label>Priorité<select class="field" name="priority">'+options(c.priority,["P1","P2","P3"])+'</select></label></div>'+
 '<label>État<select class="field" name="status">'+options(c.status,statuses)+'</select></label>'+
 '<label>Date limite confirmée<input type="date" class="field" name="due_on" value="'+esc(String(c.due_on||"").slice(0,10))+'"></label>'+
 '<label>Source de cette date<input class="field" name="due_source" maxlength="350" value="'+esc(c.due_source||"")+'" placeholder="Courriel daté, ou saisie manuelle"></label>'+
 '<label>Prochaine action<textarea class="field" name="next_action" rows="3">'+esc(c.next_action||"")+'</textarea></label>'+
 '<label>Notes privées<textarea class="field" name="details" rows="4">'+esc(c.details||"")+'</textarea></label>'+
 (id?'<section class="v3-related"><h3>Mails liés</h3>'+linked(c).map(m=>{const x=B().getItems().find(z=>z.id===m.gmail_id);return '<div class="v3-line"><span>'+esc(x?.subject||"Courriel lié")+'</span><button type="button" data-v3-openmail="'+esc(m.gmail_id)+'">Gmail ↗</button></div>'}).join("")+
 '<label>Associer un courriel déjà qualifié<select id="v3MailSelect" class="field"><option value="">Choisir…</option>'+B().getItems().filter(m=>m.source_kind==="gmail_read"&&!linked(c).some(l=>l.gmail_id===m.id)).slice(0,110).map(m=>'<option value="'+esc(m.id)+'">'+esc(m.subject).slice(0,140)+'</option>').join("")+'</select></label><button type="button" id="v3Link">Relier le mail</button></section>':'')+
 '<div class="dialogbuttons"><button type="button" id="v3Cancel">Annuler</button><button type="submit" class="primary">Enregistrer</button></div></form>';
 document.body.appendChild(d);d.showModal();d.querySelector("#v3Cancel").onclick=()=>d.close();d.onclose=()=>d.remove();
 d.querySelector("#v3Form").onsubmit=async event=>{
  event.preventDefault();const v=Object.fromEntries(new FormData(event.currentTarget));
  if(v.due_on&&!String(v.due_source||"").trim()){alert("Pour enregistrer une échéance, indique sa source ou « saisie manuelle ».");return}
  const data={title:String(v.title).trim(),domain:v.domain,priority:v.priority,status:v.status,due_on:v.due_on||null,due_source:v.due_on?v.due_source:null,next_action:String(v.next_action||"").slice(0,3000),details:String(v.details||"").slice(0,10000),updated_at:new Date().toISOString()};
  try{
   if(id)await B().privateFetch("eloah_mail_cases?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify(data)});
   else await B().privateFetch("eloah_mail_cases",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify(data)});
   d.close();await load(true);
  }catch(ex){alert("Impossible d’enregistrer : "+ex.message)}
 };
 if(id){
  d.querySelectorAll("[data-v3-openmail]").forEach(b=>b.onclick=()=>{if(/^[a-f0-9]{10,30}$/i.test(b.dataset.v3Openmail))window.open("https://mail.google.com/mail/u/0/#all/"+b.dataset.v3Openmail,"_blank","noopener,noreferrer")});
  d.querySelector("#v3Link").onclick=async()=>{
   const mail=d.querySelector("#v3MailSelect").value;if(!mail)return;
   try{await B().privateFetch("eloah_mail_case_messages",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify({case_id:id,gmail_id:mail})});d.close();await load(true);edit(id)}catch(ex){alert(ex.message)}
  };
 }
}
function exportCSV(){
 const enc=x=>'"'+(/^[=+\-@\t\r]/.test(String(x||""))?"'":"")+String(x??"").replace(/[\r\n]+/g," ").replace(/"/g,'""')+'"';
 const lines=[["Dossier","Domaine","Priorité","Statut","Échéance","Source","Prochaine action","Mails liés"].map(enc).join(";")];
 for(const c of cases)lines.push([c.title,c.domain,c.priority,c.status,c.due_on||"",c.due_source||"",c.next_action,linked(c).length].map(enc).join(";"));
 const u=URL.createObjectURL(new Blob(["\ufeffsep=;\r\n"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");a.href=u;a.download="eloah-dossiers-courrier.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
window.EloahMailV3={render,load,openCase:edit};
if(["bureau","cases"].includes(B()?.getView()))render();
})();