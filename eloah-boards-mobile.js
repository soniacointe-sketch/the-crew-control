/* ELOAH Boards : interface smartphone, sans modification de la vue ordinateur. */
(()=>{
"use strict";
const mq=window.matchMedia("(max-width:767px)");
let root=null;
let screen="home", chosenBoardId=null, searchText="", boardFilter="", overview=false, activeColumn=0;
let recent=[];try{recent=JSON.parse(localStorage.getItem("eloah-mobile-recent-v1")||"[]")}catch(e){}
const symbols={
search:'<circle cx="11" cy="11" r="7"></circle><path d="m16 16 5 5"></path>',
plus:'<path d="M12 5v14M5 12h14"></path>',
x:'<path d="M18 6 6 18M6 6l12 12"></path>',
boards:'<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18M9 10v10M15 10v10"></path>',
inbox:'<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 13h5l2 3h4l2-3h5"></path>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M7 3v4M17 3v4M3 10h18"></path>',
bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"></path>',
user:'<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
clock:'<circle cx="12" cy="12" r="9"></circle><path d="M12 7v6l4 2"></path>',
paperclip:'<path d="m21 11.5-8.6 8.6a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 1 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"></path>',
more:'<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"></circle><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"></circle><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"></circle>',
filter:'<path d="M4 7h16M7 12h10M10 17h4"></path>',
settings:'<circle cx="12" cy="12" r="3"></circle><path d="M10 2h4l.7 2.4 2.3 1.1 2.3-1 2 3.4-1.8 1.8.2 2.4 2.3 1.4-1 3.8-2.5.1-1.7 2.1.4 2.6h-4l-.8-2.5-2.4-1-2.2 1-2-3.4 1.8-1.9-.2-2.3L2 12l1-3.8 2.6-.2L7 5.9l-.4-2.5z" transform="translate(1 0) scale(.92)"></path>',
expand:'<path d="M8 3H3v5M16 21h5v-5M3 3l7 7M21 21l-7-7M16 3h5v5M3 16v5h5M21 3l-7 7M3 21l7-7"></path>',
check:'<path d="m5 12 4 4L19 6"></path>',
chevron:'<path d="m9 18 6-6-6-6"></path>',
people:'<circle cx="8" cy="9" r="3"></circle><path d="M2 20a6 6 0 0 1 12 0M16 7a3 3 0 0 1 0 6M17 15a5 5 0 0 1 5 5"></path>',
image:'<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8" cy="8" r="1.5"></circle><path d="m3 17 6-6 4 4 3-3 5 5"></path>',
edit:'<path d="M12 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path><path d="m16 4 4 4-9 9-5 1 1-5 9-9z"></path>',
list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>'
};
const ico=(name)=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+(symbols[name]||symbols.boards)+'</svg>';
const n=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
const button=(label,cls,cb)=>{const b=n("button",cls);b.type="button";if(typeof label==="string")b.textContent=label;if(cb)b.addEventListener("click",cb);return b;};
const iconButton=(icon,label,cls,cb)=>{const b=button("",cls,cb);b.innerHTML=ico(icon);b.setAttribute("aria-label",label);b.title=label;return b;};
const norm=t=>(t||"").toLocaleLowerCase("fr");
const boardCount=b=>(b?.cards||[]).filter(c=>!c.archived).length;
const allBoards=()=>Array.isArray(data?.boards)?data.boards:[];
const selected=()=>allBoards().find(b=>b.id===chosenBoardId)||allBoards().find(b=>b.id===data.active)||allBoards()[0];
const uuid=()=>window.crypto?.randomUUID?.()||("eloah-"+Date.now()+"-"+Math.random().toString(36).slice(2));
const inbox=()=>{if(!Array.isArray(data.inbox))data.inbox=[];return data.inbox;};
function touchData(){save();render();}
function wallpaper(b){
 const custom=typeof savedThemes!=="undefined"?(savedThemes[b.id]||""):"";
 if(custom&&custom.startsWith("https://"))return {image:'url('+JSON.stringify(custom)+')',size:"cover"};
 if(custom)return {image:custom,size:"cover"};
 const k=norm(b.name);
 if(k.includes("crew"))return {image:"radial-gradient(circle at 65% 58%,#997032 0%,#282318 39%,#090909 79%)",size:"cover"};
 if(k.includes("power")||k.includes("glam"))return {image:"linear-gradient(138deg,#efd5d5,#ae6270 43%,#231419)",size:"cover"};
 if(k.includes("femme"))return {image:"linear-gradient(132deg,#294332,#375a3f,#0d1720)",size:"cover"};
 if(k.includes("serenya"))return {image:"linear-gradient(130deg,#291018,#612037,#1b0f1c)",size:"cover"};
 if(k.includes("parisis"))return {image:"linear-gradient(145deg,#7c5943,#c3a482,#4d3a30)",size:"cover"};
 if(k.includes("foi"))return {image:"linear-gradient(145deg,#a8b9c0,#eef1e9,#a0a997)",size:"cover"};
 if(k.includes("velka"))return {image:"linear-gradient(135deg,#10131b,#703241,#18111b)",size:"cover"};
 if(k.includes("lion"))return {image:"linear-gradient(135deg,#e2e8e4,#718ea1,#263a55)",size:"cover"};
 return {image:"linear-gradient(130deg,#8273c2,#5679b9,#232b65)",size:"cover"};
}
function decorateBackground(el,b){const v=wallpaper(b);el.style.backgroundImage=v.image;el.style.backgroundSize=v.size;el.style.backgroundPosition="center";}
function mount(){
 if(root||!mq.matches)return;
 root=n("div");root.id="eloahMobile";root.setAttribute("aria-label","ELOAH Boards sur téléphone");document.body.appendChild(root);
 try{inbox()}catch(e){}
 render();
}
function show(which){screen=which;searchText="";render();}
function footer(current){
 const dock=n("nav","em-dock");dock.setAttribute("aria-label","Navigation ELOAH Boards");
 const tabs=[["home","boards","Tableaux"],["inbox","inbox","Boîte de réception"],["agenda","calendar","Agenda"],["activity","bell","Activité"],["account","user","Compte"]];
 for(const [route,icon,label] of tabs){
 const b=button("","em-tab",()=>show(route));b.setAttribute("aria-current",route===current?"page":"false");
 if(route==="account"){b.innerHTML='<span class="em-avatar">E</span><span>'+label+'</span>'}
 else b.innerHTML=ico(icon)+"<span>"+label+"</span>";
 dock.appendChild(b);
 }
 root.appendChild(dock);
}
function header(title,withSearch=false){
 const top=n("div","em-home-head"),line=n("div","em-head-row");
 line.appendChild(n("h1","em-heading",title));
 const acts=n("div","em-head-actions");
 if(withSearch)acts.appendChild(iconButton("search","Rechercher", "em-circle-btn",()=>{const input=root.querySelector("#emSearchBoards");input?.focus()}));
 acts.appendChild(iconButton("plus",screen==="home"?"Créer un tableau":"Ajouter","em-circle-btn em-blue",()=>{
 if(screen==="home")createBoard(); else if(screen==="inbox")openInboxEditor();else if(screen==="agenda")show("home");else if(screen==="activity")show("home");else show("home");
 }));
 line.appendChild(acts);top.appendChild(line);return top;
}
function simpleHeader(title){
 const h=n("div","em-simple-top");
 h.appendChild(iconButton("x","Retour aux tableaux","em-back",()=>show("home")));
 h.appendChild(n("h1",null,title));
 return h;
}
function createBoard(){
 const name=window.prompt("Nom du nouveau tableau ELOAH");
 if(!name?.trim())return;
 const b={id:uuid(),name:name.trim(),lanes:["Idées","À faire","En cours","À vérifier","Terminé"].map(t=>({id:uuid(),name:t})),cards:[]};
 data.boards.push(b);touchData();openBoard(b.id);
}
function openBoard(id){
 const b=allBoards().find(x=>x.id===id);if(!b)return;
 chosenBoardId=id;overview=false;boardFilter="";activeColumn=0;screen="board";
 recent=[id,...recent.filter(x=>x!==id)].slice(0,16);
 try{localStorage.setItem("eloah-mobile-recent-v1",JSON.stringify(recent));localStorage.setItem("eloah-boards-v1",JSON.stringify({...data,active:id}))}catch(e){}
 data.active=id;render();
}
function listBoardRow(b,withMeta=false){
 const row=button("","em-board-row",()=>openBoard(b.id));
 const thumb=n("span","em-thumb");decorateBackground(thumb,b);
 const label=n("span","em-row-label");label.append(n("span","em-row-name",b.name));
 if(withMeta)label.append(n("span","em-row-meta",boardCount(b)+" carte"+(boardCount(b)>1?"s":"")));
 row.append(thumb,label,document.createTextNode(""));return row;
}
function renderHome(){
 root.innerHTML="";
 const shell=n("div","em-screen");shell.appendChild(header("Tableaux",true));
 const find=n("label","em-searchbox");find.innerHTML=ico("search");
 const input=n("input");input.type="search";input.id="emSearchBoards";input.autocomplete="off";input.placeholder="Tableaux";input.setAttribute("aria-label","Rechercher un tableau");input.value=searchText;
 input.addEventListener("input",()=>{searchText=input.value;fillHomeSections();});
 find.appendChild(input);shell.querySelector(".em-home-head").appendChild(find);
 const scroll=n("div","em-scroll");
 const box=n("div","em-inbox-box");const title=n("div","em-inbox-title");
 title.innerHTML=ico("inbox");
 title.appendChild(n("span",null,"Boîte de réception"));
 const cnt=n("span","em-count");cnt.id="emInboxCount";title.appendChild(cnt);
 title.appendChild(iconButton("edit","Ouvrir la boîte de réception","em-right-icon",()=>show("inbox")));
 box.appendChild(title);
 const add=button("","em-inbox-add",openInboxEditor);add.append(n("span",null,"Ajouter une carte"));
 const att=n("span");att.innerHTML=ico("paperclip");add.append(att);box.append(add);scroll.appendChild(box);
 const recentHead=n("div","em-section-h");recentHead.id="emRecentHeading";recentHead.innerHTML=ico("clock");recentHead.append(n("span",null,"Tableaux récents"));scroll.append(recentHead);
 const recentList=n("div","em-list");recentList.id="emRecent";scroll.appendChild(recentList);
 const spaceHead=n("div","em-workspace-head", "MES TABLEAUX ELOAH");scroll.appendChild(spaceHead);
 const workspace=n("div","em-workspace-row");workspace.innerHTML=ico("people");workspace.append(n("span",null,"Mes projets ELOAH"));
 const toBoards=n("span","em-arrow");toBoards.innerHTML=ico("chevron");workspace.append(toBoards);
 scroll.append(workspace);
 const workspaceList=n("div","em-list");workspaceList.id="emWorkspaceList";scroll.appendChild(workspaceList);
 shell.append(scroll);root.append(shell);fillHomeSections();footer("home");
}
function fillHomeSections(){
 const term=norm(searchText.trim()),boards=allBoards().filter(b=>norm(b.name).includes(term));
 const recentSet=recent.length?recent:allBoards().slice(0,3).map(b=>b.id);
 const first=recentSet.map(id=>boards.find(b=>b.id===id)).filter(Boolean);
 const recentList=root.querySelector("#emRecent"),workspaceList=root.querySelector("#emWorkspaceList");
 if(!recentList||!workspaceList)return;
 recentList.replaceChildren();workspaceList.replaceChildren();
 root.querySelector("#emInboxCount").textContent=String(inbox().length);
 root.querySelector("#emRecentHeading").style.display=first.length?"":"none";
 first.slice(0,5).forEach(b=>recentList.appendChild(listBoardRow(b,false)));
 boards.forEach(b=>workspaceList.appendChild(listBoardRow(b,true)));
 if(!boards.length)workspaceList.append(n("div","em-empty","Aucun tableau trouvé."));
}
function openInboxEditor(){
 showSheet("Ajouter à la boîte de réception",body=>{
 const input=n("input");input.type="text";input.placeholder="Titre de la nouvelle carte";input.maxLength=160;input.setAttribute("aria-label","Titre de la carte");
 const desc=n("input");desc.type="text";desc.placeholder="Description (facultatif)";
 const actions=n("div","em-sheet-actions");const submit=button("Ajouter la carte","em-blue-action",()=>{
 const title=input.value.trim();if(!title){input.focus();return}
 inbox().unshift({id:uuid(),title,description:desc.value.trim(),createdAt:new Date().toISOString()});
 touchData();closeSheet();render();
 });
 actions.append(submit);body.append(input,desc,actions);setTimeout(()=>input.focus(),60);
 });
}
function moveInboxCard(item){
 showSheet("Ranger cette carte dans un tableau",body=>{
 const select=n("select");const boards=allBoards();boards.forEach(b=>{const o=n("option",null,b.name);o.value=b.id;select.appendChild(o)});
 const done=button("Déplacer la carte","em-blue-action",()=>{
 const b=boards.find(x=>x.id===select.value);if(!b||!b.lanes?.length){alert("Ajoute d'abord une liste à ce tableau.");return}
 b.cards.push({id:uuid(),lane:b.lanes[0].id,title:item.title,description:item.description||"",tag:"",due:"",checks:[],links:[],comments:"",archived:false});
 data.inbox=inbox().filter(x=>x.id!==item.id);touchData();closeSheet();openBoard(b.id);
 });body.append(select,done);
 });
}
function renderInbox(){
 root.innerHTML="";const shell=n("div","em-screen");shell.appendChild(header("Boîte de réception"));const scroll=n("div","em-scroll");
 const intro=n("div","em-section-card");intro.append(n("h2",null,"Mes idées à organiser"));intro.append(n("p",null,"Capture rapidement une idée, puis range-la dans le tableau ELOAH qui convient."));
 intro.appendChild(button("+ Ajouter une carte","em-blue-action",openInboxEditor));scroll.append(intro);
 for(const item of inbox()){
 const card=n("div","em-section-card");card.append(n("h2",null,item.title));if(item.description)card.append(n("p",null,item.description));card.appendChild(button("Ranger dans un tableau →","em-action",()=>moveInboxCard(item)));scroll.append(card);
 }
 if(!inbox().length)scroll.append(n("div","em-empty","Ta boîte de réception est vide pour le moment."));
 shell.append(scroll);root.append(shell);footer("inbox");
}
function goToCard(b,c){
 chosenBoardId=b.id;data.active=b.id;openCard(c.id); // le dialogue ELOAH reste le même sur ordinateur et sur téléphone
}
function renderAgenda(){
 root.innerHTML="";const shell=n("div","em-screen");shell.appendChild(simpleHeader("Agenda"));
 const scroll=n("div","em-scroll");
 const cards=allBoards().flatMap(b=>(b.cards||[]).filter(c=>!c.archived&&c.due).map(c=>({board:b,card:c}))).sort((a,b)=>a.card.due.localeCompare(b.card.due));
 const head=n("div","em-section-card");head.append(n("h2",null,"Échéances de mes projets"));head.append(n("p",null,cards.length+" cartes avec une date, dans tous tes tableaux."));scroll.append(head);
 for(const item of cards){
 const card=n("div","em-section-card");card.append(n("h2",null,item.card.title));card.append(n("div","em-mini",item.board.name+" · "+item.card.due));
 card.append(button("Ouvrir la carte →","em-action",()=>goToCard(item.board,item.card)));scroll.append(card);
 }
 if(!cards.length)scroll.append(n("div","em-empty","Aucune échéance enregistrée."));
 shell.append(scroll);root.append(shell);footer("agenda");
}
function renderActivity(){
 root.innerHTML="";const shell=n("div","em-screen");shell.appendChild(simpleHeader("Activité"));const scroll=n("div","em-scroll");
 const events=allBoards().flatMap(b=>(b.cards||[]).flatMap(c=>(c.thread||[]).map(t=>({board:b,card:c,event:t}))))
 .filter(x=>x.event?.at).sort((a,b)=>b.event.at.localeCompare(a.event.at)).slice(0,70);
 const head=n("div","em-section-card");head.append(n("h2",null,"Commentaires récents"));head.append(n("p",null,"Activité datée provenant des cartes ELOAH, sans événements inventés."));scroll.append(head);
 for(const item of events){
 const box=n("div","em-section-card");box.append(n("h2",null,item.card.title));
 box.append(n("p",null,item.event.text||"Commentaire"));box.append(n("div","em-mini",item.board.name+" · "+new Date(item.event.at).toLocaleString("fr-FR")));
 box.appendChild(button("Voir la carte →","em-action",()=>goToCard(item.board,item.card)));scroll.append(box);
 }
 if(!events.length)scroll.append(n("div","em-empty","Aucun commentaire daté pour le moment."));
 shell.append(scroll);root.append(shell);footer("activity");
}
function renderAccount(){
 root.innerHTML="";const shell=n("div","em-screen");shell.appendChild(simpleHeader("Compte"));const scroll=n("div","em-scroll");
 const cloudBox=n("div","em-section-card");cloudBox.append(n("h2",null,"Mon espace ELOAH"));
 cloudBox.append(n("p",null,document.getElementById("cloudStatus")?.textContent||"État de la synchronisation à vérifier."));
 const emailInput=n("input");emailInput.type="email";emailInput.placeholder="Mon adresse e-mail";
 emailInput.style.cssText="width:100%;padding:11px;border:1px solid #ddd;border-radius:10px";
 if(!document.getElementById("cloudLogin")?.hidden){
 cloudBox.append(emailInput);
 cloudBox.append(button("Recevoir un lien de connexion","em-action",()=>{
 const email=emailInput.value.trim();if(!email){emailInput.focus();return}
 document.getElementById("cloudEmail").value=email;document.getElementById("cloudLogin").click();
 }));
 }else{
 cloudBox.append(button("Sauvegarder vers Supabase","em-action",()=>document.getElementById("cloudUpload")?.click()));
 cloudBox.append(button("Récupérer mes tableaux","em-action",()=>document.getElementById("cloudDownload")?.click()));
 cloudBox.append(button("Déconnexion","em-action",()=>document.getElementById("cloudLogout")?.click()));
 }
 scroll.append(cloudBox);
 const links=n("div","em-section-card");links.append(n("h2",null,"Mes outils"));for(const [label,url] of [["Tous mes projets","mes-univers.html"],["Mon espace personnel","eloah-espace-prive.html"],["Toutes mes cartes","eloah-trello-toutes-cartes.html"],["Mes sauvegardes","eloah-trello-sauvegardes.html"],["Importer depuis Trello","eloah-trello-import.html"]]){const a=n("a","em-action",label+" ↗");a.href=url;links.append(a)}
 scroll.append(links);shell.append(scroll);root.append(shell);footer("account");
}
function boardHeader(b){
 const head=n("div","em-board-head");head.append(iconButton("x","Revenir aux tableaux","em-board-close",()=>show("home")));
 const identity=n("div","em-board-identity");identity.append(n("strong",null,b.name),n("small",null,"ELOAH · Boards"));head.append(identity);
 head.append(iconButton("more","Options du tableau",null,showBoardSettings));
 return head;
}
function showCard(b,c){
 data.active=b.id;chosenBoardId=b.id;openCard(c.id);
}
function renderBoard(){
 const b=selected();if(!b){show("home");return}
 const prev=root.querySelector("#emRail")?.scrollLeft||0;
 root.innerHTML="";
 const screenEl=n("div","em-screen em-board-screen"+(overview?" em-overview":""));
 const wall=n("div","em-wallpaper");decorateBackground(wall,b);screenEl.append(wall,boardHeader(b));
 if(boardFilter){const tag=n("div","em-filter-chip");tag.append(n("span",null,"Filtre : "+boardFilter));tag.append(button("Effacer",null,()=>{boardFilter="";renderBoard()}));screenEl.append(tag)}
 const rail=n("div","em-lanes");rail.id="emRail";rail.setAttribute("aria-label","Listes du tableau · faire défiler horizontalement");
 const lanes=b.lanes||[];
 lanes.forEach((lane,li)=>{
 const panel=n("section","em-lane");panel.setAttribute("aria-label",lane.name);
 const head=n("div","em-lane-header");head.append(n("h2",null,lane.name));
 const cards=(b.cards||[]).filter(c=>c.lane===lane.id&&!c.archived&&(!boardFilter||c.tag===boardFilter));
 head.append(n("span","em-lane-count",String(cards.length)));
 head.append(iconButton("more","Options de la liste "+lane.name,"em-more",()=>showListSettings(b,lane)));
 panel.appendChild(head);
 cards.forEach(c=>{
 const card=n("article","em-card");
 if(c.cover&&/^https:\/\//i.test(c.cover)){const cover=n("div","em-card-cover");cover.style.backgroundImage='url('+JSON.stringify(c.cover)+')';card.append(cover)}
 const row=n("div","em-card-header");
 const checked=!!c.complete;
 const toggle=iconButton("check","Marquer comme "+(checked?"à faire":"terminée"),"em-check-toggle",()=>{c.complete=!c.complete;touchData()});
 toggle.setAttribute("aria-pressed",String(checked));if(!checked)toggle.innerHTML="";
 row.append(toggle);
 row.append(button(c.title||"Sans titre","em-card-title"+(checked?" em-done":""),()=>showCard(b,c)));
 card.append(row);
 const meta=n("div","em-card-meta");
 if(c.due){const due=n("span","em-due"+(c.due>=new Date().toISOString().slice(0,10)?" em-due-later":""));due.innerHTML=ico("clock");due.append(n("span",null,new Date(c.due+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})));meta.append(due)}
 if((c.description||"").length){const d=n("span","em-meta");d.innerHTML=ico("list");meta.append(d)}
 if(c.checks?.length){const val=n("span","em-meta");val.innerHTML=ico("check");val.append(n("span",null,c.checks.filter(i=>i.done).length+"/"+c.checks.length));meta.append(val)}
 if(c.links?.length){const attach=n("span","em-meta");attach.innerHTML=ico("paperclip");attach.append(n("span",null,String(c.links.length)));meta.append(attach)}
 if(c.thread?.length)meta.append(n("span","em-meta","💬 "+c.thread.length));
 if(meta.children.length)card.append(meta);
 panel.append(card);
 });
 const add=button("+ Ajouter une carte","em-add-card",()=>{data.active=b.id;openCard(null,lane.id)});
 panel.append(add);rail.appendChild(panel);
 });
 const addList=n("section","em-lane");addList.style.minHeight="80px";
 addList.append(button("+ Ajouter une liste","em-add-card",()=>addLaneToBoard(b)));rail.appendChild(addList);
 screenEl.append(rail);
 if(!overview){
 const dots=n("div","em-board-dots");dots.id="emDots";
 for(let i=0;i<lanes.length+1;i++){const dot=n("span","em-dot"+(i===activeColumn?" active":""));dots.append(dot)}screenEl.append(dots);
 rail.addEventListener("scroll",()=>{const first=rail.querySelector(".em-lane");const step=(first?.getBoundingClientRect().width||window.innerWidth*.84)+12;activeColumn=Math.max(0,Math.min(lanes.length,Math.round(rail.scrollLeft/step)));dots.querySelectorAll(".em-dot").forEach((dot,i)=>dot.classList.toggle("active",i===activeColumn))},{passive:true});
 }
 const tools=n("div","em-board-tools");const cluster=n("div","em-toolcluster");
 cluster.append(iconButton("filter","Filtrer les cartes","em-tool",()=>showFilterSettings(b)));
 cluster.append(iconButton("bell","Mes échéances","em-tool",()=>show("agenda")));
 cluster.append(iconButton("settings","Paramètres du tableau","em-tool",showBoardSettings));
 tools.append(cluster,iconButton("expand",overview?"Revenir au défilement horizontal":"Afficher toutes les colonnes","em-expand",()=>{overview=!overview;activeColumn=0;renderBoard()}));screenEl.append(tools);
 root.appendChild(screenEl);
 if(!overview&&prev){requestAnimationFrame(()=>{const target=root.querySelector("#emRail");if(target)target.scrollLeft=prev})}
}
function addLaneToBoard(b){
 const name=prompt("Nom de la nouvelle liste");if(!name?.trim())return;
 b.lanes.push({id:uuid(),name:name.trim()});touchData();renderBoard();
}
function showSheet(title,builder){
 closeSheet();
 const backdrop=n("div","em-sheet-backdrop");backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeSheet()});
 const sheet=n("div","em-sheet");sheet.setAttribute("role","dialog");sheet.setAttribute("aria-label",title);
 const head=n("div");head.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:12px";
 head.append(n("h2",null,title),iconButton("x","Fermer",null,closeSheet));
 sheet.appendChild(head);builder(sheet);backdrop.appendChild(sheet);root.appendChild(backdrop);
}
function closeSheet(){root?.querySelector(".em-sheet-backdrop")?.remove()}
function showListSettings(b,lane){
 showSheet(lane.name,body=>{
 body.append(button("Renommer cette liste","em-sheet-row",()=>{
 const name=prompt("Nouveau nom",lane.name);
 if(!name?.trim())return;lane.name=name.trim();touchData();closeSheet();renderBoard();
 }));
 body.append(button("Ajouter une carte","em-sheet-row",()=>{closeSheet();data.active=b.id;openCard(null,lane.id)}));
 body.append(button("Supprimer la liste si elle est vide","em-sheet-row",()=>{
 if(b.cards.some(c=>c.lane===lane.id)){alert("Cette liste contient des cartes. Déplace-les avant sa suppression.");return}
 if(!confirm("Supprimer cette liste vide ?"))return;b.lanes=b.lanes.filter(l=>l.id!==lane.id);touchData();closeSheet();renderBoard();
 }));
 });
}
function showFilterSettings(b){
 showSheet("Filtrer les cartes",body=>{
 const tags=["","Urgent","Important","Création","Administratif","Publication","Suivi"];
 for(const tag of tags){body.append(button(tag||"Toutes les cartes","em-sheet-row",()=>{boardFilter=tag;activeColumn=0;closeSheet();renderBoard()}))}
 });
}
function showBoardSettings(){
 const b=selected();if(!b)return;
 showSheet("Paramètres du tableau",body=>{
 body.append(button("Renommer ce tableau","em-sheet-row",()=>{const name=prompt("Nom du tableau",b.name);if(!name?.trim())return;b.name=name.trim();touchData();closeSheet();renderBoard()}));
 body.append(button("Ajouter une liste","em-sheet-row",()=>{closeSheet();addLaneToBoard(b)}));
 body.append(button("Changer le fond d’écran","em-sheet-row",()=>showThemes(b)));
 const copy=n("a","em-sheet-row","Mes sauvegardes ↗");copy.href="eloah-trello-sauvegardes.html";body.append(copy);
 });
}
function showThemes(b){
 showSheet("Fond d’écran · "+b.name,body=>{
 const grid=n("div","em-color-grid");
 const arr=typeof themes!=="undefined"?themes:[
 ["Noir & or","linear-gradient(135deg,#080808,#b09455)"],["Bleu nuit","linear-gradient(135deg,#142c55,#6178b7)"],["Crème","linear-gradient(135deg,#eee2d5,#d3bdac)"]
 ];
 arr.forEach(pair=>{const choose=button(pair[0],"em-color",()=>{setTheme(pair[1]);closeSheet();renderBoard()});choose.style.background=pair[1];grid.append(choose)});
 body.append(grid);
 const label=n("p","em-mini","Ou utilise l’adresse HTTPS d’une image :");body.append(label);
 const field=n("input");field.type="url";field.placeholder="https://…";body.append(field);
 body.append(button("Appliquer l’image","em-blue-action",()=>{const url=field.value.trim();try{if(new URL(url).protocol!=="https:")throw Error("HTTPS requis");setTheme(url);closeSheet();renderBoard()}catch(e){alert("Entre une URL d’image HTTPS valide.")}}));
 });
}
function render(){if(!root||!mq.matches)return;const current=document.activeElement;if(current?.matches?.("#editor input,#editor textarea,#editor select"))return;
 if(screen==="home")renderHome();else if(screen==="board")renderBoard();else if(screen==="inbox")renderInbox();else if(screen==="agenda")renderAgenda();else if(screen==="activity")renderActivity();else if(screen==="account")renderAccount();else renderHome();
}
window.addEventListener("eloah:boards-updated",()=>{if(root&&mq.matches)requestAnimationFrame(render)});
window.addEventListener("storage",e=>{if(e.key==="eloah-boards-v1"&&root&&mq.matches)requestAnimationFrame(render)});
const observer=new MutationObserver(()=>{if(screen==="account"&&root&&mq.matches)renderAccount()});
const status=document.getElementById("cloudStatus");if(status)observer.observe(status,{childList:true,characterData:true,subtree:true});
mq.addEventListener?.("change",()=>{if(mq.matches)mount();else if(root)root.style.display="none";if(root&&mq.matches)root.style.display=""});
if(mq.matches)mount();
})();