import {createClient} from "https://esm.sh/@supabase/supabase-js@2.116.0";
import {ROUTINES} from "./eloah-routines-catalogue.js?v=1";
const $=id=>document.getElementById(id);
const OWNER="bd4b7197-6401-4a9a-a14e-c6adbdc0ed46";
const db=createClient("https://voytsqyorhoveurnguxn.supabase.co","sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy",{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,storageKey:"eloah-founder-auth-v1"}});
let founder=false,rev=0,selected="priority",sources={tasks:[],missions:[],appointments:[]},settings=new Map(),draft="",saving=false,runs=[];
const routine=()=>ROUTINES.find(x=>x.key===selected)||ROUTINES[1];
const msg=(id,text)=>{$(id).textContent=text;};
const defaultPrefs=()=>({frequency:"manual",hour:"",topics:""});
function renderList(){
 const root=$("routine-list");root.replaceChildren();
 ROUTINES.forEach(r=>{
  const btn=document.createElement("button");btn.type="button";btn.className="routine"+(selected===r.key?" active":"");btn.setAttribute("aria-pressed",String(selected===r.key));
  const emoji=document.createElement("span");emoji.className="emoji";emoji.textContent=r.emoji;
  const content=document.createElement("span"),title=document.createElement("strong"),detail=document.createElement("small");title.textContent=r.title;detail.textContent=r.sources;content.append(title,detail);
  const arrow=document.createElement("span");arrow.className="right-arrow";arrow.textContent="›";
  btn.append(emoji,content,arrow);btn.onclick=()=>select(r.key);root.append(btn);
 });
}
function select(key){
 if(!ROUTINES.some(r=>r.key===key))return;
 selected=key;draft="";$("brief").textContent="Clique sur « Préparer le brief »."; $("copy-brief").disabled=true;$("open-ai").disabled=true;
 $("manual-context").value="";$("use-internal-context").checked=false;
 const r=routine();$("routine-title").textContent=r.emoji+" "+r.title;$("routine-desc").textContent=r.description;
 $("travel-extra").hidden=key!=="departure";$("topics-field").hidden=key!=="news";
 const p=settings.get(key)||defaultPrefs();$("routine-frequency").value=p.frequency||"manual";$("routine-hour").value=p.hour||"";$("routine-topics").value=p.topics||"";updateSchedulerUi();
 msg("save-status",founder?"Préférence chargée. Aucune exécution automatique programmée.":"Connecte-toi pour enregistrer une préférence.");
 msg("brief-status","Aucun message envoyé et aucune automatisation lancée.");renderList();
}
function forget(){
 rev++;founder=false;sources={tasks:[],missions:[],appointments:[]};settings.clear();runs=[];renderRuns();
 $("task-count").textContent="—";$("meeting-count").textContent="—";$("save-preferences").disabled=true;$("use-internal-context").checked=false;
 $("source-status").textContent="Sources privées déchargées.";select(selected);
}
async function fetchRows(name,fields,limit=90){
 if(!founder)throw Error("Session fondatrice requise");
 const {data,error}=await db.from(name).select(fields).eq("owner_id",OWNER).limit(limit);
 if(error)throw Error("Lecture impossible : "+name);return data||[];
}
function showSource(label,value){
 const root=$("source-status"),div=document.createElement("div");div.className="source";
 const a=document.createElement("span"),b=document.createElement("span");a.textContent=label;b.textContent=value;div.append(a,b);root.append(div);
}
async function refresh(){
 const serial=++rev;$("refresh-data").disabled=true;msg("auth-status","Vérification de ta session ELOAH Fondatrice…");
 try{
  const {data,error}=await db.auth.getUser();if(serial!==rev)return;
  if(error||data?.user?.id!==OWNER){forget();msg("auth-status",data?.user?.id?"Compte non fondatrice.":"Connecte-toi à ELOAH Fondatrice puis actualise.");return}
  founder=true;
  const results=await Promise.allSettled([
   fetchRows("sonia_os_tasks","instruction,status,scheduled_for,completed_at",80),
   fetchRows("sonia_os_missions","title,status,completed_at",80),
   fetchRows("eloah_appointments","name,date,universe,state",80),
   fetchRows("eloah_routine_settings","routine_key,preferences,enabled",10)
  ]);
  if(serial!==rev||!founder)return;
  sources.tasks=results[0].status==="fulfilled"?results[0].value:[];
  sources.missions=results[1].status==="fulfilled"?results[1].value:[];
  sources.appointments=results[2].status==="fulfilled"?results[2].value:[];
  settings.clear();if(results[3].status==="fulfilled")results[3].value.forEach(x=>settings.set(x.routine_key,{...(x.preferences||defaultPrefs()),enabled:x.enabled===true}));
  $("source-status").replaceChildren();
  ["Tâches SONIA OS","Missions SONIA OS","Rendez-vous ELOAH","Préférences des routines"].forEach((name,i)=>showSource(name,results[i].status==="fulfilled"?results[i].value.length+" entrée(s)":"Lecture non disponible"));
  showSource("Gmail / Google Agenda","Contenu extérieur non lu");showSource("Actualités et trafic","Pas de données en direct");
  $("task-count").textContent=results[0].status==="fulfilled"?sources.tasks.length:"—";
  $("meeting-count").textContent=results[2].status==="fulfilled"?sources.appointments.length:"—";
  $("save-preferences").disabled=results[3].status!=="fulfilled";select(selected);
  msg("auth-status",results.some(r=>r.status==="rejected")?"Session vérifiée, certaines sources indisponibles.":"Session fondatrice vérifiée, sources internes consultées en lecture seule.");await loadRuns();
 }catch{if(serial===rev){forget();msg("auth-status","Session non vérifiable. Aucune donnée privée affichée.");}}
 finally{$("refresh-data").disabled=false;}
}
const dateFR=x=>{if(!x)return "sans date";const d=new Date(x);return Number.isFinite(d.getTime())?d.toLocaleString("fr-FR",{timeZone:"Europe/Paris"}):"date invalide"};
function internalData(){
 if(!founder)return "Aucune donnée privée consultable sans session fondatrice.";
 const result=[],keys=selected,openTasks=sources.tasks.filter(x=>!["completed","done","cancelled","failed"].includes(String(x.status||"").toLowerCase()));
 const openMissions=sources.missions.filter(x=>!["completed","done","archived","cancelled"].includes(String(x.status||"").toLowerCase()));
 if(["messages","priority","appointments","week","departure"].includes(keys)){
  result.push("Tâches : "+sources.tasks.length+" visibles, "+openTasks.length+" non terminées.");
  if(!openTasks.length)result.push("Aucune tâche ouverte dans les entrées chargées.");
  openTasks.slice(0,7).forEach(x=>result.push("Tâche : "+String(x.instruction||"Sans intitulé").slice(0,150)+" ; statut "+x.status+" ; date "+dateFR(x.scheduled_for)));
  result.push("Missions : "+sources.missions.length+" visibles, "+openMissions.length+" non terminées.");
  openMissions.slice(0,7).forEach(x=>result.push("Mission : "+String(x.title||"Sans titre").slice(0,140)+" ; statut "+x.status));
 }
 if(["priority","appointments","week","departure"].includes(keys)){
  const upcoming=sources.appointments.filter(x=>{const d=new Date(x.date).getTime();return Number.isFinite(d)&&d>=Date.now()-86400000&&d<Date.now()+15*86400000}).sort((a,b)=>new Date(a.date)-new Date(b.date));
  result.push("Rendez-vous ELOAH : "+sources.appointments.length+" ; proches : "+upcoming.length+". Google Agenda non consulté.");
  upcoming.slice(0,7).forEach(x=>result.push("Rendez-vous : "+String(x.name||"Sans titre").slice(0,100)+" ; "+dateFR(x.date)));
 }
 if(keys==="week")result.push("Tâches terminées ces 7 derniers jours : "+sources.tasks.filter(x=>x.status==="completed"&&x.completed_at&&Date.now()-new Date(x.completed_at).getTime()>=0&&Date.now()-new Date(x.completed_at).getTime()<7*86400000).length);
 return result.join("\n")||"Aucun contexte pertinent dans les registres consultés.";
}
function travel(){
 const time=$("travel-start").value,minutes=Number($("travel-minutes").value),buffer=Number($("travel-buffer").value);
 if(!time)return "Aucun horaire saisi : calcul impossible.";
 if(!Number.isFinite(minutes)||minutes<=0||minutes>1440||!Number.isFinite(buffer)||buffer<0||buffer>240)return "Durée ou marge invalide.";
 const d=new Date(time);if(!Number.isFinite(d.getTime()))return "Horaire non valide.";
 return "Départ théorique : "+new Date(d.getTime()-(minutes+buffer)*60000).toLocaleString("fr-FR")+" pour une arrivée à "+d.toLocaleString("fr-FR")+" ; trajet saisi "+minutes+" min ; marge "+buffer+" min. Trafic non vérifié.";
}
function prepare(){
 const r=routine(),parts=[
  "ELOAH · ROUTINE : "+r.title,
  "Préparation le "+new Date().toLocaleString("fr-FR",{timeZone:"Europe/Paris"}),
  "Objectif : "+r.description,
  "Consigne : "+r.prompt,
  "Sécurité : ne prétends pas avoir consulté des sources externes, ni envoyé, publié ou payé."
 ];
 const user=$("manual-context").value.trim();if(user)parts.push("Informations fournies volontairement par Sonia :\n"+user.slice(0,1800));
 if(r.key==="news"&&$("routine-topics").value.trim())parts.push("Sujets à vérifier : "+$("routine-topics").value.trim().slice(0,260));
 if(r.key==="departure")parts.push(travel());
 parts.push($("use-internal-context").checked?"Sources internes ajoutées volontairement :\n"+internalData():"Sources internes non jointes : pas d'autorisation de partage.");
 if(["email","messages"].includes(r.key))parts.push("Aucun contenu de Gmail n'a été lu.");
 if(r.key==="news")parts.push("Aucune recherche web n'a été effectuée : vérifie les sources et dates.");
 parts.push("Réponse attendue : faits confirmés, informations manquantes, priorité, trois étapes et validations nécessaires.");
 draft=parts.join("\n\n").slice(0,7800);$("brief").textContent=draft;$("copy-brief").disabled=false;$("open-ai").disabled=false;
 msg("brief-status","Brief préparé localement. Aucun envoi vers l'IA avant ton action.");
}
async function copy(value){
 try{await navigator.clipboard.writeText(value);msg("brief-status","Texte copié.");}
 catch{msg("brief-status","Copie impossible. Sélectionne le texte directement dans l'aperçu.");}
}
async function save(){
 if(saving||!founder){msg("save-status","Session fondatrice requise pour sauvegarder.");return}
 const frequency=$("routine-frequency").value,hour=$("routine-hour").value,topics=$("routine-topics").value.trim().slice(0,260);
 if(!["manual","daily","weekly","before_event"].includes(frequency)||hour&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(hour)){msg("save-status","Heure ou fréquence invalide.");return}
 saving=true;$("save-preferences").disabled=true;const id=selected;
 try{
  const {data:auth,error:authError}=await db.auth.getUser();
  if(authError||auth?.user?.id!==OWNER)throw Error("Session expirée.");
  const value={frequency,hour,topics};
  const {data,error}=await db.from("eloah_routine_settings").upsert({owner_id:OWNER,routine_key:id,preferences:value,enabled:false,updated_at:new Date().toISOString()},{onConflict:"owner_id,routine_key"}).select("routine_key").single();
  if(error||!data)throw Error("Le serveur n'a pas confirmé la sauvegarde.");
  settings.set(id,{...value,enabled:false});updateSchedulerUi();msg("save-status","Préférence cloud sauvegardée. Ton rappel reste désactivé jusqu’au clic sur « Activer ».");
 }catch(e){msg("save-status","Échec : "+e.message)}
 finally{saving=false;$("save-preferences").disabled=!founder;}
}
function toAI(){
 if(!draft)return;
 try{sessionStorage.setItem("eloah-routine-handoff-v1",JSON.stringify({created_at:Date.now(),text:draft.slice(0,4000),routine:selected}));location.href="eloah-2040.html#assistant-reel";}
 catch{msg("brief-status","Transfert indisponible : copie le brief et colle-le dans ELOAH IA.");}
}

function updateSchedulerUi(){
 const p=settings.get(selected)||defaultPrefs();
 const possible=["daily","weekly"].includes(p.frequency)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(p.hour||"");
 const saved=possible&&$("routine-frequency").value===p.frequency&&$("routine-hour").value===(p.hour||"")&&$("routine-topics").value===(p.topics||"");
 $("activate-schedule").disabled=!founder||!saved||p.enabled===true||saving;
 $("pause-schedule").disabled=!founder||p.enabled!==true||saving;
 const label=p.frequency==="weekly"?"le lundi":"chaque jour";
 msg("schedule-status",p.enabled?"Rappel ACTIF : "+label+" à "+p.hour+" (heure de Paris). Résultat dans ELOAH, sans push ni email.":
   saved?"Prêt à activer : "+label+" à "+p.hour+" (heure de Paris).":
   "Enregistre un rythme quotidien ou hebdomadaire avec une heure, puis active-le volontairement. Le mode « Avant rendez-vous » reste manuel.");
}
async function setSchedule(enabled){
 if(!founder||saving)return;
 const p=settings.get(selected);
 if(!p||!["daily","weekly"].includes(p.frequency)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.hour||"")){
  msg("schedule-status","Enregistre d’abord une fréquence quotidienne ou hebdomadaire et une heure valide.");return;
 }
 if(enabled&&($("routine-frequency").value!==p.frequency||$("routine-hour").value!==p.hour||
    $("routine-topics").value!==(p.topics||""))){
   msg("schedule-status","Modifications non enregistrées. Enregistre tes préférences avant d’activer.");return;
 }
 saving=true;updateSchedulerUi();
 try{
  const {data:who,error:authError}=await db.auth.getUser();
  if(authError||who?.user?.id!==OWNER)throw Error("Session fondatrice expirée.");
  const {data,error}=await db.from("eloah_routine_settings").update({enabled,updated_at:new Date().toISOString()})
    .eq("owner_id",OWNER).eq("routine_key",selected).select("enabled").single();
  if(error||!data||data.enabled!==enabled)throw Error("Modification non confirmée côté serveur.");
  settings.set(selected,{...p,enabled});updateSchedulerUi();
  msg("schedule-status",enabled?"Rappel activé dans ELOAH. Tu retrouveras le résultat au prochain créneau programmé. Aucun push ni mail envoyé.":"Rappel mis en pause. Aucun nouveau résultat programmé.");
 }catch(e){msg("schedule-status","Opération refusée : "+e.message)}
 finally{saving=false;updateSchedulerUi();}
}
function renderRuns(){
 const box=$("routine-inbox");box.replaceChildren();
 $("unread-count").textContent=runs.filter(x=>!x.seen_at).length+" nouveau(x)";
 if(!founder){$("run-status").textContent="Session fondatrice nécessaire.";return}
 $("run-status").textContent=runs.length+" rappel(s) enregistré(s), depuis les registres internes.";
 if(!runs.length){const p=document.createElement("p");p.className="help";p.textContent="Aucun rappel programmé produit pour le moment. Il faut activer un rythme et atteindre son créneau.";box.append(p);return}
 for(const run of runs.slice(0,24)){
  const article=document.createElement("article");article.className="panel";
  article.style.margin="0";article.style.padding="14px";
  const title=document.createElement("strong");title.style.display="block";const item=ROUTINES.find(x=>x.key===run.routine_key);
  title.textContent=(item?.emoji||"✧")+" "+(item?.title||run.routine_key);
  const desc=document.createElement("small");desc.className="help";desc.textContent="Rappel du "+new Date(run.scheduled_for).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})+" · "+(run.seen_at?"Lu":"Non lu");
  const content=document.createElement("p");content.className="help";
  const data=run.payload||{};
  content.textContent="À préparer · "+(data.task_open_count??"—")+" tâche(s) ouvertes, "+(data.mission_open_count??"—")+" mission(s) ouvertes, "+(data.appointment_upcoming_count??"—")+" rendez-vous dans les 7 jours, "+(data.indexed_mail_p1_count??"—")+" e-mails P1 indexés. Chiffres issus des registres, pas de lecture Gmail ou Google Agenda en direct.";
  article.append(title,desc,content);
  const row=document.createElement("div");row.className="row";
  const open=document.createElement("button");open.type="button";open.textContent="Préparer le brief";open.onclick=()=>{
    select(run.routine_key);$("use-internal-context").checked=true;prepare();
    $("routine-workbench").scrollIntoView({behavior:"smooth",block:"start"});
  };
  row.append(open);
  if(!run.seen_at){
   const ack=document.createElement("button");ack.type="button";ack.className="secondary";ack.textContent="Marquer lu";
   ack.onclick=async()=>{
    ack.disabled=true;
    try{
     const {data,error}=await db.from("eloah_routine_runs").update({seen_at:new Date().toISOString()})
      .eq("owner_id",OWNER).eq("id",run.id).is("seen_at",null).select("id,seen_at").maybeSingle();
     if(error||!data)throw Error("Accusé de lecture non confirmé");
     run.seen_at=data.seen_at;renderRuns();
    }catch(e){ack.disabled=false;msg("run-status","Erreur de lecture : "+e.message)}
   };row.append(ack);
  }
  article.append(row);box.append(article);
 }
}
async function loadRuns(){
 if(!founder){runs=[];renderRuns();return}
 try{
  const {data,error}=await db.from("eloah_routine_runs")
   .select("id,routine_key,scheduled_for,payload,seen_at")
   .eq("owner_id",OWNER).order("scheduled_for",{ascending:false}).limit(50);
  if(error)throw Error("Boîte de rappels inaccessible.");
  if(!founder)return;
  runs=data||[];renderRuns();
 }catch(e){runs=[];renderRuns();msg("run-status",e.message)}
}
$("activate-schedule").onclick=()=>setSchedule(true);
$("pause-schedule").onclick=()=>setSchedule(false);
$("reload-runs").onclick=()=>loadRuns();
["routine-frequency","routine-hour","routine-topics"].forEach(id=>$(id).addEventListener("input",updateSchedulerUi));

$("refresh-data").onclick=refresh;$("prepare-brief").onclick=prepare;$("save-preferences").onclick=save;
$("copy-brief").onclick=()=>draft&&copy(draft);
$("copy-skill").onclick=()=>copy("ELOAH · "+routine().title+"\n\n"+routine().prompt+"\n\nSources à vérifier ; aucune exécution externe sans validation.");
$("open-ai").onclick=toAI;
for(const id of ["manual-context","use-internal-context","travel-start","travel-minutes","travel-buffer","routine-topics"])
 $(id).addEventListener("input",()=>{if(!draft)return;draft="";$("copy-brief").disabled=true;$("open-ai").disabled=true;msg("brief-status","Contexte modifié : prépare un nouveau brief.");});
db.auth.onAuthStateChange(event=>{if(event==="SIGNED_OUT"){forget();msg("auth-status","Déconnectée : données privées effacées.");}});
window.addEventListener("pagehide",()=>{rev++;sources={tasks:[],missions:[],appointments:[]};});
select(new URLSearchParams(location.search).get("routine")||"priority");refresh();