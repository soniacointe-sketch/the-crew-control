(() => {
"use strict";
const APP=document.getElementById("app");
const ENDPOINT="https://voytsqyorhoveurnguxn.supabase.co/functions/v1/eloah-boards-private-read";
const params=new URLSearchParams(location.hash.replace(/^#/,""));
const access=params.get("access")||"";
const prefKey="eloah-private-board-prefs-v2";
let stored={};
try{stored=JSON.parse(localStorage.getItem(prefKey)||"{}")||{}}catch(e){}
const state={boards:[],total:0,updatedAt:"",screen:"home",boardId:null,search:"",boardSearch:"",recent:Array.isArray(stored.recent)?stored.recent:[],favorites:Array.isArray(stored.favorites)?stored.favorites:[],globalQuery:"",globalScope:"all",globalOrder:"board",boardFilter:"",pageSize:60};
function persistPrefs(){try{localStorage.setItem(prefKey,JSON.stringify({recent:state.recent.slice(0,8),favorites:state.favorites.slice(0,30)}))}catch(e){}}
function isFavorite(id){return state.favorites.includes(id)}
function toggleFavorite(id){
 state.favorites=isFavorite(id)?state.favorites.filter(x=>x!==id):[id,...state.favorites];
 persistPrefs();render();
}
function markRecent(id){
 state.recent=[id,...state.recent.filter(x=>x!==id)].slice(0,8);
 persistPrefs();
}
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};
const button=(text,cls,fn)=>{const b=node("button",cls,text);b.type="button";if(fn)b.addEventListener("click",fn);return b;};
const count=b=>(b.cards||[]).length;
const active=()=>state.boards.find(b=>b.id===state.boardId);
const sum=()=>state.boards.reduce((t,b)=>t+count(b),0);
const fmtDate=v=>{try{const d=new Date(v+"T12:00:00");return Number.isNaN(d.valueOf())?String(v):d.toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}catch(e){return String(v)}};
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("fr");
const wallpaper=b=>{
 const s=norm(b.name||"");
 if(s.includes("crew"))return "radial-gradient(circle at 65% 55%,#a57a35,#27201a 38%,#090c0a 85%)";
 if(s.includes("power")||s.includes("glam"))return "linear-gradient(130deg,#f0dcd3,#ad5f74,#2d1424)";
 if(s.includes("femme"))return "linear-gradient(140deg,#233b2d,#42694a,#111f1c)";
 if(s.includes("serenya"))return "linear-gradient(140deg,#210e20,#713148,#130d19)";
 if(s.includes("parisis"))return "linear-gradient(140deg,#674833,#ccb18b,#392d27)";
 if(s.includes("foi"))return "linear-gradient(130deg,#819aa3,#c3d5d3,#81957d)";
 if(s.includes("velka"))return "linear-gradient(135deg,#15131c,#793348,#0e101a)";
 if(s.includes("lion"))return "linear-gradient(130deg,#bcced3,#667e97,#1a344b)";
 if(s.includes("eloah"))return "linear-gradient(135deg,#a2a0d0,#656caf,#353759)";
 if(s.includes("sonia os"))return "linear-gradient(140deg,#293742,#6b7f97,#121d30)";
 return "linear-gradient(130deg,#806fc0,#3d568c,#2b316e)";
};
const cleanUrl=v=>{try{const u=new URL(String(v));return u.protocol==="https:"&&!["trello.com","www.trello.com"].includes(u.hostname)?u.href:null}catch(e){return null}};
function fail(message){APP.replaceChildren();const wrap=node("div","loading");wrap.append(node("h2",null,"Accès privé ELOAH"),node("p",null,message));wrap.append(button("Réessayer","",load));APP.append(wrap)}
function spinner(){APP.replaceChildren();const wrap=node("div","loading");wrap.append(node("h2",null,"ELOAH Boards"),node("p",null,"Ouverture de tes tableaux privés…"));APP.append(wrap)}
async function load(){
 if(!/^[A-Za-z0-9_-]{43}$/.test(access)){fail("Ouvre le lien privé complet, avec sa clé d’accès. Aucun e-mail n’est nécessaire.");return}
 spinner();
 try{
  const response=await fetch(ENDPOINT,{method:"POST",headers:{"X-Eloah-Access":access,"Content-Type":"application/json"},body:"{}",cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(response.status===401?"Ce lien privé est expiré ou révoqué. Demande son renouvellement.":payload.error||"Le chargement privé est momentanément indisponible.");
  if(payload.readOnly!==true||!Array.isArray(payload.boards))throw Error("Le format des tableaux reçus est invalide.");
  state.boards=payload.boards.filter(b=>b&&typeof b.id==="string"&&Array.isArray(b.lanes)&&Array.isArray(b.cards));
  state.total=Number(payload.totalCards)||sum();
  state.updatedAt=String(payload.updatedAt||"");
  render();
 }catch(e){fail(e instanceof Error?e.message:"Impossible de charger les tableaux.")}
}
function tabs(activeScreen){
 const nav=node("nav","bottom-tabs");nav.setAttribute("aria-label","Navigation ELOAH");
 for(const [route,icon,title] of [["home","▥","Tableaux"],["all","⌕","Toutes les cartes"],["agenda","▦","Agenda"],["access","◈","Accès privé"]]){
  const b=button("","tab"+(route===activeScreen?" active":""),()=>{state.screen=route;render()});
  b.setAttribute("aria-current",route===activeScreen?"page":"false");
  b.append(node("span",null,icon),node("span",null,title));nav.append(b);
 }
 return nav;
}
function boardRow(b,showCount=true){
 const row=node("div","board-entry");
 const main=button("","entry-open",()=>openBoard(b.id));
 const mini=node("span","mini");mini.style.backgroundImage=wallpaper(b);
 const txt=node("span","entry-body");txt.append(node("span","entry-title",b.name));
 if(showCount)txt.append(node("span","entry-sub",count(b)+" cartes"));
 main.append(mini,txt);row.append(main);
 const fav=button(isFavorite(b.id)?"★":"☆","favorite"+(isFavorite(b.id)?" selected":""),()=>toggleFavorite(b.id));
 fav.setAttribute("aria-pressed",isFavorite(b.id)?"true":"false");
 fav.setAttribute("aria-label",(isFavorite(b.id)?"Retirer des favoris : ":"Ajouter aux favoris : ")+b.name);
 row.append(fav);return row;
}
function openBoard(id){
 const b=state.boards.find(x=>x.id===id);if(!b)return;
 state.boardId=id;state.boardSearch="";state.boardFilter="";state.screen="board";markRecent(id);render();
}
function header(title,withSearch=true){
 const top=node("header","top"),line=node("div","top-line");line.append(node("h1",null,title));
 const actions=node("div","top-actions");actions.append(button("⌕","circle",()=>state.screen==="home"?top.querySelector("input")?.focus():navigate("all")));
 actions.append(button("↻","circle blue",load));line.append(actions);top.append(line);
 if(withSearch){
  const search=node("label","searchbox");
  search.append(node("span",null,"⌕"));
  const input=node("input");input.type="search";input.placeholder="Rechercher un tableau";input.setAttribute("aria-label","Rechercher un tableau");input.value=state.search;
  input.addEventListener("input",()=>{state.search=input.value;fillLists()});search.append(input);top.append(search);
 }
 return top;
}
function navigate(next){state.screen=next;render()}
function home(){
 const shell=node("div","screen");shell.append(header("Tableaux"));
 const stats=node("div","stats");
 for(const [num,label] of [[state.boards.length,"Tableaux ELOAH"],[state.total,"Cartes consultables"]]){const box=node("div","stat");box.append(node("strong",null,num),node("small",null,label));stats.append(box)}
 shell.append(stats);
 const last=state.recent.map(id=>state.boards.find(b=>b.id===id)).find(Boolean);
 if(last){
  const resume=node("div","resume");
  resume.append(node("div","resume-kicker","REPRENDRE MON PROJET"));
  resume.append(node("strong",null,last.name));
  resume.append(node("span","entry-sub",count(last)+" cartes"));
  resume.append(button("Ouvrir →","resume-action",()=>openBoard(last.id)));
  shell.append(resume);
 }
 if(state.favorites.some(id=>state.boards.some(b=>b.id===id))){
  shell.append(node("div","section-heading","★  Mes tableaux favoris"));
  const list=node("section","list");list.id="favList";shell.append(list);
 }
 if(state.recent.some(id=>state.boards.some(b=>b.id===id))){
  shell.append(node("div","section-heading","◷  Tableaux récents"));
  const list=node("section","list");list.id="recentList";shell.append(list);
 }
 shell.append(node("div","workspace-label","MES ESPACES DE TRAVAIL"));
 shell.append(node("div","workspace-title","♧  Espace privé ELOAH"));
 const list=node("section","list");list.id="mainList";shell.append(list);
 APP.replaceChildren(shell,tabs("home"));fillLists();
}
function fillLists(){
 const filtered=state.boards.filter(b=>norm(b.name).includes(norm(state.search)));
 const fav=document.getElementById("favList");
 if(fav){fav.replaceChildren();state.favorites.map(id=>filtered.find(b=>b.id===id)).filter(Boolean).forEach(b=>fav.append(boardRow(b)))}
 const recent=document.getElementById("recentList");
 if(recent){recent.replaceChildren();state.recent.map(id=>filtered.find(b=>b.id===id)).filter(Boolean).slice(0,5).forEach(b=>recent.append(boardRow(b)))}
 const main=document.getElementById("mainList");if(!main)return;main.replaceChildren();
 for(const b of filtered)main.append(boardRow(b));
 if(!filtered.length)main.append(node("div","empty","Aucun tableau trouvé."));
}
function cardButton(b,c){
 const card=button("","card",()=>openCard(b,c));if(c.tag)card.append(node("span","card-label",c.tag));
 const title=node("div","card-title");title.append(node("span","circle-check","○"),node("span",null,c.title||"Sans titre"));card.append(title);
 const meta=node("div","card-meta");
 if(c.due)meta.append(node("span","due","◷ "+fmtDate(c.due)));
 if(c.description)meta.append(node("span",null,"≡ Description"));
 if(c.checks?.length)meta.append(node("span",null,"☑ "+c.checks.filter(x=>x.done).length+"/"+c.checks.length));
 if(c.thread?.length)meta.append(node("span",null,"● "+c.thread.length));
 if(c.links?.length)meta.append(node("span",null,"⌁ "+c.links.length));
 if(meta.childElementCount)card.append(meta);return card;
}
function renderRail(b,rail){
 rail.replaceChildren();
 const filter=norm(state.boardSearch.trim());
 for(const lane of b.lanes){
  const visible=(b.cards||[]).filter(c=>{
   if(c.lane!==lane.id||c.archived)return false;
   if(filter&&!norm([c.title,c.description,c.tag].join(" ")).includes(filter))return false;
   if(state.boardFilter==="urgent"&&c.tag!=="Urgent")return false;
   if(state.boardFilter==="important"&&c.tag!=="Important")return false;
   if(state.boardFilter==="due"&&!c.due)return false;
   return true;
  });
  const col=node("section","lane");
  const head=node("div","lane-header");head.append(node("span",null,lane.name),node("span","count",visible.length));col.append(head);
  for(const c of visible)col.append(cardButton(b,c));
  if(!visible.length)col.append(node("div","empty","Aucune carte pour ce filtre."));
  rail.append(col);
 }
}
function boardView(){
 const b=active();if(!b){navigate("home");return}
 const shell=node("div","screen board-view");
 const wall=node("div","board-wall");wall.style.backgroundImage=wallpaper(b);shell.append(wall);
 const head=node("header","board-head");head.append(button("×","back",()=>navigate("home")));
 const title=node("div","board-heading");title.append(node("div","board-name",b.name),node("div","board-detail",count(b)+" cartes · ELOAH"));head.append(title);
 head.append(button("⌕","circle",()=>shell.querySelector(".board-search input")?.focus()));shell.append(head);

 const search=node("div","board-search"),input=node("input");
 input.type="search";input.placeholder="Chercher parmi les cartes";input.value=state.boardSearch;
 search.append(input);shell.append(search);
 const filters=node("div","board-filters");
 const options=[["","Toutes"],["urgent","Urgentes"],["important","Importantes"],["due","Avec date"]];
 const rail=node("main","rails");
 function updateFilterUI(){
  filters.querySelectorAll("button").forEach((el,i)=>{
   const selected=options[i][0]===state.boardFilter;
   el.classList.toggle("active",selected);el.setAttribute("aria-pressed",String(selected));
  });
 }
 for(const [value,label] of options){
  const chip=button(label,"filter-chip",()=>{state.boardFilter=value;updateFilterUI();renderRail(b,rail);updatePosition()});
  filters.append(chip);
 }
 shell.append(filters);updateFilterUI();
 input.addEventListener("input",()=>{state.boardSearch=input.value;renderRail(b,rail);updatePosition()});

 const navigation=node("div","board-navigation");
 const label=node("label",null,"Aller à la liste");
 const selector=node("select");selector.setAttribute("aria-label","Choisir la liste");
 b.lanes.forEach((lane,i)=>{const option=node("option",null,(i+1)+". "+lane.name);option.value=String(i);selector.append(option)});
 const position=node("span","position-count","1 / "+b.lanes.length);
 label.append(selector);navigation.append(label,position);shell.append(navigation);
 selector.addEventListener("change",()=>{
  const child=rail.children[Number(selector.value)];
  child?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"start"});
 });
 const dots=node("div","board-dots");dots.setAttribute("aria-hidden","true");
 for(let i=0;i<b.lanes.length;i++)dots.append(node("span","board-dot"+(i===0?" current":"")));
 shell.append(rail,dots);
 const touchStatus=node("div","readonly","🔒 Privé · lecture seule");
 shell.append(touchStatus);
 function updatePosition(){
  const child=rail.children[0];
  if(!child)return;
  const step=child.getBoundingClientRect().width+13;
  const idx=Math.min(Math.max(0,Math.round(rail.scrollLeft/Math.max(1,step))),Math.max(0,b.lanes.length-1));
  selector.value=String(idx);
  position.textContent=(idx+1)+" / "+b.lanes.length;
  dots.querySelectorAll(".board-dot").forEach((e,i)=>e.classList.toggle("current",i===idx));
 }
 rail.addEventListener("scroll",updatePosition,{passive:true});
 renderRail(b,rail);
 APP.replaceChildren(shell);
 requestAnimationFrame(updatePosition);
}
function openCard(b,c){
 const overlay=node("div","scrim");
 const previousFocus=document.activeElement;
 const onEscape=e=>{if(e.key==="Escape")close()};
 function close(){document.removeEventListener("keydown",onEscape);overlay.remove();previousFocus?.focus?.()}
 overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
 document.addEventListener("keydown",onEscape);
 const sheet=node("section","sheet");sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-label",c.title||"Détails de la carte");
 const head=node("div","sheet-header");head.append(node("h2",null,c.title||"Sans titre"));
 head.append(button("×","close",close));sheet.append(head);
 sheet.append(node("span","pill",b.name));
 const lane=b.lanes.find(l=>l.id===c.lane);if(lane)sheet.append(node("span","pill",lane.name));
 if(c.tag)sheet.append(node("span","pill",c.tag));
 if(c.due)sheet.append(node("div",null,"📅 "+fmtDate(c.due)));
 if(c.description){sheet.append(node("h3",null,"Description"));sheet.append(node("p",null,c.description))}
 if(c.checks?.length){
 const done=c.checks.filter(x=>x.done).length;
 sheet.append(node("h3",null,"Checklist · "+done+"/"+c.checks.length));
 const progress=node("progress");progress.max=c.checks.length;progress.value=done;
 progress.setAttribute("aria-label","Avancement de la checklist");sheet.append(progress);
 for(const item of c.checks)sheet.append(node("div","check",(item.done?"☑":"□")+"  "+item.text));
}
 if(c.comments){sheet.append(node("h3",null,"Notes"));sheet.append(node("p",null,c.comments))}
 if(c.thread?.length){sheet.append(node("h3",null,"Commentaires"));for(const item of c.thread){const content=node("p",null,item.text||"");if(item.at)content.prepend(document.createTextNode(new Date(item.at).toLocaleString("fr-FR")+" — "));sheet.append(content)}}
 const links=(c.links||[]).map(cleanUrl).filter(Boolean);
 if(links.length){sheet.append(node("h3",null,"Documents"));const list=node("div","detail-links");for(const href of links){const link=node("a",null,"Ouvrir un document externe ↗");link.href=href;link.target="_blank";link.rel="noopener noreferrer";list.append(link)}sheet.append(list)}
 const status=node("p","notice","🔒 Lecture seule : cette page n’enregistre aucune modification des cartes.");
 sheet.append(status);overlay.append(sheet);APP.append(overlay);
}
function sectionScreen(title){
 const shell=node("div","screen");shell.append(header(title,false));const inner=node("section","section-page");shell.append(inner);APP.replaceChildren(shell,tabs(state.screen));return inner;
}
function allCards(){
 const wrap=sectionScreen("Toutes mes cartes");
 const summary=node("p","search-summary","Rechercher dans "+state.total+" cartes sur "+state.boards.length+" tableaux.");
 wrap.append(summary);
 const controls=node("div","global-controls");
 const search=node("label","searchbox");search.append(node("span",null,"⌕"));
 const input=node("input");input.type="search";input.placeholder="Titre, description, univers…";
 input.setAttribute("aria-label","Rechercher toutes les cartes");
 input.value=state.globalQuery;search.append(input);controls.append(search);
 const row=node("div","control-row");
 const scope=node("select");scope.setAttribute("aria-label","Filtrer les résultats");
 const scopes=[["all","Cartes actives"],["urgent","Urgentes"],["due","Avec échéance"],["archived","Archivées"]];
 scopes.forEach(([value,label])=>{const opt=node("option",null,label);opt.value=value;scope.append(opt)});
 scope.value=state.globalScope;row.append(scope);
 const sort=node("select");sort.setAttribute("aria-label","Trier les cartes");
 const orders=[["board","Par tableau"],["title","Titre A–Z"],["due","Échéance la plus proche"]];
 orders.forEach(([value,label])=>{const opt=node("option",null,label);opt.value=value;sort.append(opt)});
 sort.value=state.globalOrder;row.append(sort);
 controls.append(row);wrap.append(controls);
 const results=node("div","global-results");wrap.append(results);
 const more=node("button","show-more",()=>{state.pageSize+=60;fill()});more.type="button";more.textContent="Afficher 60 cartes supplémentaires";
 wrap.append(more);
 const source=state.boards.flatMap(b=>(b.cards||[]).map(c=>({b,c})));
 function fill(){
  results.replaceChildren();
  const term=norm(input.value.trim());
  const filtered=source.filter(({b,c})=>{
   const archived=!!c.archived;
   if(scope.value==="archived"?!archived:archived)return false;
   if(scope.value==="urgent"&&c.tag!=="Urgent")return false;
   if(scope.value==="due"&&!c.due)return false;
   return !term||norm([c.title,c.description,c.tag,b.name,b.lanes.find(l=>l.id===c.lane)?.name].join(" ")).includes(term);
  });
  if(sort.value==="title")filtered.sort((a,b)=>(a.c.title||"").localeCompare(b.c.title||"","fr"));
  else if(sort.value==="due")filtered.sort((a,b)=>(a.c.due||"9999-12-31").localeCompare(b.c.due||"9999-12-31"));
  else filtered.sort((a,b)=>a.b.name.localeCompare(b.b.name,"fr"));
  summary.textContent=filtered.length+" résultat"+(filtered.length!==1?"s":"")+" · "+state.total+" cartes dans ELOAH";
  const subset=filtered.slice(0,state.pageSize);
  for(const {b,c} of subset){
   const btn=button("","result",()=>openCard(b,c));
   btn.append(node("strong",null,c.title||"Sans titre"));
   btn.append(node("small",null,b.name+" · "+(b.lanes.find(l=>l.id===c.lane)?.name||"Sans liste")));
   const meta=node("div","result-meta");
   if(c.tag)meta.append(node("span","card-label",c.tag));
   if(c.due)meta.append(node("span",null,"📅 "+fmtDate(c.due)));
   if(c.checks?.length)meta.append(node("span",null,"☑ "+c.checks.filter(x=>x.done).length+"/"+c.checks.length));
   if(meta.children.length)btn.append(meta);
   results.append(btn);
  }
  if(!filtered.length)results.append(node("p","empty","Aucune carte correspondante. Essaie un autre filtre."));
  more.hidden=state.pageSize>=filtered.length;more.textContent="Afficher 60 autres cartes · "+subset.length+" / "+filtered.length;
 }
 input.addEventListener("input",()=>{state.globalQuery=input.value;state.pageSize=60;fill()});
 scope.addEventListener("change",()=>{state.globalScope=scope.value;state.pageSize=60;fill()});
 sort.addEventListener("change",()=>{state.globalOrder=sort.value;state.pageSize=60;fill()});
 fill();
}
function agenda(){
 const wrap=sectionScreen("Échéances");
 const today=new Date();
 const localDate=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 const now=localDate(today);
 const future=localDate(new Date(today.getFullYear(),today.getMonth(),today.getDate()+7));
 const due=state.boards.flatMap(b=>b.cards.filter(c=>!c.archived&&!c.complete&&c.due).map(c=>({b,c})))
  .sort((a,b)=>a.c.due.localeCompare(b.c.due));
 const sections=[
  ["En retard",due.filter(x=>x.c.due<now),"danger"],
  ["Aujourd’hui",due.filter(x=>x.c.due===now),"today"],
  ["Dans les 7 prochains jours",due.filter(x=>x.c.due>now&&x.c.due<=future),"soon"],
  ["Plus tard",due.filter(x=>x.c.due>future),"later"]
 ];
 wrap.append(node("p","search-summary",due.length+" cartes avec échéance, dans tous les tableaux ELOAH."));
 for(const [title,items,tone] of sections){
  const section=node("section","agenda-section "+tone);
  const heading=node("h2",null,title+" · "+items.length);section.append(heading);
  for(const {b,c} of items){
   const btn=button("","result",()=>openCard(b,c));
   btn.append(node("strong",null,c.title||"Sans titre"));
   btn.append(node("small",null,fmtDate(c.due)+" · "+b.name));
   section.append(btn);
  }
  if(!items.length)section.append(node("p","agenda-empty","Aucune carte ici."));
  wrap.append(section);
 }
}
function accessInfo(){
 const wrap=sectionScreen("Mon accès privé");
 wrap.append(node("h2",null,"Lien privé ELOAH"));
 wrap.append(node("p","notice","Tu consultes ici les cartes sans te connecter par e-mail. Ce lien est personnel : toute personne à qui tu le transmettras pourra lire tes tableaux jusqu’à son expiration ou sa révocation."));
 wrap.append(node("p",null,"Mode : lecture seule. Les modifications restent disponibles dans ELOAH Boards avec une session sécurisée."));
 wrap.append(node("p",null,"Expiration prévue : 12 janvier 2027."));
 wrap.append(node("p",null,"Dernière mise à jour enregistrée : "+(state.updatedAt?new Date(state.updatedAt).toLocaleString("fr-FR"):"non disponible")));
 wrap.append(button("Actualiser mes tableaux","result",load));
}
function render(){
 if(!state.boards.length){fail("Aucun tableau disponible pour ce lien privé.");return}
 if(state.screen==="board")boardView();else if(state.screen==="all")allCards();else if(state.screen==="agenda")agenda();else if(state.screen==="access")accessInfo();else home();
}
load();
})();