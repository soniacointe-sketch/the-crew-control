(()=>{
"use strict";
const B=()=>window.EloahMailBridge;
const $=id=>document.getElementById(id);
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const open=x=>!["Terminé","Ignoré"].includes(x.status);
const iso=d=>String(d||"").slice(0,10);
const fr=d=>{if(!d)return"Date non définie";const p=iso(d).split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:String(d)};
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const types=["École","Administratif","Factures","The Crew","Power & Glam","Sécurité","Personnel","Autre"];
let selected="",draftId="",docKind="reponse",docs=[],docLoaded=false,docLoading=false;
let docTitle="",docContent="",noteLink="";
function itemById(id){return B()?.getItems().find(x=>x.id===id)}
function dates(){const items=B()?.getItems()||[];return items.filter(x=>open(x)&&x.deadline&&/^\d{4}-\d{2}-\d{2}$/.test(iso(x.deadline))).sort((a,b)=>iso(a.deadline).localeCompare(iso(b.deadline))||((a.priority==="P1")?-1:1))}
function tag(x){return '<span class="pill '+(x.priority==="P1"?"p1":"")+'">'+e(x.priority)+'</span><span class="pill">'+e(x.status)+'</span>'}
function mini(x){
 const verified=x.source_kind==="gmail_read"||x.source_kind==="manual_review";
 const link=x.link?.startsWith("https://mail.google.com/")?x.link:"https://mail.google.com/mail/u/0/#all/"+encodeURIComponent(x.id);
 return '<article class="mailcard compact-mail"><div class="mailtop"><div><div class="mini">'+tag(x)+'<span class="pill">'+e(x.domain||"Autre")+'</span><span class="pill">'+(verified?"Lu / qualifié":"En-tête uniquement")+'</span></div><h3>'+e(x.subject||"Sans objet")+'</h3><span class="small">'+e(x.sender_name||"")+' · '+fr(x.date)+'</span></div></div><p>'+e(x.action||x.summary||"À qualifier avant décision")+'</p>'+(x.deadline?'<div class="deadline-source"><strong>Échéance : '+fr(x.deadline)+'</strong> · '+e(x.due_confirmed?"Date documentée ou saisie manuellement":"Date à confirmer")+(x.due_source?'<p class="small">'+e(x.due_source)+'</p>':"")+'</div>':"")+'<div class="actions"><button type="button" data-work-edit="'+e(x.id)+'">Suivre / dater</button><button type="button" data-work-write="'+e(x.id)+'">Préparer réponse</button><a href="'+e(link)+'" target="_blank" rel="noopener noreferrer">Gmail ↗</a></div></article>';
}
function renderSchool(){
 const a=(B()?.getItems()||[]).filter(x=>x.domain==="École");
 const active=a.filter(x=>open(x)),analyzed=active.filter(x=>x.status!=="À trier");
 const future=analyzed.filter(x=>x.deadline).sort((a,b)=>iso(a.deadline).localeCompare(iso(b.deadline)));
 $("content").innerHTML='<div class="freshness"><strong>École & enfants :</strong> '+a.length+' courriel(s) classé(s), dont '+analyzed.length+' action(s) à suivre. Les courriels seulement indexés ne sont pas des urgences confirmées.</div>'+
 '<section class="panel"><h3>Prochaines échéances scolaires</h3>'+(future.length?future.map(x=>'<div class="urgent-row"><strong>'+fr(x.deadline)+'</strong> · '+e(x.subject)+' <button data-work-edit="'+e(x.id)+'">Ouvrir</button></div>').join(""):'<p class="small">Aucune échéance scolaire renseignée.</p>')+'</section>'+
 '<h3>Actions scolaires qualifiées</h3>'+(analyzed.length?analyzed.slice(0,70).map(mini).join(""):'<div class="empty">Aucune action scolaire confirmée dans le rapport.</div>')+
 '<details class="panel"><summary>'+a.filter(x=>x.status==="À trier").length+' messages scolaires à examiner (en-têtes)</summary>'+a.filter(x=>x.status==="À trier").slice(0,50).map(mini).join("")+'</details>';
 bindCommon();
}
function renderDeadlines(){
 const a=dates(),now=today(),week=new Date(now+"T12:00:00");week.setDate(week.getDate()+7);const end=week.toISOString().slice(0,10);
 const p1=(B()?.getItems()||[]).filter(x=>open(x)&&x.status!=="À trier"&&x.priority==="P1"&&!x.deadline);
 const overdue=a.filter(x=>iso(x.deadline)<now),soon=a.filter(x=>iso(x.deadline)>=now&&iso(x.deadline)<=end),later=a.filter(x=>iso(x.deadline)>end);
 const block=(title,list)=>'<section class="panel"><div class="panel-header"><h3>'+title+'</h3><span class="pill">'+list.length+'</span></div>'+(list.length?list.map(mini).join(""):'<p class="small">Aucune échéance dans cette catégorie.</p>')+'</section>';
 $("content").innerHTML='<div class="freshness"><strong>Dates :</strong> seules les échéances figurant dans les fiches sont affichées. Une alerte « P1 sans date » n’a pas de date inventée.</div><div class="actions"><button id="workIcs">Exporter mes échéances (.ics)</button><button id="workCsvUrgent">Tableur des urgences (.csv)</button></div>'+
 block('En retard ou aujourd’hui',overdue.concat(soon.filter(x=>iso(x.deadline)===now)))+
 block('Dans les 7 prochains jours',soon.filter(x=>iso(x.deadline)!==now))+
 block('Urgences sans date confirmée',p1)+block('À venir ensuite',later);
 $("workIcs").onclick=exportIcs;$("workCsvUrgent").onclick=()=>exportCSV(a.concat(p1));bindCommon();
}
function csv(s){const v=String(s??"").replace(/\r?\n/g," ");const protect=/^[=+\-@\t\r]/.test(v)?"'"+v:v;return '"'+protect.replace(/"/g,'""')+'"'}
function exportCSV(rows=(B()?.getItems()||[])){
 const cols=["Dossier","Priorité","État","Objet","Échéance","Justification de la date","Action","Expéditeur","Lien Gmail","Niveau de lecture"];
 const content="\uFEFFsep=;\r\n"+cols.map(csv).join(";")+"\r\n"+rows.map(x=>[x.domain,x.priority,x.status,x.subject,iso(x.deadline),x.due_source,x.action,x.sender_name,x.link,x.source_kind==="gmail_read"?"Examiné":"À trier"].map(csv).join(";")).join("\r\n");
 download("eloah-courrier-suivi-"+today()+".csv",content,"text/csv;charset=utf-8")
}
function download(name,content,mime){const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function exportIcs(){
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//ELOAH//AGENT COURRIER//FR"];
 for(const x of dates()){const d=iso(x.deadline).replace(/-/g,"");lines.push("BEGIN:VEVENT","UID:eloah-"+x.id+"@local","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z"),"DTSTART;VALUE=DATE:"+d,"SUMMARY:"+icsText("Courrier · "+x.subject),"DESCRIPTION:"+icsText("À faire : "+(x.action||"Vérifier le dossier")+" | Échéance à revérifier avant tout engagement"),"END:VEVENT")}
 lines.push("END:VCALENDAR");download("eloah-courrier-echeances.ics",lines.join("\r\n"),"text/calendar;charset=utf-8")
}
function icsText(t){return String(t||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/[,;]/g,m=>"\\"+m)}
function renderSpreadsheet(){
 const all=(B()?.getItems()||[]).filter(x=>x.status!=="À trier").sort(B().sorter);
 $("content").innerHTML='<div class="freshness"><strong>Tableur vivant :</strong> '+all.length+' dossiers qualifiés. Les données proviennent de ton coffre privé. CSV compatible Excel et LibreOffice, sans exécuter de formules reçues par mail.</div><div class="actions"><button id="workExportCSV">Exporter le tableur CSV</button><button id="workExportAllCSV">Exporter aussi les dossiers à trier</button></div><div class="table-scroll"><table class="work-table"><thead><tr><th>Priorité</th><th>Domaine</th><th>Objet</th><th>Date limite</th><th>État</th><th>Action</th></tr></thead><tbody>'+all.map(x=>'<tr><td>'+e(x.priority)+'</td><td>'+e(x.domain||"Autre")+'</td><td><button data-work-edit="'+e(x.id)+'">'+e(x.subject)+'</button></td><td>'+e(x.deadline?fr(x.deadline):"À définir")+'</td><td>'+e(x.status)+'</td><td>'+e(x.action||"À qualifier")+'</td></tr>').join("")+'</tbody></table></div>';
 $("workExportCSV").onclick=()=>exportCSV(all);$("workExportAllCSV").onclick=()=>exportCSV();bindCommon();
}
function getUser(){
 return B().getToken().then(token=>{
 const payload=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
 const user=JSON.parse(atob(payload));if(!user.sub)throw Error("Session invalide");return user.sub;
 });
}
async function loadDocs(force=false){
 if(docLoading||docLoaded&&!force)return;
 docLoading=true;try{docs=await B().privateFetch("eloah_mail_workproducts?select=id,gmail_id,kind,title,content,status,created_at,updated_at&order=updated_at.desc&limit=300");docLoaded=true}catch(err){docs=[];docLoaded=false;throw err}finally{docLoading=false}
}
function template(x,kind){
 const subj=x?.subject||"votre demande",date=x?.date?fr(x.date):"";
 const opening=kind==="courrier"?"Objet : "+subj+"\n\nMadame, Monsieur,\n\n":"Bonjour,\n\n";
 return opening+"Je reviens vers vous au sujet de "+subj+(date?" (message du "+date+")":"")+".\n\n[Indique ici ta demande ou ta réponse exacte, après vérification des pièces et des faits.]\n\n"+(kind==="courrier"?"Je vous remercie de bien vouloir m'indiquer les suites données à ce dossier.\n\n":"Merci pour votre retour.\n\n")+"Cordialement,\nSonia";
}
function mailOptions(){const a=(B()?.getItems()||[]).filter(x=>x.status!=="À trier").slice(0,120);return '<option value="">Sans mail associé</option>'+a.map(x=>'<option value="'+e(x.id)+'" '+(x.id===selected?'selected':'')+'>'+e((x.domain||"Autre")+" · "+x.subject)+'</option>').join("")}
function renderCompose(){
 $("content").innerHTML='<section class="panel"><div class="eyebrow">ATELIER DE RÉDACTION</div><h3>Réponses et courriers prêts à personnaliser</h3><p class="small">Ces modèles sont des brouillons neutres : ils ne répondent pas à ta place et ne valent pas confirmation des faits. Un envoi Gmail nécessite une validation séparée.</p>'+
 '<div class="work-fields"><label>Mail source<select id="workMail" class="field">'+mailOptions()+'</select></label><label>Type de document<select id="workKind" class="field"><option value="reponse">Réponse email</option><option value="courrier">Courrier administratif</option></select></label><label>Titre<input id="workTitle" class="field" maxlength="180" placeholder="Objet du courrier"></label><label>Texte à relire<textarea id="workText" class="field" rows="17" placeholder="Ton brouillon éditable…"></textarea></label></div>'+
 '<div class="actions"><button id="workTemplate">Créer un modèle</button><button id="workSaveDoc" class="primary">Enregistrer en privé</button><button id="workCopy">Copier le texte</button><button id="workTextDownload">Exporter .txt</button><button id="workWord">Exporter Word (.rtf)</button><button id="workChat">Reformuler dans ChatGPT ↗</button></div></section>'+
 '<section class="panel"><h3>Mes brouillons</h3><div id="workDraftList">'+(docLoaded?listDocs("compose"):'<p class="small">Chargement privé…</p>')+'</div></section>';
 $("workMail").onchange=v=>{selected=v.target.value;draftId=""};
 $("workKind").onchange=v=>{docKind=v.target.value};
 $("workTemplate").onclick=()=>{
  if($("workText").value.trim()&&!confirm("Remplacer le texte en cours par un modèle neutre ?"))return;
  const x=itemById($("workMail").value);$("workTitle").value=x?"Réponse — "+x.subject:"Courrier à compléter";$("workText").value=template(x,$("workKind").value);draftId="";
 };
 $("workSaveDoc").onclick=()=>saveDoc(false);
 $("workCopy").onclick=()=>copyText($("workText").value);
 $("workTextDownload").onclick=()=>download("courrier-eloah-"+today()+".txt",$("workText").value,"text/plain;charset=utf-8");
 $("workWord").onclick=()=>{const encode=t=>String(t).replace(/\\/g,"\\\\").replace(/[{}]/g,c=>"\\"+c).replace(/\r?\n/g,"\\par\n").replace(/[^\x00-\x7F]/g,c=>"\\u"+(c.charCodeAt(0)>32767?c.charCodeAt(0)-65536:c.charCodeAt(0))+"?");download("courrier-eloah-"+today()+".rtf","{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Calibri;}}\\f0\\fs24 "+encode($("workText").value)+"}", "application/rtf")};
 $("workChat").onclick=()=>{copyText($("workText").value).then(()=>window.open("https://chatgpt.com/","_blank","noopener,noreferrer"));alert("Texte copié. Colle-le dans ChatGPT pour demander une reformulation ; aucun courrier n’est envoyé automatiquement.")};
 bindDocList();
 if(!docLoaded)loadDocs().then(()=>{if(B().getView()==="compose"&&$("workDraftList")){$("workDraftList").innerHTML=listDocs("compose");bindDocList()}}).catch(err=>{const target=$("workDraftList");if(target)target.textContent="Connexion privée nécessaire : "+err.message});
}
function listDocs(mode){
 const subset=docs.filter(d=>mode==="compose"?d.kind!=="note":d.kind==="note");
 return subset.length?subset.map(d=>'<article class="mailcard"><div class="mailtop"><h3>'+e(d.title)+'</h3><span class="pill">'+e(d.kind)+'</span></div><p class="small">'+e(d.status)+' · Dernière modification '+fr(d.updated_at)+'</p><div class="actions"><button data-doc-open="'+e(d.id)+'">Ouvrir</button></div></article>').join(""):'<p class="small">Aucun brouillon privé.</p>';
}
function bindDocList(){document.querySelectorAll("[data-doc-open]").forEach(b=>b.onclick=()=>openDoc(b.dataset.docOpen))}
function openDoc(id){
 const d=docs.find(x=>x.id===id);if(!d)return;draftId=d.id;docKind=d.kind;selected=d.gmail_id||"";
 if(d.kind==="note"){B().setView("notes");const title=$("workNoteTitle"),txt=$("workNoteText"),ref=$("workNoteMail");if(title)title.value=d.title;if(txt)txt.value=d.content;if(ref)ref.value=selected}
 else {B().setView("compose");$("workKind").value=d.kind;$("workMail").value=selected;$("workTitle").value=d.title;$("workText").value=d.content}
}
async function saveDoc(isNote){
 const title=isNote?$("workNoteTitle").value.trim():$("workTitle").value.trim(),content=isNote?$("workNoteText").value:$("workText").value;
 const gmail_id=isNote?$("workNoteMail").value:$("workMail").value,kind=isNote?"note":$("workKind").value;
 if(!title||!content.trim()){alert("Renseigne un titre et un texte.");return}
 try{
  const payload={kind,title,content,gmail_id:gmail_id||null,status:"Brouillon",updated_at:new Date().toISOString()};
  if(draftId)await B().privateFetch("eloah_mail_workproducts?id=eq."+encodeURIComponent(draftId),{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify(payload)});
  else{
   payload.owner_id=await getUser();
   await B().privateFetch("eloah_mail_workproducts",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify(payload)});
  }
  draftId="";await loadDocs(true);
  if(isNote)renderNotes();else renderCompose();
  alert("Document enregistré dans le coffre privé. Il n'a pas été envoyé.")
 }catch(err){alert("Enregistrement impossible : "+err.message)}
}
function renderNotes(){
 $("content").innerHTML='<section class="panel"><div class="eyebrow">CARNET DE SUIVI PRIVÉ</div><h3>Mes notes administratives</h3><p class="small">Écris ton suivi, une liste de pièces ou une note de rendez-vous. Les notes restent dans ton espace privé authentifié.</p><div class="work-fields">'+
 '<label>Associer à un mail<select id="workNoteMail" class="field">'+mailOptions()+'</select></label>'+
 '<label>Titre<input id="workNoteTitle" class="field" maxlength="180" placeholder="Ex. Pièces à préparer"></label>'+
 '<label>Note<textarea id="workNoteText" class="field" rows="9"></textarea></label></div>'+
 '<div class="actions"><button class="primary" id="workSaveNote">Enregistrer la note</button><button id="workNewNote">Nouvelle note</button></div></section>'+
 '<section class="panel"><h3>Notes enregistrées</h3><div id="workNotesList">'+(docLoaded?listDocs("notes"):'<p class="small">Chargement…</p>')+'</div></section>';
 $("workSaveNote").onclick=()=>saveDoc(true);
 $("workNewNote").onclick=()=>{draftId="";$("workNoteTitle").value="";$("workNoteText").value="";$("workNoteMail").value=""};
 bindDocList();
 if(!docLoaded)loadDocs().then(()=>{if(B().getView()==="notes"&&$("workNotesList")){$("workNotesList").innerHTML=listDocs("notes");bindDocList()}}).catch(err=>{const t=$("workNotesList");if(t)t.textContent="Connexion privée nécessaire : "+err.message});
}
async function copyText(value){try{await navigator.clipboard.writeText(value)}catch(err){alert("Copie indisponible, sélectionne et copie le texte manuellement.")}}
function bindCommon(){
 document.querySelectorAll("[data-work-edit]").forEach(b=>b.onclick=()=>B().openItem(b.dataset.workEdit));
 document.querySelectorAll("[data-work-write]").forEach(b=>b.onclick=()=>selectMail(b.dataset.workWrite));
}
function selectMail(id){selected=id;draftId="";docKind="reponse";B().setView("compose");const x=itemById(id);
 if($("workMail"))$("workMail").value=id;
 if($("workTitle"))$("workTitle").value=x?"Réponse — "+x.subject:"";
 if($("workText"))$("workText").value=x?template(x,"reponse"):"";
}
window.EloahMailWorkbench={render(view){
 if(view==="school")renderSchool();else if(view==="deadlines")renderDeadlines();else if(view==="spreadsheet")renderSpreadsheet();else if(view==="compose")renderCompose();else if(view==="notes")renderNotes();
},selectMail};
})();