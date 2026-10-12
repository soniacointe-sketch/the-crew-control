(()=>{
"use strict";
const B=()=>window.EloahMailBridge;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let busy=false,focus="all",queue=[],loaded=false,lastInfo="";
const isUnreviewed=x=>x.source_kind==="gmail_header"&&x.status==="À trier";
function entries(){return B()?.getItems()||[]}
function examples(){return entries().filter(x=>x.triage_state==="suggested"&&isUnreviewed(x)).sort((a,b)=>{const score=x=>x.suggested_priority==="P1"?0:x.suggested_priority==="P2"?1:2;return score(a)-score(b)||String(b.date||"").localeCompare(String(a.date||""))})}
function cloudLink(x){
 const href=x.link&&x.link.startsWith("https://mail.google.com/")?x.link:"https://mail.google.com/";
 return '<a class="outline" target="_blank" rel="noopener noreferrer" href="'+esc(href)+'">Lire dans Gmail ↗</a>'
}
function render(){
 const items=entries(),candidates=examples();
 const a=candidates.filter(x=>focus==="all"||x.suggested_priority===focus);
 const approved=items.filter(x=>x.triage_state==="accepted");
 const n=items.filter(x=>x.status!=="À trier"&&!["Terminé","Ignoré"].includes(x.status)).length;
 $("content").innerHTML='<div class="freshness"><strong>Tri assisté — privé et réversible :</strong> seules des propositions sont produites à partir des objets reçus. Elles ne valent pas lecture complète, preuve d’urgence, nouvelle échéance ou tri effectif dans Gmail. Les libellés Gmail se traitent séparément après contrôle.</div>'+
 '<section class="panel"><div class="panel-header"><div><div class="eyebrow">ANALYSE D’EN-TÊTES</div><h3>Proposer les prochains classements</h3></div><button id="triageRun" class="primary" '+(busy?'disabled':'')+'>Analyser 100 nouveaux objets ↻</button></div>'+
 '<p class="small">Cette opération fonctionne directement avec ton compte Supabase connecté, ne contacte pas Gmail et ne modifie aucun statut confirmé.</p>'+
 '<div class="triage-stats"><div><strong>'+candidates.length+'</strong><span>Propositions à examiner</span></div><div><strong>'+approved.length+'</strong><span>Classements validés</span></div><div><strong>'+n+'</strong><span>Actions ouvertes déjà qualifiées</span></div></div>'+
 (lastInfo?'<p class="small">'+esc(lastInfo)+'</p>':'')+'</section>'+
 '<section class="panel"><div class="panel-header"><h3>Propositions en attente de décision</h3><div class="actions"><button data-triage-filter="all">Toutes</button><button data-triage-filter="P1">Signal P1</button><button data-triage-filter="P2">P2</button><button data-triage-filter="P3">P3</button></div></div>'+
 (a.length?a.slice(0,60).map(x=>'<article class="mailcard"><div class="mailtop"><div><span class="pill">'+esc(x.suggested_domain||"Autre")+'</span> <span class="pill '+(x.suggested_priority==="P1"?'p1':'')+'">'+esc(x.suggested_priority||"P3")+' · à contrôler</span><h3>'+esc(x.subject)+'</h3><p class="small">Analyse de l’objet uniquement · '+esc(x.sender_name||"Expéditeur à confirmer")+'</p></div></div><div class="actions"><button data-triage-accept="'+esc(x.id)+'">Valider le dossier</button><button data-triage-reject="'+esc(x.id)+'">Écarter la proposition</button><button data-triage-queue="'+esc(x.id)+'">Préparer une action</button>'+cloudLink(x)+'</div></article>').join(""):'<div class="empty">Aucune proposition actuellement dans ce filtre. Lance une analyse, ou change de priorité.</div>')+
 (a.length>60?'<p class="small">Les 60 premières propositions sont affichées. Traite ce lot puis recharge.</p>':'')+'</section>'+
 '<section class="panel"><div class="panel-header"><h3>Décisions à approuver</h3><button id="triageQueueRefresh">Recharger la file</button></div><div id="triageQueue">'+(loaded?queueRows():'<p class="small">Chargement de la file privée…</p>')+'</div></section>';
 $("triageRun").onclick=run;
 document.querySelectorAll("[data-triage-filter]").forEach(x=>x.onclick=()=>{focus=x.dataset.triageFilter;render()});
 document.querySelectorAll("[data-triage-accept]").forEach(x=>x.onclick=()=>decide(x.dataset.triageAccept,true));
 document.querySelectorAll("[data-triage-reject]").forEach(x=>x.onclick=()=>decide(x.dataset.triageReject,false));
 document.querySelectorAll("[data-triage-queue]").forEach(x=>x.onclick=()=>addQueue(x.dataset.triageQueue));
 $("triageQueueRefresh").onclick=()=>loadQueue(true);
 if(!loaded)loadQueue();
 else bindQueue();
}
async function run(){
 if(busy)return;busy=true;render();
 try{
  const result=await B().privateFetch("rpc/eloah_mail_triage",{method:"POST",body:JSON.stringify({batch_size:100})});
  const count=Number(result?.proposals_created||0);
  lastInfo=count+" proposition(s) préparée(s). Toujours à vérifier avant validation.";
  await B().refresh();
 }catch(err){lastInfo="Tri impossible : "+err.message}
 finally{busy=false;if(B().getView()==="triage")render()}
}
async function decide(id,yes){
 const x=entries().find(y=>y.id===id);if(!x)return;
 if(yes&&!confirm("Classer cet objet dans « "+(x.suggested_domain||"Autre")+" » ? Le message restera « À trier » jusqu'à lecture et Gmail ne sera pas modifié."))return;
 try{
  const body=yes?{domain:x.suggested_domain||"Autre",triage_state:"accepted",updated_at:new Date().toISOString()}:{triage_state:"rejected",updated_at:new Date().toISOString()};
  await B().privateFetch("eloah_mail_items?gmail_id=eq."+encodeURIComponent(id)+"&triage_state=eq.suggested",{method:"PATCH",body:JSON.stringify(body),headers:{"Prefer":"return=minimal"}});
  await B().refresh();
 }catch(e){alert("Classement non enregistré : "+e.message)}
}
async function loadQueue(force=false){
 if(loaded&&!force)return;
 try{const data=await B().privateFetch("eloah_mail_approvals?select=id,gmail_id,action_kind,proposal,status,created_at,reviewed_at&order=created_at.desc&limit=100");
 queue=Array.isArray(data)?data:[];loaded=true;if(B().getView()==="triage")render()}
 catch(err){loaded=true;lastInfo="File de décisions inaccessible : "+err.message;if(B().getView()==="triage")render()}
}
function queueRows(){
 return queue.length?queue.map(q=>'<article class="mailcard"><div class="mailtop"><div><strong>'+esc(({draft_reply:"Brouillon",label:"Étiquette Gmail",calendar:"Agenda",follow_up:"Relance"})[q.action_kind]||q.action_kind)+'</strong><p class="small">'+esc(q.proposal||"Action à préciser")+'</p></div><span class="pill">'+esc(q.status)+'</span></div><div class="actions">'+(q.status==="pending"?'<button data-approval-decide="'+esc(q.id)+'" data-choice="approved">Approuver la préparation</button><button data-approval-decide="'+esc(q.id)+'" data-choice="rejected">Refuser</button>':'')+'<button data-approval-work="'+esc(q.gmail_id)+'">Dossier source</button></div></article>').join(""):'<p class="small">Aucune proposition d’action en attente.</p>';
}
function bindQueue(){
 document.querySelectorAll("[data-approval-decide]").forEach(x=>x.onclick=()=>approval(x.dataset.approvalDecide,x.dataset.choice));
 document.querySelectorAll("[data-approval-work]").forEach(x=>x.onclick=()=>B().openItem(x.dataset.approvalWork));
}
async function approval(id,choice){
 if(!confirm((choice==="approved"?"Autoriser la préparation de cette action":"Refuser cette action")+" ? Aucun mail ni événement ne sera envoyé ou créé."))return;
 try{await B().privateFetch("eloah_mail_approvals?id=eq."+encodeURIComponent(id)+"&status=eq.pending",{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({status:choice,reviewed_at:new Date().toISOString()})});loaded=false;loadQueue(true)}
 catch(err){alert("Impossible d’enregistrer la décision : "+err.message)}
}
async function addQueue(id){
 const x=entries().find(y=>y.id===id);if(!x)return;
 const type=prompt("Action à préparer : 1 = Brouillon, 2 = Étiquette Gmail, 3 = Calendrier, 4 = Relance","1");
 if(type===null)return;
 const action_kind=({"1":"draft_reply","2":"label","3":"calendar","4":"follow_up"})[type.trim()];
 if(!action_kind){alert("Choisis 1, 2, 3 ou 4.");return}
 const content=prompt("Décris la préparation souhaitée (sans données sensibles) :",x.subject||"");if(!content?.trim())return;
 try{
  const token=await B().getToken();const encoded=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
  const owner=JSON.parse(atob(encoded)).sub;if(!owner)throw Error("Compte introuvable");
  await B().privateFetch("eloah_mail_approvals?on_conflict=owner_id,gmail_id,action_kind",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({owner_id:owner,gmail_id:id,action_kind,proposal:content.trim().slice(0,1500),status:"pending",source_note:"Suggestion à valider, non exécutée"})});
  loaded=false;loadQueue(true);
 }catch(e){alert("Proposition non sauvegardée : "+e.message)}
}
window.EloahMailDecisionEngine={render};
})();