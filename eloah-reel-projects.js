(()=>{
'use strict';
/* ELOAH Projets : bibliothèque locale privée, indépendante des créations privées Canva.
   Les sauvegardes persistantes utilisent IndexedDB; aucun média personnel n'est publié dans GitHub Pages. */
const DEFAULT_FOLDERS=[
 ['f-etsy','P&G — ETSY FACTORY','Power & Glam'],
 ['f-crew','The Crew Orchies','The Crew Orchies'],
 ['f-glam','Power & Glam','Power & Glam'],
 ['f-eloah','ELOAH Studio','ELOAH'],
 ['f-velka','Sonia Velka','Sonia Velka'],
 ['f-parisis','PARISIS Engine','PARISIS Engine'],
 ['f-foi','Foi & spiritualité','Foi & spiritualité'],
 ['f-lion','Le Lion Blanc','Le Lion Blanc']
];
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const normalize=s=>String(s||'').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const safeName=s=>String(s||'').trim().slice(0,90);
const unique=prefix=>prefix+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
const humanDate=timestamp=>{
 try{return new Date(timestamp).toLocaleDateString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch{return 'Récemment'}
};
function create(config){
 const state={view:'all',folder:null,search:'',menu:null,loading:true,saving:false,flash:'',page:48,sort:'recent',storage:'initialisation'};
 let lastId=null;try{lastId=localStorage.getItem('eloah_active_reel_project')}catch{}
 let db=null,projects=[],folders=[],currentId=lastId,autosaveTimer=null,mutation=Promise.resolve(),busy=false;
 function recordActive(id){currentId=id;try{if(id)localStorage.setItem('eloah_active_reel_project',id);else localStorage.removeItem('eloah_active_reel_project')}catch{}}
 const currentProject=()=>projects.find(p=>p.id===currentId);
 const lookupFolder=id=>folders.find(f=>f.id===id);
 const folderTitle=id=>lookupFolder(id)?.name||'Sans dossier';
 const folderOfCurrent=()=>{
  const name=normalize(config.getName()),brand=normalize(config.getBrand());
  if(name.includes('etsy'))return 'f-etsy';
  if(brand.includes('crew'))return 'f-crew';
  if(brand.includes('velka'))return 'f-velka';
  if(brand.includes('parisis'))return 'f-parisis';
  if(brand.includes('foi'))return 'f-foi';
  if(brand.includes('lion'))return 'f-lion';
  if(brand.includes('power')||brand.includes('glam'))return 'f-glam';
  return 'f-eloah';
 };
 function refresh(){if(config.getActiveTab()==='projects')config.refresh()}
 function notify(message){state.flash=message;config.toast(message);refresh()}
 function dbOpen(){
  if(!('indexedDB' in window))return Promise.resolve(null);
  return new Promise(resolve=>{
   try{
    const request=indexedDB.open('eloah_reel_projects_v1',1);
    request.onupgradeneeded=()=>{const database=request.result;
     if(!database.objectStoreNames.contains('designs'))database.createObjectStore('designs',{keyPath:'id'});
     if(!database.objectStoreNames.contains('folders'))database.createObjectStore('folders',{keyPath:'id'});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>resolve(null);
    request.onblocked=()=>resolve(null);
   }catch{resolve(null)}
  });
 }
 function dbRead(store){
  if(!db)return Promise.resolve([]);
  return new Promise(resolve=>{
   try{const tx=db.transaction(store,'readonly');const req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>resolve([]);
   }catch{resolve([])}
  });
 }
 function dbWrite(store,verb,value){
  if(!db)return Promise.resolve(false);
  return new Promise(resolve=>{
   try{
    const tx=db.transaction(store,'readwrite');
    const object=tx.objectStore(store);if(verb==='delete')object.delete(value);else object.put(value);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false);
   }catch{resolve(false)}
  });
 }
 function queueWrite(op){
  mutation=mutation.catch(()=>{}).then(op);
  return mutation;
 }
 function orderedDesigns(){
  const arr=projects.filter(p=>{
   if(state.view==='favorites'&&!p.favorite)return false;
   if(state.view==='folder'&&p.folderId!==state.folder)return false;
   if(state.brandScope&&p.brand!==state.brandScope)return false;
   if(state.search&&!normalize(p.name+' '+folderTitle(p.folderId)+' '+p.brand).includes(normalize(state.search)))return false;
   return true;
  });
  if(state.sort==='az')arr.sort((a,b)=>a.name.localeCompare(b.name,'fr'));
  else arr.sort((a,b)=>b.updatedAt-a.updatedAt);
  return arr;
 }
 function buttons(){
  return '<div class="ecs-project-top"><label for="ecs-project-search">⌕</label><input id="ecs-project-search" type="search" placeholder="Recherche dans votre contenu" aria-label="Rechercher dans mes créations et dossiers" value="'+escapeHTML(state.search)+'"></div>'+
   '<div class="ecs-project-scope"><span>◉ Vos projets ELOAH</span><select id="ecs-project-brand-scope" aria-label="Filtrer les projets par domaine">'+
   '<option value="" '+(!state.brandScope?'selected':'')+'>Tous les univers</option>'+
   [...new Set([...folders.map(f=>f.brand),...projects.map(p=>p.brand)].filter(Boolean))].map(name=>'<option value="'+escapeHTML(name)+'" '+(state.brandScope===name?'selected':'')+'>'+escapeHTML(name)+'</option>').join('')+
   '</select></div>'+
   '<div class="ecs-project-tabs" role="tablist" aria-label="Type de contenu">'+
   [['all','Tout'],['designs','Designs'],['folders','Dossiers'],['images','Images'],['videos','Vidéos']].map(([id,label])=>
    '<button type="button" role="tab" data-project-view="'+id+'" aria-selected="'+(state.view===id||state.view==='folder'&&id==='folders')+'" class="'+(state.view===id||state.view==='folder'&&id==='folders'?'active':'')+'">'+label+'</button>').join('')+'</div>'+
   '<div class="ecs-project-sortbar"><button type="button" data-project-favorites>☆ Favoris · '+projects.filter(p=>p.favorite).length+'</button>'+
   '<label>Classer <select id="ecs-project-sort"><option value="recent" '+(state.sort==='recent'?'selected':'')+'>Plus récents</option>'+
   '<option value="az" '+(state.sort==='az'?'selected':'')+'>Nom A → Z</option></select></label></div>';
 }
 function thumbnail(p){
  if(typeof p.thumbnail==='string'&&p.thumbnail.startsWith('data:image/'))return '<img src="'+p.thumbnail+'" alt="Aperçu de '+escapeHTML(p.name)+'" loading="lazy">';
  return '<span class="ecs-project-placeholder"><span>▦</span>'+escapeHTML((p.brand||'ELOAH').slice(0,28))+'</span>';
 }
 function card(p){
  const active=p.id===currentId;
  const menu=state.menu===p.id;
  return '<article class="ecs-project-card'+(active?' is-current':'')+'" data-project-item="'+escapeHTML(p.id)+'">'+
   '<button type="button" class="ecs-project-thumbnail" data-project-open="'+escapeHTML(p.id)+'" title="Ouvrir '+escapeHTML(p.name)+'">'+
   '<span class="ecs-project-privacy">Privé</span>'+thumbnail(p)+'</button>'+
   '<div class="ecs-project-card-title"><button type="button" data-project-open="'+escapeHTML(p.id)+'" title="Ouvrir le projet">'+escapeHTML(p.name)+'</button>'+
   '<button type="button" data-project-menu="'+escapeHTML(p.id)+'" aria-label="Options du projet" aria-expanded="'+menu+'">⋯</button></div>'+
   '<div class="ecs-project-card-details"><small>Reel Instagram · 1080 × 1920</small><small>'+humanDate(p.updatedAt)+'</small></div>'+
   (menu?'<div class="ecs-project-card-menu">'+
    '<button data-project-action="open" data-id="'+p.id+'">↗ Ouvrir</button>'+
    '<button data-project-action="favorite" data-id="'+p.id+'">'+(p.favorite?'☆ Retirer des favoris':'★ Ajouter aux favoris')+'</button>'+
    '<button data-project-action="rename" data-id="'+p.id+'">✎ Renommer</button>'+
    '<button data-project-action="duplicate" data-id="'+p.id+'">▦ Dupliquer</button>'+
    '<button data-project-action="move" data-id="'+p.id+'">▣ Changer de dossier</button>'+
    '<button data-project-action="download" data-id="'+p.id+'">↓ Exporter JSON</button>'+
    '<button data-project-action="remove" data-id="'+p.id+'">× Supprimer</button></div>':'')+
   '</article>';
 }
 function cardsSection(title,designs,full=false){
  return '<section class="ecs-project-section"><div class="ecs-sectiontitle"><strong>'+escapeHTML(title)+'</strong>'+
   (full?'':'<button data-project-view="designs">Afficher tout →</button>')+'</div>'+
   (designs.length?'<div class="ecs-project-grid">'+designs.map(card).join('')+'</div>':'<p class="ecs-note">Aucun design enregistré dans cette collection.</p>')+'</section>';
 }
 function designList(){
  const filtered=orderedDesigns().slice(0,state.page);
  let intro='<div class="ecs-project-heading"><strong>'+escapeHTML(state.view==='folder'?folderTitle(state.folder):'Mes designs')+'</strong><small>'+orderedDesigns().length+' projet(s)</small></div>';
  if(state.view==='folder')intro+='<button class="ecs-project-back" data-project-view="folders">← Tous les dossiers</button>';
  let html=intro;
  if(!projects.length)html+='<div class="ecs-project-empty"><span>▦</span><strong>Ton premier design ELOAH</strong><p>Ton Reel actuel est prêt à être enregistré. Clique sur « Enregistrer dans Projets » pour le retrouver ici.</p></div>';
  html+=cardsSection(state.view==='folder'?'Designs dans ce dossier':'Designs',filtered,true);
  if(orderedDesigns().length>state.page)html+='<button class="ecs-project-more" data-project-more>Afficher '+Math.min(48,orderedDesigns().length-state.page)+' autres →</button>';
  return html;
 }
 function folderCard(f){
  const count=projects.filter(p=>p.folderId===f.id).length;
  return '<div class="ecs-project-folder-row"><button type="button" class="ecs-project-folder" data-project-folder="'+escapeHTML(f.id)+'">'+
   '<span class="ecs-project-folder-icon">▣</span><span class="ecs-project-folder-info"><strong>'+escapeHTML(f.name)+'</strong><small>'+count+' design'+(count===1?'':'s')+'</small></span>'+
   '<span>›</span></button><button type="button" class="ecs-project-folder-options" data-project-folder-menu="'+escapeHTML(f.id)+'" title="Options du dossier">⋯</button></div>'+
   (state.menu===f.id?'<div class="ecs-project-folder-menu"><button data-project-folder-action="rename" data-id="'+f.id+'">Renommer</button>'+
    '<button data-project-folder-action="remove" data-id="'+f.id+'">Supprimer le dossier</button></div>':'');
 }
 function folderList(){
  const found=folders.filter(f=>!state.search||normalize(f.name).includes(normalize(state.search)));
  return '<section class="ecs-project-section"><div class="ecs-sectiontitle"><strong>Dossiers</strong><span>'+folders.length+'</span></div>'+
   '<button class="ecs-project-newfolder" data-project-new-folder><span>＋</span> Créer un dossier</button>'+
   '<button class="ecs-project-folder" data-project-favorites><span class="ecs-project-folder-icon favorite">☆</span>'+
   '<span class="ecs-project-folder-info"><strong>Favoris</strong><small>'+projects.filter(p=>p.favorite).length+' projet(s)</small></span><span>›</span></button>'+
   found.map(folderCard).join('')+'</section>';
 }
 function mediaPanel(kind){
  const data=(config.getMedia?.(kind)||[]).filter(item=>!state.search||normalize(item.title+' '+item.domain+' '+item.album).includes(normalize(state.search)));
  const label=kind==='image'?'Images':'Vidéos';
  const limit=24;
  return '<div class="ecs-project-heading"><strong>'+label+'</strong><small>'+data.length+' ressource(s) répertoriée(s)</small></div>'+
   '<p class="ecs-note">Les médias des domaines ELOAH sont dans Importer. Tu peux les retrouver et les ajouter au Reel sans les enregistrer comme un nouveau design.</p>'+
   '<button class="ecs-project-primary" data-project-media-open="'+kind+'">↗ Ouvrir '+(kind==='image'?'Importer → Images':'Importer → Vidéos')+'</button>'+
   (data.length?'<div class="ecs-project-media-grid">'+data.slice(0,limit).map(item=>
    '<button class="ecs-project-media-card" data-project-media="'+escapeHTML(item.id)+'" data-media-kind="'+kind+'" title="'+escapeHTML(item.title)+'">'+
    (item.thumb?'<img src="'+escapeHTML(item.thumb)+'" loading="lazy" alt="">':'<span>▶</span>')+
    '<small>'+escapeHTML(item.title)+'</small></button>').join('')+'</div>':'<p class="ecs-note">Aucun média accessible dans cette rubrique. Importe tes propres fichiers dans Importer.</p>');
 }
 function panel(){
  const current=currentProject();
  const count=projects.length;
  let inner='';
  if(state.view==='all'){
   inner='<section class="ecs-project-section">'+
    '<div class="ecs-sectiontitle"><strong>Design en cours</strong></div>'+
    '<div class="ecs-project-current"><div><strong>'+escapeHTML(config.getName()||'Mon Reel')+'</strong>'+
    '<small>'+escapeHTML(config.getBrand())+' · '+(current?'Enregistré':'Non encore enregistré dans Projets')+'</small></div>'+
    '<button type="button" data-project-save-current>Enregistrer</button></div></section>'+
    (count?cardsSection('Designs',orderedDesigns().slice(0,6)):cardsSection('Designs',[]))+
    folderList();
  }else if(state.view==='designs'||state.view==='folder'||state.view==='favorites'){inner=designList()}
  else if(state.view==='folders'){inner=folderList()}
  else if(state.view==='images'){inner=mediaPanel('image')}
  else if(state.view==='videos'){inner=mediaPanel('video')}
  return '<div class="ecs-projects-ui">'+buttons()+
   '<div class="ecs-project-toolbar"><button type="button" class="ecs-project-primary" data-project-save-current>▣ Enregistrer dans Projets</button>'+
   '<button type="button" data-project-new>＋ Nouveau</button><button type="button" data-project-import>↑ Importer JSON</button></div>'+
   (state.loading?'<div class="ecs-note">Ouverture des projets enregistrés…</div>':inner)+
   '<div class="ecs-project-note">'+
   '<p>'+escapeHTML(state.storage==='ready'?'Sauvegarde locale sur cet appareil. L’enregistrement automatique reprend après avoir créé ou ouvert un projet.':'Stockage de projets indisponible : conserve une sauvegarde JSON sur ton appareil.')+
   ' Les designs privés de Canva ne sont pas importés automatiquement.</p>'+
   '<button type="button" data-project-download-current>↓ Exporter le Reel en JSON</button>'+
   (state.flash?'<small>'+escapeHTML(state.flash)+'</small>':'')+'</div></div>';
 }
 async function saveCurrent({auto=false,forceNew=false,targetFolder=null}={}){
  if(busy||state.loading)return;
  busy=true;state.saving=true;if(!auto)refresh();
  try{
   const name=safeName(config.getName())||'Mon Reel',existing=!forceNew?currentProject():null;
   const record=await config.capture({quick:auto});
   if(!record||!record.data?.elements)throw Error('Projet non prêt à être enregistré');
   const updated={id:existing?.id||unique('design-'),name,
    brand:config.getBrand()||'',favorite:!!existing?.favorite,folderId:targetFolder||existing?.folderId||(state.view==='folder'?state.folder:folderOfCurrent()),
    createdAt:existing?.createdAt||Date.now(),updatedAt:Date.now(),
    thumbnail:record.thumbnail||existing?.thumbnail||null,
    data:record.data,
    videoBlob:record.videoBlob||(auto&&record.data.videoName&&existing?.data?.videoName===record.data.videoName?existing.videoBlob:null)||null,
    audioBlob:record.audioBlob||(auto&&record.data.audioName&&existing?.data?.audioName===record.data.audioName?existing.audioBlob:null)||null,
    warnings:record.warnings||[]};
   // L'enregistrement reste en mémoire en cas de blocage du navigateur ; avertir explicitement.
   const ok=await queueWrite(()=>dbWrite('designs','put',updated));
   const index=projects.findIndex(p=>p.id===updated.id);
   if(index>=0)projects[index]=updated;else projects.unshift(updated);
   recordActive(updated.id);
   if(!auto)notify(ok?'Projet « '+updated.name+' » enregistré.':'Stockage indisponible : projet disponible uniquement dans cette session. Exporte-le en JSON.');
  }catch(e){if(!auto)notify('Enregistrement impossible : '+e.message)}
  finally{busy=false;state.saving=false;if(!auto)refresh()}
 }
 function scheduleAutoSave(){
  if(!currentId||state.loading||busy)return;
  if(autosaveTimer)clearTimeout(autosaveTimer);
  autosaveTimer=setTimeout(()=>{autosaveTimer=null;saveCurrent({auto:true})},1800);
 }
 async function openDesign(id){
  if(busy)return;
  if(autosaveTimer){clearTimeout(autosaveTimer);autosaveTimer=null;await saveCurrent({auto:true})}
  const p=projects.find(x=>x.id===id);if(!p)return;
  busy=true;
  try{
   if(autosaveTimer){clearTimeout(autosaveTimer);autosaveTimer=null}
   const okay=await config.open(p.data,p);
   if(okay!==false){recordActive(p.id);state.menu=null;notify('Projet « '+p.name+' » ouvert.')}
  }catch(e){notify('Impossible d’ouvrir : '+e.message)}
  finally{busy=false}
 }
 async function makeFolder(){
  const name=safeName(prompt('Nom du nouveau dossier :',''));
  if(!name)return;
  if(folders.some(f=>normalize(f.name)===normalize(name)))return notify('Ce dossier existe déjà.');
  const f={id:unique('folder-'),name,createdAt:Date.now()};
  const ok=await queueWrite(()=>dbWrite('folders','put',f));
  folders.push(f);notify(ok?'Dossier '+name+' créé.':'Dossier créé dans cette session uniquement.');
  state.view='folder';state.folder=f.id;refresh();
 }
 async function folderAction(id,action){
  const f=lookupFolder(id);if(!f)return;
  if(action==='rename'){
   const name=safeName(prompt('Nouveau nom du dossier :',f.name));if(!name)return;
   f.name=name;await queueWrite(()=>dbWrite('folders','put',f));notify('Dossier renommé.');
  }
  if(action==='remove'){
   if(!confirm('Supprimer le dossier « '+f.name+' » ? Les designs seront conservés sans dossier.'))return;
   for(const p of projects.filter(p=>p.folderId===id)){p.folderId=null;await queueWrite(()=>dbWrite('designs','put',p))}
   folders=folders.filter(x=>x.id!==id);
   await queueWrite(()=>dbWrite('folders','delete',id));
   if(state.folder===id){state.view='folders';state.folder=null}
   notify('Dossier supprimé, designs conservés.');
  }
  state.menu=null;refresh();
 }
 async function designAction(id,action){
  const p=projects.find(x=>x.id===id);if(!p)return;
  if(action==='open')return openDesign(id);
  if(action==='download')return config.exportJSON(p.data,p);
  if(action==='rename'){
   const name=safeName(prompt('Nom du design :',p.name));if(!name)return;p.name=name;
   if(id===currentId)config.setName?.(name);
  }else if(action==='favorite')p.favorite=!p.favorite;
  else if(action==='duplicate'){
   const copy={...p,id:unique('design-'),name:p.name+' · copie',createdAt:Date.now(),updatedAt:Date.now(),favorite:false};
   const ok=await queueWrite(()=>dbWrite('designs','put',copy));projects.unshift(copy);state.menu=null;
   return notify(ok?'Copie du design créée.':'Copie disponible uniquement pour cette session.');
  }else if(action==='move'){
   const options=folders.map((f,i)=>i+1+' · '+f.name).join('\n');
   const choice=prompt('Déplacer ce design dans quel dossier ?\n0 · Sans dossier\n'+options,'0');
   if(choice===null)return;
   const idx=Number(choice);if(!Number.isInteger(idx)||idx<0||idx>folders.length)return notify('Dossier invalide.');
   p.folderId=idx?folders[idx-1].id:null;
  }else if(action==='remove'){
   if(!confirm('Supprimer définitivement le design « '+p.name+' » de ce navigateur ?'))return;
   const ok=await queueWrite(()=>dbWrite('designs','delete',id));projects=projects.filter(x=>x.id!==id);
   if(currentId===id)recordActive(null);state.menu=null;return notify(ok?'Design supprimé.':'Design retiré de la session ; vérifie le stockage local.');
  }else return;
  p.updatedAt=Date.now();await queueWrite(()=>dbWrite('designs','put',p));state.menu=null;notify('Design mis à jour.');
 }
 function matches(rootEvent,attr){return rootEvent.target.closest('['+attr+']')}
 function click(ev){
  const view=matches(ev,'data-project-view');if(view){state.view=view.dataset.projectView;state.folder=null;state.menu=null;state.page=48;refresh();return true}
  const folder=matches(ev,'data-project-folder');if(folder){state.folder=folder.dataset.projectFolder;state.view='folder';state.search='';state.menu=null;state.page=48;refresh();return true}
  const fav=matches(ev,'data-project-favorites');if(fav){state.view='favorites';state.folder=null;state.menu=null;refresh();return true}
  const folderMenu=matches(ev,'data-project-folder-menu');if(folderMenu){state.menu=state.menu===folderMenu.dataset.projectFolderMenu?null:folderMenu.dataset.projectFolderMenu;refresh();return true}
  const folderCmd=matches(ev,'data-project-folder-action');if(folderCmd){folderAction(folderCmd.dataset.id,folderCmd.dataset.projectFolderAction);return true}
  const designOpen=matches(ev,'data-project-open');if(designOpen){openDesign(designOpen.dataset.projectOpen);return true}
  const designMenu=matches(ev,'data-project-menu');if(designMenu){state.menu=state.menu===designMenu.dataset.projectMenu?null:designMenu.dataset.projectMenu;refresh();return true}
  const designCmd=matches(ev,'data-project-action');if(designCmd){designAction(designCmd.dataset.id,designCmd.dataset.projectAction);return true}
  if(matches(ev,'data-project-save-current')){saveCurrent();return true}
  if(matches(ev,'data-project-new-folder')){makeFolder();return true}
  if(matches(ev,'data-project-new')){if(config.newProject()!==false){recordActive(null);state.view='all';refresh()}return true}
  if(matches(ev,'data-project-import')){config.importJSON();return true}
  if(matches(ev,'data-project-download-current')){config.exportJSON();return true}
  const more=matches(ev,'data-project-more');if(more){state.page+=48;refresh();return true}
  const media=matches(ev,'data-project-media');if(media){config.openMedia?.(media.dataset.mediaKind,media.dataset.projectMedia);return true}
  const mediaOpen=matches(ev,'data-project-media-open');if(mediaOpen){config.openMediaTab?.(mediaOpen.dataset.projectMediaOpen);return true}
  return false;
 }
 function input(ev){
  if(ev.target.id!=='ecs-project-search')return false;
  state.search=ev.target.value;state.page=48;
  const cursor=ev.target.selectionStart;refresh();
  const next=config.root.querySelector('#ecs-project-search');
  if(next){next.focus();try{next.setSelectionRange(cursor,cursor)}catch{}}
  return true;
 }
 function change(ev){
  if(ev.target.id==='ecs-project-brand-scope'){state.brandScope=ev.target.value;state.page=48;refresh();return true}
  if(ev.target.id==='ecs-project-sort'){state.sort=ev.target.value==='az'?'az':'recent';state.page=48;refresh();return true}
  return false;
 }
 async function initialize(){
  db=await dbOpen();state.storage=db?'ready':'session';
  if(db){
   const [stored,listed]=await Promise.all([dbRead('designs'),dbRead('folders')]);
   projects=stored.filter(p=>p&&p.id&&p.data?.elements).sort((a,b)=>b.updatedAt-a.updatedAt);
   folders=listed.filter(f=>f&&f.id&&f.name);
  }
  if(!folders.length){
   folders=DEFAULT_FOLDERS.map(([id,name,brand])=>({id,name,brand,createdAt:Date.now()}));
   if(db)for(const f of folders)await dbWrite('folders','put',f);
  }
  if(currentId&&!projects.some(p=>p.id===currentId))recordActive(null);
  state.loading=false;refresh();
 }
 initialize().catch(e=>{state.loading=false;state.storage='session';notify('Chargement des projets indisponible : '+e.message)});
 return {render:panel,click,input,change,saveCurrent,openDesign,scheduleAutoSave,
  clearCurrent:()=>{recordActive(null);if(autosaveTimer)clearTimeout(autosaveTimer);autosaveTimer=null},
  getCurrentId:()=>currentId,count:()=>projects.length,
  state:()=>({...state,projects:projects.length,folders:folders.length})};
}
window.ELOAHReelProjects={create};
})();