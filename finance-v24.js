/* The Crew Control · ARGENT V24 · 10 onglets */
(function(){
"use strict";
const apiURL="https://voytsqyorhoveurnguxn.supabase.co/functions/v1/crew-finance-input";
const eventURL="https://voytsqyorhoveurnguxn.supabase.co/functions/v1/crew-event-clients";
const TABS=[
["accueil","Accueil"],["parametres","Paramètres"],["recettes","Recettes"],["depenses","Dépenses"],
["cotisations","Cotisations"],["subventions","Subventions"],["budget","Budget prévisionnel"],
["dashboard","Tableau de bord"],["synthese","Synthèse annuelle"],["aide","Aide"]];
const dflt={entries:[],bank:[],budget:[],grants:[],settings:null};
let state={...dflt,payments:[],members:[],events:[],eventRegistrations:[],errors:[],active:"accueil",search:"",editing:null,loaded:false};
const rootId="crew-finance-workspace";
const E=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=x=>x===null||x===undefined||x===""||!Number.isFinite(Number(x))?"—":Number(x).toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
const qty=x=>(Number(x)||0).toLocaleString("fr-FR");
const toNum=x=>Number.isFinite(Number(x))?Number(x):0;
const norm=x=>String(x??"").trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const date=x=>x?String(x).slice(0,10):"";
const today=()=>new Date().toLocaleDateString("en-CA");
const pane=()=>document.getElementById(rootId);
const validSeason=(x)=>/^\d{4}-\d{4}$/.test(x);
const ss=()=>state.settings||{season:"2026-2027",association_name:"The Crew Orchies",opening_balance:null,opening_date:null,balance_source:"unverified",bank_label:"",evidence_reminder_days:30,note:""};
function amountInPeriod(x){
 const period=ss().season||"2026-2027";
 if(!validSeason(period))return true;
 const from=period.slice(0,4)+"-09-01",to=period.slice(5,9)+"-09-01";
 return Boolean(x)&&String(x).slice(0,10)>=from&&String(x).slice(0,10)<to;
}
async function request(payload,url=apiURL){
 const {data:{session}}=await sb.auth.getSession();
 if(!session)throw Error("Connexion requise — ouvre Espace Sonia.");
 const response=await fetch(url,{method:"POST",headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},body:JSON.stringify(payload)});
 const json=await response.json();
 if(!response.ok)throw Error(json.error||"Connexion aux finances impossible.");
 return json;
}
async function pull(){
 const settled=await Promise.allSettled([
 request({action:"list"}),
 privateDetail("payments_audit"),
 privateDetail("members"),
 request({action:"list"},eventURL)
 ]);
 const errors=[];
 if(settled[0].status==="fulfilled"){
   const x=settled[0].value;
   for(const k of ["entries","bank","budget","grants"])state[k]=x[k]||[];
   state.settings=x.settings||null;
 }else errors.push("Saisies financières : "+settled[0].reason.message);
 if(settled[1].status==="fulfilled"){const audit=settled[1].value;state.payments=Array.isArray(audit)?audit:(Array.isArray(audit?.rows)?audit.rows:[]);}
 else errors.push("HelloAsso : "+settled[1].reason.message);
 if(settled[2].status==="fulfilled")state.members=Array.isArray(settled[2].value)?settled[2].value:[];
 else errors.push("Cotisations : "+settled[2].reason.message);
 if(settled[3].status==="fulfilled"){state.events=settled[3].value.events||[];state.eventRegistrations=settled[3].value.registrations||[];}
 else errors.push("Billetterie : "+settled[3].reason.message);
 state.errors=errors;state.loaded=true;
}
function facts(){
 const done=state.payments.filter(x=>x.status==="paid"&&x.verified&&amountInPeriod(x.paid_at));
 const adhesions=done.filter(x=>x.kind==="adhesion"),ateliers=done.filter(x=>x.kind==="evenement");
 const imported=done.reduce((a,x)=>a+toNum(x.amount),0);
 const manual=state.entries.filter(x=>x.status==="recorded"&&amountInPeriod(x.entry_date));
 const manualIncome=manual.filter(x=>x.kind==="income").reduce((a,x)=>a+toNum(x.amount),0);
 const spent=manual.filter(x=>x.kind==="expense").reduce((a,x)=>a+toNum(x.amount),0);
 const income=imported+manualIncome,result=income-spent;
 const pendingIncome=state.entries.filter(x=>x.kind==="income"&&x.status!=="recorded"&&amountInPeriod(x.entry_date)).reduce((a,x)=>a+toNum(x.amount),0);
 const pendingExpense=state.entries.filter(x=>x.kind==="expense"&&x.status!=="recorded"&&amountInPeriod(x.entry_date)).reduce((a,x)=>a+toNum(x.amount),0);
 const members=state.members.filter(x=>x.season===undefined||x.season===ss().season);
 const unpaid=members.reduce((a,m)=>a+(m.amount_expected==null?0:Math.max(0,toNum(m.amount_expected)-toNum(m.amount_paid))),0);
 const missingDue=members.filter(m=>m.amount_expected==null);
 const evidence=manual.filter(x=>x.receipt_status!=="received"&&x.receipt_status!=="not_required");
 const latest=state.eventRegistrations.filter(x=>x.status==="paid"&&amountInPeriod(x.created_at));
 const ticketDeclared=latest.reduce((a,x)=>a+toNum(x.amount_paid),0);
 const ticketVerified=latest.reduce((a,x)=>a+toNum(x.verified_ticket_amount),0);
 const ticketToCheck=Math.max(0,Math.round((ticketDeclared-ticketVerified)*100)/100);
 const realIncome=[...adhesions.map(x=>({kind:"income",category:"Cotisations",amount:toNum(x.amount),day:x.paid_at})),
  ...ateliers.map(x=>({kind:"income",category:"Ateliers",amount:toNum(x.amount),day:x.paid_at})),
  ...manual.map(x=>({kind:x.kind,category:x.category,amount:toNum(x.amount),day:x.entry_date}))];
 const category=(type)=>{
 const o=new Map();
 realIncome.filter(x=>x.kind===type).forEach(x=>{const k=norm(x.category),p=o.get(k)||{category:x.category,amount:0};p.amount+=x.amount;o.set(k,p)});
 return [...o.values()].sort((a,b)=>b.amount-a.amount);
 };
 const budgets=state.budget.filter(x=>x.season===ss().season);
 const overBudget=budgets.filter(b=>b.kind==="expense"&&realIncome.filter(x=>x.kind==="expense"&&norm(x.category)===norm(b.category)).reduce((a,x)=>a+x.amount,0)>toNum(b.planned_amount));
 const opening=ss().opening_balance==null?null:Number(ss().opening_balance);
 const openOn=date(ss().opening_date);
 const afterOpening=openOn?realIncome.filter(x=>date(x.day)>=openOn):[];
 const changeSinceOpening=afterOpening.reduce((a,x)=>a+(x.kind==="income"?x.amount:-x.amount),0);
 const bankNet=state.bank.filter(x=>amountInPeriod(x.movement_date)).reduce((a,x)=>a+(x.direction==="credit"?toNum(x.amount):-toNum(x.amount)),0);
 return {done,adhesions,ateliers,imported,manualIncome,spent,income,result,unpaid,missingDue,evidence,ticketToCheck,
 pendingIncome,pendingExpense,realIncome,category,budgets,overBudget,opening,closing:opening===null||!openOn?null:opening+changeSinceOpening,bankNet};
}
const card=(label,val,note="")=>'<div class="c24-stat"><small>'+E(label)+'</small><strong>'+E(val)+'</strong>'+(note?'<em>'+E(note)+'</em>':"")+'</div>';
const wrap=(title,html,sub="")=>'<section class="c24-panel"><div class="c24-sectionhead"><div><h3>'+E(title)+'</h3>'+(sub?'<p>'+E(sub)+'</p>':"")+'</div></div>'+html+'</section>';
function table(headers,rows,empty="Aucune écriture enregistrée."){
 if(!rows.length)return '<div class="c24-empty">'+E(empty)+'</div>';
 return '<div class="c24-tablewrap"><table class="c24-table"><thead><tr>'+headers.map(x=>'<th>'+E(x)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
}
const txt=x=>E(x==null||x===""?"—":x);
const val=x=>E(money(x));
const actionButtons=(type,id)=>'<button type="button" data-edit="'+E(type)+'|'+E(id)+'" aria-label="Modifier la ligne">Modifier</button><button class="c24-danger" type="button" data-archive="'+E(type)+'|'+E(id)+'" aria-label="Archiver la ligne">Archiver</button>';
function alerts(f){
 const arr=[];
 if(f.opening===null)arr.push(["Solde initial absent","Renseigne le solde d'ouverture dans Paramètres."]);
 if(f.opening!==null&&!ss().opening_date)arr.push(["Date du solde initial absente","Indique la date réelle du relevé d'ouverture."]);
 if(f.evidence.length)arr.push([f.evidence.length+" justificatif(s) à conserver","Vérifie les factures et reçus des dépenses."]);
 const still=state.members.filter(m=>m.amount_expected!=null&&toNum(m.amount_paid)+0.001<toNum(m.amount_expected));
 if(still.length)arr.push([still.length+" cotisation(s) en attente ou partielles",money(f.unpaid)+" restant à régler selon les fiches."]);
 if(f.missingDue.length)arr.push([f.missingDue.length+" cotisation(s) sans montant défini","Complète les fiches adhérents."]);
 if(f.overBudget.length)arr.push([f.overBudget.length+" dépassement(s) de budget","Consulte Budget prévisionnel."]);
 if(f.ticketToCheck>0)arr.push(["Billetterie à rapprocher",money(f.ticketToCheck)+" déclarés payés sans répartition vérifiée complète."]);
 if(ss().balance_source!=="statement"&&f.opening!==null)arr.push(["Solde initial non attesté","Compare le solde d'ouverture avec le relevé bancaire."]);
 return arr;
}
function reportAlerts(f){
 const a=alerts(f);return a.length?a.map(x=>'<div class="c24-alert"><div><strong>'+E(x[0])+'</strong><div class="c24-mini">'+E(x[1])+'</div></div><span class="c24-tag bad">À vérifier</span></div>').join(""):'<p class="c24-muted">Aucune alerte calculée avec les données actuellement disponibles.</p>';
}
function categoryBars(list){
 const max=Math.max(1,...list.map(x=>x.amount));
 return list.length?list.slice(0,12).map(x=>'<div class="c24-baritem"><div class="c24-barline"><span>'+E(x.category)+'</span><b>'+val(x.amount)+'</b></div><div class="c24-bar"><b style="width:'+Math.min(100,100*x.amount/max)+'%"></b></div></div>').join(""):'<div class="c24-empty">Aucune opération confirmée dans cette catégorie.</div>';
}
function home(f){
 return '<div class="c24-stats">'+card("Recettes documentées",money(f.income),"HelloAsso vérifié + saisies confirmées")+
 card("Dépenses enregistrées",money(f.spent),"Hors dépenses non renseignées")+
 card("Résultat de la saison",money(f.result),"Recettes − dépenses enregistrées")+
 card("Solde final estimé",f.closing===null?"À définir":money(f.closing),"Seulement si solde initial connu")+'</div>'+
 wrap("Mes 10 rubriques",'<div class="c24-homegrid">'+TABS.map(([key,label])=>'<button class="c24-tile" data-tab="'+key+'">'+E(label)+' →<small>Ouvrir la rubrique</small></button>').join("")+'</div>')+
 '<div class="c24-two">'+wrap("Alertes financières",reportAlerts(f))+wrap("À faire maintenant",'<div class="c24-alert"><div><strong>1. Saisir le solde initial</strong><div class="c24-mini">Paramètres — d’après le relevé bancaire.</div></div><button class="c24-secondary" data-tab="parametres">Ouvrir</button></div><div class="c24-alert"><div><strong>2. Enregistrer les justificatifs</strong><div class="c24-mini">Renseigner les dépenses et leurs références.</div></div><button class="c24-secondary" data-tab="depenses">Ouvrir</button></div><div class="c24-alert"><div><strong>3. Préparer les montants prévus</strong><div class="c24-mini">Comparer le budget à la réalité.</div></div><button class="c24-secondary" data-tab="budget">Ouvrir</button></div>')+'</div>';
}
function settingsPage(f){
 const p=ss();
 const form='<form class="c24-form" id="c24-settings-form"><div class="c24-formgrid">'+
 input("association_name","Association","text",p.association_name,"required maxlength=160")+
 input("season","Saison","text",p.season,"required pattern='[0-9]{4}-[0-9]{4}'")+
 input("bank_label","Banque / compte (libellé, sans IBAN)","text",p.bank_label||"","maxlength=160")+
 input("opening_balance","Solde initial (€)","number",p.opening_balance??"","step=0.01")+
 input("opening_date","Date du solde initial","date",p.opening_date||"","")+
 select("balance_source","Origine du solde",p.balance_source||"unverified",[["unverified","Non rapproché"],["statement","Contrôlé sur relevé"]])+
 input("evidence_reminder_days","Alerte justificatifs après (jours)","number",p.evidence_reminder_days||30,"min=1 max=365 step=1")+
 textarea("note","Notes de trésorerie",p.note||"")+
 '</div><div class="c24-form-actions"><button class="c24-primary" type="submit">Enregistrer les paramètres</button></div><div class="c24-formmsg" aria-live="polite"></div></form>';
 return wrap("Paramètres de trésorerie",form,"Tout reste modifiable depuis le tableau de bord.")+
 '<div class="c24-notice">Le solde final estimé part du solde initial à la date indiquée et ajoute uniquement les écritures documentées depuis cette date. Il ne remplace pas un relevé bancaire officiel.</div>';
}
function input(name,label,type,value="",attrs=""){
 return '<label>'+E(label)+'<input name="'+E(name)+'" type="'+type+'" value="'+E(value)+'" '+attrs+'></label>';
}
function select(name,label,value,options){
 return '<label>'+E(label)+'<select name="'+E(name)+'">'+options.map(([v,l])=>'<option value="'+E(v)+'"'+(String(v)===String(value)?" selected":"")+'>'+E(l)+'</option>').join("")+'</select></label>';
}
function textarea(name,label,value=""){
 return '<label class="c24-span">'+E(label)+'<textarea name="'+E(name)+'" rows="2" maxlength="1000">'+E(value)+'</textarea></label>';
}
const methodOptions=[["transfer","Virement"],["card","Carte"],["cash","Espèces"],["check","Chèque"],["other","Autre"]];
const recOpts=[["pending","Prévu / à vérifier"],["recorded","Réellement reçu / payé"]];
const receipts=[["to_collect","À conserver"],["received","Justificatif reçu"],["not_required","Sans justificatif requis"]];
const subStatuses=[["draft","Brouillon"],["submitted","Demandée"],["awarded","Accordée"],["rejected","Refusée"],["closed","Clôturée"]];
function form(type,row,kind){
 const x=row||{},k=kind||"";
 let controls="",headline="";
 if(type==="entries"){
 headline=(row?"Modifier":"Ajouter")+" une "+(k==="expense"?"dépense":"recette");
 controls=input("entry_date","Date","date",date(x.entry_date)||today(),"required")+
 select("kind","Nature",k||x.kind||"income",[["income","Recette"],["expense","Dépense"]])+
 input("category","Catégorie","text",x.category||"","required maxlength=90 list='c24-categorylist'")+
 input("description","Désignation / objet","text",x.description||"","required maxlength=350")+
 input("counterparty","Payeur / fournisseur","text",x.counterparty||"","maxlength=160")+
 input("amount","Montant (€)","number",x.amount??"","required min=0.01 max=1000000 step=0.01")+
 select("payment_method","Moyen de paiement",x.payment_method||"transfer",methodOptions)+
 select("status","État",x.status||"pending",recOpts)+
 select("receipt_status","Justificatif",x.receipt_status||"to_collect",receipts)+
 input("evidence_ref","Réf. facture / reçu","text",x.evidence_ref||"","maxlength=100")+
 input("document_ref","Lien ou référence du document","text",x.document_ref||"","maxlength=300")+
 textarea("notes","Notes",x.notes||"")+
 '<datalist id="c24-categorylist">'+["Cotisations","Ateliers","Subventions","Matériel","Salle","Assurance","Transport","Communication","Formation","Dons","Autre"].map(x=>'<option value="'+x+'">').join("")+'</datalist>';
 }else if(type==="bank"){
 headline=(row?"Modifier":"Saisir")+" un mouvement bancaire";
 controls=input("movement_date","Date du relevé","date",date(x.movement_date)||today(),"required")+
 select("direction","Mouvement",x.direction||"credit",[["credit","Crédit"],["debit","Débit"]])+
 input("amount","Montant (€)","number",x.amount??"","required min=0.01 max=1000000 step=0.01")+
 input("description","Libellé bancaire","text",x.description||"","required maxlength=350")+
 input("bank_ref","Référence banque","text",x.bank_ref||"","maxlength=100")+
 input("related_payment_ref","Référence paiement liée","text",x.related_payment_ref||"","maxlength=100")+
 textarea("note","Notes",x.note||"");
 }else if(type==="budget"){
 headline=(row?"Modifier":"Prévoir")+" un poste budgétaire";
 controls=input("season","Saison","text",x.season||ss().season||"2026-2027","required pattern='[0-9]{4}-[0-9]{4}'")+
 select("kind","Nature",x.kind||"expense",[["income","Recette"],["expense","Dépense"]])+
 input("category","Catégorie","text",x.category||"","required maxlength=90")+
 input("planned_amount","Montant prévu (€)","number",x.planned_amount??"","required min=0 max=1000000 step=0.01")+
 textarea("note","Hypothèses",x.note||"");
 }else if(type==="grants"){
 headline=(row?"Modifier":"Ajouter")+" une subvention";
 controls=input("season","Saison","text",x.season||ss().season||"2026-2027","required pattern='[0-9]{4}-[0-9]{4}'")+
 input("funding_body","Organisme financeur","text",x.funding_body||"","required maxlength=160")+
 input("purpose","Objet du financement","text",x.purpose||"","required maxlength=350")+
 select("status","Avancement",x.status||"draft",subStatuses)+
 input("requested_amount","Montant demandé (€)","number",x.requested_amount??"","min=0 step=0.01")+
 input("awarded_amount","Montant accordé (€)","number",x.awarded_amount??"","min=0 step=0.01")+
 input("received_amount","Montant déclaré reçu (€)","number",x.received_amount??"","min=0 step=0.01")+
 input("requested_on","Date demande","date",date(x.requested_on))+
 input("decision_on","Date décision","date",date(x.decision_on))+
 input("received_on","Date versement déclaré","date",date(x.received_on))+
 input("evidence_ref","Réf. notification / dossier","text",x.evidence_ref||"","maxlength=100")+
 textarea("notes","Notes",x.notes||"");
 }else return "";
 return '<form class="c24-form" data-save="'+type+'" data-rowid="'+E(x.id||"")+'"><h3>'+E(headline)+'</h3><div class="c24-formgrid">'+controls+'</div>'+
 (type==="entries"?'<label class="c24-checkbox"><input type="checkbox" name="confirm_recorded" '+(x.status==="recorded"?"checked":"")+'> Je confirme que cette opération a réellement été réglée si elle est marquée « enregistrée ».</label>':"")+
 '<div class="c24-form-actions"><button class="c24-primary" type="submit">Enregistrer</button><button class="c24-secondary" type="button" data-cancel>Annuler</button></div>'+
 '<div class="c24-formmsg" aria-live="polite"></div></form>';
}
function renderEditable(type,kind){
 const rows=state[type].filter(x=>type==="entries"?x.kind===kind&&amountInPeriod(x.entry_date):type==="budget"||type==="grants"?x.season===ss().season:amountInPeriod(x.movement_date));
 const count='<span class="c24-tag">'+rows.length+' ligne(s)</span>';
 const head=type==="entries"?(kind==="income"?"Recettes saisies":"Dépenses saisies"):type==="bank"?"Mouvements du relevé":type==="budget"?"Prévisions budgétaires":"Suivi des demandes";
 let header,display;
 if(type==="entries"){
  header=["Date","Catégorie","Objet","Moyen","Montant","Justificatif","État","Actions"];
  display=rows.map(r=>[txt(date(r.entry_date)),txt(r.category),txt(r.description),txt(r.payment_method),val(r.amount),
   '<span class="c24-tag '+(r.receipt_status==="received"?"good":r.receipt_status==="to_collect"?"bad":"")+'">'+txt(r.receipt_status==="received"?"Reçu":r.receipt_status==="not_required"?"Sans objet":"À conserver")+'</span>',
   '<span class="c24-tag '+(r.status==="recorded"?"good":"")+'">'+txt(r.status==="recorded"?"Enregistré":"Prévu / à vérifier")+'</span>',actionButtons(type,r.id)]);
 }else if(type==="bank"){
  header=["Date","Sens","Libellé","Montant","Réf. banque","Actions"];
  display=rows.map(r=>[txt(date(r.movement_date)),txt(r.direction==="credit"?"Crédit":"Débit"),txt(r.description),val(r.amount),txt(r.bank_ref),actionButtons(type,r.id)]);
 }else if(type==="budget"){
  header=["Nature","Catégorie","Prévu","Notes","Actions"];
  display=rows.map(r=>[txt(r.kind==="income"?"Recette":"Dépense"),txt(r.category),val(r.planned_amount),txt(r.note),actionButtons(type,r.id)]);
 }else{
  header=["Organisme","Objet","Demandé","Obtenu","Déclaré reçu","État","Actions"];
  display=rows.map(r=>[txt(r.funding_body),txt(r.purpose),val(r.requested_amount),val(r.awarded_amount),val(r.received_amount),txt(({draft:"Brouillon",submitted:"Demandée",awarded:"Accordée",rejected:"Refusée",closed:"Clôturée"})[r.status]||r.status),actionButtons(type,r.id)]);
 }
 return wrap(head,'<div class="c24-actions"><button class="c24-primary" data-add="'+type+'" data-kind="'+(kind||"")+'">＋ Ajouter une ligne</button>'+
 count+'<input class="c24-search" type="search" data-filter placeholder="Rechercher dans ce tableau…" aria-label="Rechercher les écritures"></div>'+
 '<div id="c24-form-slot"></div><div class="c24-entrylist">'+table(header,display)+'</div>');
}
function incomePage(f){
 const rows=f.done.map(p=>({date:date(p.paid_at),category:p.kind==="adhesion"?"Cotisations":"Ateliers",label:p.member_name||p.payer_name||"Paiement",method:"HelloAsso",amount:p.amount,justificatif:p.external_ref,source:"Import vérifié"}));
 const manual=state.entries.filter(x=>x.kind==="income"&&amountInPeriod(x.entry_date)).map(x=>({date:date(x.entry_date),category:x.category,label:x.description,method:x.payment_method,amount:x.amount,justificatif:x.evidence_ref,source:x.status==="recorded"?"Manuel confirmé":"Manuel non confirmé"}));
 const all=[...rows,...manual].sort((a,b)=>b.date.localeCompare(a.date));
 return '<div class="c24-stats">'+card("Recettes prises en compte",money(f.income))+card("HelloAsso vérifié",money(f.imported))+card("Recettes manuelles confirmées",money(f.manualIncome))+card("Recettes manuelles en attente",money(f.pendingIncome))+'</div>'+
 renderEditable("entries","income")+
 wrap("Journal des recettes · vue globale",table(["Date","Catégorie","Désignation","Mode","Montant","Justificatif","Source"],all.map(r=>[txt(r.date),txt(r.category),txt(r.label),txt(({transfer:"Virement",card:"Carte",cash:"Espèces",check:"Chèque",other:"Autre"})[r.method]||r.method),val(r.amount),txt(r.justificatif),txt(r.source)])), "Les paiements HelloAsso vérifiés apparaissent en lecture seule ; ne les ressaisis pas.")+
 '<div class="c24-two">'+wrap("Recettes par catégorie",categoryBars(f.category("income")))+wrap("Rappel de méthode",'<div class="c24-notice">Une vente de billets répartie entre plusieurs personnes ne doit pas être additionnée une seconde fois à sa commande HelloAsso. Les subventions demandées ne sont pas des recettes encaissées.</div>')+'</div>';
}
function expensesPage(f){
 return '<div class="c24-stats">'+card("Dépenses enregistrées",money(f.spent))+card("Dépenses non confirmées",money(f.pendingExpense))+card("Justificatifs à conserver",String(f.evidence.length))+card("Catégories utilisées",String(f.category("expense").length))+'</div>'+
 renderEditable("entries","expense")+
 wrap("Dépenses par catégorie",categoryBars(f.category("expense")))+
 '<div class="c24-notice">Le tableau contient uniquement les dépenses que tu saisis. Aucune dépense n’est inventée. Pour éviter les écarts, conserve le justificatif et contrôle la sortie sur le relevé bancaire.</div>';
}
function membersPage(f){
 const rows=state.members.map(m=>{
  const exp=m.amount_expected==null?null:Number(m.amount_expected),paid=Number(m.amount_paid||0),remaining=exp===null?null:Math.max(0,exp-paid);
  const stat=exp===null?"À renseigner":remaining<=0?"Payée":paid>0?"Partielle":"En attente";
  return [txt([m.first_name,m.last_name].filter(Boolean).join(" ")),txt(m.group_code),txt(m.plan),val(exp),val(paid),val(remaining),
  '<span class="c24-tag '+(stat==="Payée"?"good":stat==="À renseigner"?"bad":"")+'">'+E(stat)+'</span>'];
 });
 return '<div class="c24-stats">'+card("Cotisations restantes",money(f.unpaid))+card("Inscrits au registre",qty(state.members.length))+card("Sans montant défini",qty(f.missingDue.length))+card("Paiements cotisation documentés",money(f.adhesions.reduce((a,x)=>a+toNum(x.amount),0)))+'</div>'+
 wrap("Registre des cotisations",table(["Adhérent","Groupe","Formule","Attendu","Payé","Reste","Situation"],rows),"Les montants viennent de la base des adhérents. Les règlements saisis dans leur fiche restent la source de référence.")+
 '<div class="c24-notice">Pour changer le montant dû, le statut d’inscription ou enregistrer un paiement d’adhérent, utilise sa fiche dans Adhérents. Ne crée pas une deuxième recette manuelle pour le même règlement.</div>'+
 '<button type="button" class="c24-primary" data-open-members>Ouvrir les fiches adhérents →</button>';
}
function grantsPage(){
 const sum=k=>state.grants.filter(x=>x.season===ss().season).reduce((a,x)=>a+toNum(x[k]),0);
 return '<div class="c24-stats">'+card("Demandes enregistrées",qty(state.grants.length))+card("Montant demandé",money(sum("requested_amount")))+card("Montant accordé",money(sum("awarded_amount")))+card("Montant déclaré reçu",money(sum("received_amount")))+'</div>'+
 renderEditable("grants")+
 '<div class="c24-notice">Une subvention obtenue n’est pas encore une recette encaissée. Lorsqu’elle est effectivement versée, saisis-la une seule fois dans Recettes, catégorie « Subventions », avec sa référence. Le montant de suivi ne s’ajoute pas automatiquement au résultat.</div>';
}
function budgetPage(f){
 const plans=state.budget.filter(x=>x.season===ss().season);
 const total=kind=>plans.filter(x=>x.kind===kind).reduce((a,x)=>a+toNum(x.planned_amount),0);
 const list=plans.map(b=>{
 const real=f.realIncome.filter(x=>x.kind===b.kind&&norm(x.category)===norm(b.category)).reduce((a,x)=>a+x.amount,0),planned=toNum(b.planned_amount);
 const delta=b.kind==="expense"?planned-real:real-planned;
 return [txt(b.kind==="income"?"Recette":"Dépense"),txt(b.category),val(planned),val(real),val(delta),
 '<span class="c24-tag '+(b.kind==="expense"&&real>planned?"bad":real<=planned?"good":"")+'">'+E(b.kind==="expense"&&real>planned?"Dépassement":"À suivre")+'</span>'];
 });
 return '<div class="c24-stats">'+card("Recettes prévues",money(total("income")))+card("Recettes réelles",money(f.income))+card("Dépenses prévues",money(total("expense")))+card("Dépenses réelles",money(f.spent))+'</div>'+
 renderEditable("budget")+
 wrap("Prévu comparé au réel",table(["Nature","Catégorie","Prévu","Réel","Écart favorable","Alerte"],list),"Comparaison à catégories identiques pour la saison 2026–2027.")+
 '<div class="c24-notice">Utilise les mêmes intitulés de catégories dans tes dépenses et ton budget pour obtenir des écarts significatifs.</div>';
}
function dashPage(f){
 const all=f.category("income"),exp=f.category("expense");
 return '<div class="c24-stats">'+card("Recettes",money(f.income))+card("Dépenses",money(f.spent))+card("Résultat",money(f.result))+card("Cotisations à recevoir",money(f.unpaid))+'</div>'+
 '<div class="c24-two">'+wrap("Répartition des recettes",categoryBars(all))+wrap("Répartition des dépenses",categoryBars(exp))+'</div>'+
 '<div class="c24-two">'+wrap("Alertes",reportAlerts(f))+wrap("Trésorerie",'<div class="c24-stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+card("Solde initial",f.opening===null?"À renseigner":money(f.opening))+card("Solde final estimé",f.closing===null?"À renseigner":money(f.closing))+'</div><p class="c24-muted">Le solde final prend en compte les écritures documentées depuis la date du solde initial. Les mouvements bancaires saisis servent uniquement au rapprochement et ne sont pas additionnés aux recettes.</p><button class="c24-secondary" data-open-bank>Voir les mouvements bancaires</button>')+'</div>';
}
function summaryPage(f){
 const season=ss().season,start=Number(season.slice(0,4))||2026;
 const months=[];
 for(let i=0;i<12;i++){
  const d=new Date(Date.UTC(start,i+8,1)),iso=d.toISOString().slice(0,7);
  const subset=f.realIncome.filter(x=>String(x.day||"").startsWith(iso));
  const inx=subset.filter(x=>x.kind==="income").reduce((a,x)=>a+x.amount,0);
  const outx=subset.filter(x=>x.kind==="expense").reduce((a,x)=>a+x.amount,0);
  months.push([E(new Intl.DateTimeFormat("fr-FR",{month:"long",year:"numeric",timeZone:"UTC"}).format(d)),val(inx),val(outx),val(inx-outx)]);
 }
 const openingInfo=f.opening===null?'À renseigner':money(f.opening);
 return '<div class="c24-stats">'+card("Solde initial",openingInfo)+card("Recettes documentées",money(f.income))+card("Résultat annuel",money(f.result))+card("Solde final estimé",f.closing===null?"Non calculable":money(f.closing))+'</div>'+
 wrap("Synthèse mensuelle · "+season,table(["Mois","Recettes comptées","Dépenses comptées","Résultat"],months))+
 '<div class="c24-two">'+wrap("Calcul annuel",'<div class="c24-alert"><span>Recettes documentées</span><strong>'+money(f.income)+'</strong></div><div class="c24-alert"><span>Dépenses enregistrées</span><strong>'+money(f.spent)+'</strong></div><div class="c24-alert"><span>Résultat annuel</span><strong>'+money(f.result)+'</strong></div><div class="c24-alert"><span>Solde initial</span><strong>'+openingInfo+'</strong></div><div class="c24-alert"><span>Solde final estimé</span><strong>'+(f.closing===null?"À définir":money(f.closing))+'</strong></div>')+
 wrap("Rapprochement bancaire",'<p>Flux nets déclarés sur relevé : <b>'+money(f.bankNet)+'</b>.</p><p class="c24-muted">La saisie bancaire est un contrôle indépendant. Elle ne valide pas automatiquement les versements HelloAsso. Le solde final reste estimatif jusqu’au rapprochement exhaustif.</p><button class="c24-secondary" data-open-bank>Voir le relevé saisi</button>')+'</div>';
}
function helpPage(){
 return wrap("Comment utiliser le registre",
 '<div class="c24-alert"><div><strong>Accueil et Paramètres</strong><p class="c24-muted">Commence par indiquer la saison, la banque et le solde d’ouverture. Le solde final sera estimé seulement après saisie du solde initial.</p></div></div>'+
 '<div class="c24-alert"><div><strong>Recettes et Dépenses</strong><p class="c24-muted">Ajoute une ligne par opération, indique le mode de paiement et renseigne la référence du justificatif. Ne ressaisis jamais un paiement HelloAsso déjà importé.</p></div></div>'+
 '<div class="c24-alert"><div><strong>Cotisations et Subventions</strong><p class="c24-muted">Les cotisations proviennent des fiches adhérents. Les demandes de subvention sont suivies séparément des sommes effectivement encaissées.</p></div></div>'+
 '<div class="c24-alert"><div><strong>Budget, tableau de bord et synthèse</strong><p class="c24-muted">Les prévisions sont comparées aux écritures enregistrées. Le résultat de la saison correspond aux recettes documentées moins les dépenses saisies et confirmées.</p></div></div>'+
 '<div class="c24-alert"><div><strong>Contrôle des justificatifs et banque</strong><p class="c24-muted">Indique « Reçu » seulement lorsque tu possèdes le justificatif. Les mouvements bancaires servent au rapprochement et ne créent aucune recette supplémentaire.</p></div></div>')+
 '<div class="c24-notice">Important : ce suivi de gestion aide à tenir la trésorerie associative, mais ne remplace pas un relevé bancaire certifié ou la validation d’un expert-comptable. Les données entrées sont privées et accessibles à l’administratrice connectée.</div>';
}
function bankPage(f){
 const bank=state.bank.filter(x=>amountInPeriod(x.movement_date));
 const plus=bank.filter(x=>x.direction==="credit").reduce((a,x)=>a+toNum(x.amount),0);
 const minus=bank.filter(x=>x.direction==="debit").reduce((a,x)=>a+toNum(x.amount),0);
 return '<div class="c24-stats">'+card("Crédits saisis",money(plus))+card("Débits saisis",money(minus))+card("Flux net bancaire saisi",money(plus-minus))+card("Solde initial",f.opening===null?"À définir":money(f.opening))+'</div>'+
 renderEditable("bank")+'<div class="c24-notice">Ce registre reproduit les lignes de relevé saisies manuellement. Les paiements HelloAsso restent dans leur propre registre et ne doivent pas être additionnés une deuxième fois.</div>';
}
function sectionFor(tab,f){
 switch(tab){
 case "accueil":return home(f);
 case "parametres":return settingsPage(f);
 case "recettes":return incomePage(f);
 case "depenses":return expensesPage(f);
 case "cotisations":return membersPage(f);
 case "subventions":return grantsPage();
 case "budget":return budgetPage(f);
 case "dashboard":return dashPage(f);
 case "synthese":return summaryPage(f);
 case "aide":return helpPage();
 case "bank":return bankPage(f);
 default:return home(f);
 }
}
function render(){
 const root=pane();if(!root)return;
 const f=facts(),tab=state.active;
 const tabName=TABS.find(x=>x[0]===tab)?.[1]||(tab==="bank"?"Mouvements bancaires":"Accueil");
 root.innerHTML='<div class="c24-top"><div><div class="c24-overline">THE CREW · GESTION ASSOCIATIVE</div><h2>Argent · '+E(tabName)+'</h2><p>Suivi financier '+E(ss().season)+' — saisie directe, contrôle des documents et calculs automatiques</p></div>'+
 '<div class="c24-form-actions"><button class="c24-secondary" data-csv type="button">↓ Export CSV</button><button data-reload type="button">↻ Actualiser</button></div></div>'+
 '<nav class="c24-nav" aria-label="Rubriques financières" role="tablist">'+TABS.map(([k,label])=>'<button type="button" role="tab" data-tab="'+k+'" aria-selected="'+String(k===tab)+'">'+E(label)+'</button>').join("")+'</nav>'+
 (state.errors.length?'<div class="c24-notice" role="alert">Certains services sont indisponibles : '+state.errors.map(E).join(" · ")+'</div>':"")+
 '<div class="c24-content">'+sectionFor(tab,f)+'</div>'+
 '<p class="c24-footer">Les écritures manuelles sont sauvegardées sur Supabase et restent modifiables ou archivables. L’import HelloAsso est conservé en lecture seule. Les soldes et alertes affichés représentent les informations actuellement présentes, non une certification bancaire.</p>';
}
async function reload(){
 const root=pane();if(root)root.innerHTML='<p class="c24-muted">Chargement sécurisé des données…</p>';
 try{await pull();render();}
 catch(e){if(root)root.innerHTML='<div class="c24-notice">'+E(e.message)+'</div>';}
}
function open(tab="accueil"){
 const drawer=document.getElementById("drawer"),body=document.getElementById("drawerBody"),title=document.getElementById("drawerTitle");
 if(!drawer||!body||!title)return;
 drawer.style.display="block";title.textContent="GESTION FINANCIÈRE";
 state.active=tab;state.search="";state.editing=null;
 body.innerHTML='<div id="'+rootId+'"><p class="c24-muted">Connexion et chargement de la gestion financière…</p></div>';
 reload();
}
async function save(form){
 const type=form.dataset.save;
 const msg=form.querySelector(".c24-formmsg"),button=form.querySelector("button[type=submit]");
 const data=Object.fromEntries(new FormData(form).entries());
 const id=form.dataset.rowid;
 if(type==="entries")data.confirm_recorded=Boolean(form.elements.confirm_recorded?.checked);
 if(id)data.id=id;
 button.disabled=true;msg.textContent="Enregistrement…";
 try{
 const res=await request({action:"save",type,...data});
 msg.textContent="Enregistré ✓"+(res.warning?" "+res.warning:"");
 await pull();state.editing=null;render();
 }catch(e){msg.textContent=e.message;}
 finally{button.disabled=false;}
}
async function saveSettings(form){
 const data=Object.fromEntries(new FormData(form).entries());
 const msg=form.querySelector(".c24-formmsg"),button=form.querySelector("button[type=submit]");
 button.disabled=true;msg.textContent="Sauvegarde…";
 try{const result=await request({action:"save_settings",...data});msg.textContent="Paramètres enregistrés ✓"+(result.warning||"");await pull();render();}
 catch(e){msg.textContent=e.message;}finally{button.disabled=false;}
}
function csv(){
 const tab=state.active,f=facts();
 let head=[],rows=[];
 if(tab==="recettes"){head=["Date","Origine","Catégorie","Libellé","Montant","État"];rows=[
 ...f.done.map(x=>[date(x.paid_at),"HelloAsso",x.kind==="adhesion"?"Cotisations":"Ateliers",x.member_name||x.payer_name||"",x.amount,"Vérifié"]),
 ...state.entries.filter(x=>x.kind==="income").map(x=>[date(x.entry_date),"Manuel",x.category,x.description,x.amount,x.status])];}
 else if(tab==="depenses"){head=["Date","Catégorie","Fournisseur","Libellé","Montant","Statut","Justificatif"];rows=state.entries.filter(x=>x.kind==="expense").map(x=>[x.entry_date,x.category,x.counterparty,x.description,x.amount,x.status,x.receipt_status]);}
 else if(tab==="cotisations"){head=["Adhérent","Groupe","Formule","Attendu","Payé","Reste"];rows=state.members.map(m=>[[m.first_name,m.last_name].filter(Boolean).join(" "),m.group_code,m.plan,m.amount_expected,m.amount_paid,m.amount_expected==null?"":Math.max(0,toNum(m.amount_expected)-toNum(m.amount_paid))]);}
 else if(tab==="subventions"){head=["Organisme","Objet","Demandé","Accordé","Déclaré reçu","Statut"];rows=state.grants.map(x=>[x.funding_body,x.purpose,x.requested_amount,x.awarded_amount,x.received_amount,x.status]);}
 else if(tab==="budget"){head=["Saison","Nature","Catégorie","Prévu"];rows=state.budget.map(x=>[x.season,x.kind,x.category,x.planned_amount]);}
 else if(tab==="bank"){head=["Date","Sens","Montant","Libellé","Référence"];rows=state.bank.map(x=>[x.movement_date,x.direction,x.amount,x.description,x.bank_ref]);}
 else{head=["Poste","Montant"];rows=[["Recettes",f.income],["Dépenses",f.spent],["Résultat",f.result],["Solde initial",f.opening],["Solde final estimé",f.closing]];}
 const content="\uFEFF"+[head,...rows].map(r=>r.map(x=>'"'+String(x??"").replace(/"/g,'""')+'"').join(";")).join("\r\n");
 const blob=new Blob([content],{type:"text/csv;charset=utf-8"});
 const href=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=href;link.download="The_Crew_"+tab+"_2026-2027.csv";link.click();
 setTimeout(()=>URL.revokeObjectURL(href),1000);
}
document.addEventListener("click",async e=>{
 const p=pane();if(!p||!p.contains(e.target))return;
 const tab=e.target.closest("[data-tab]");
 if(tab){state.active=tab.dataset.tab;state.editing=null;render();return;}
 if(e.target.closest("[data-reload]")){reload();return;}
 if(e.target.closest("[data-open-bank]")){state.active="bank";render();return;}
 if(e.target.closest("[data-open-members]")){document.querySelector('.nav [data-view="members"]')?.click();return;}
 if(e.target.closest("[data-csv]")){csv();return;}
 const add=e.target.closest("[data-add]");
 if(add){const slot=p.querySelector("#c24-form-slot");if(slot)slot.innerHTML=form(add.dataset.add,null,add.dataset.kind);return;}
 if(e.target.closest("[data-cancel]")){p.querySelector("#c24-form-slot")?.replaceChildren();return;}
 const edit=e.target.closest("[data-edit]");
 if(edit){const [type,id]=edit.dataset.edit.split("|");const row=(state[type]||[]).find(x=>x.id===id);const slot=p.querySelector("#c24-form-slot");if(row&&slot){slot.innerHTML=form(type,row,type==="entries"?row.kind:"");slot.scrollIntoView({block:"nearest",behavior:"smooth"});}return;}
 const arch=e.target.closest("[data-archive]");
 if(arch){const [type,id]=arch.dataset.archive.split("|");if(!confirm("Archiver cette écriture ? Elle restera dans l’historique, mais sera retirée des totaux."))return;
 arch.disabled=true;
 try{await request({action:"archive",type,id,confirm_archive:true});await pull();render();}catch(err){alert(err.message);arch.disabled=false;}return;}
},true);
document.addEventListener("input",e=>{
 const field=e.target.closest("[data-filter]");
 if(!field||!pane()?.contains(field))return;
 const term=norm(field.value);
 const rows=pane().querySelectorAll(".c24-entrylist .c24-table tbody tr");
 rows.forEach(row=>{row.hidden=!!term&&!norm(row.textContent).includes(term);});
});
document.addEventListener("submit",e=>{
 const form=e.target.closest("#c24-settings-form,[data-save]");
 if(!form||!pane()?.contains(form))return;
 e.preventDefault();
 if(form.id==="c24-settings-form")saveSettings(form);
 else save(form);
},true);
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"){const slot=pane()?.querySelector("#c24-form-slot");if(slot&&slot.children.length)slot.replaceChildren();}
});
window.CrewFinanceV24={open,reload};
})();