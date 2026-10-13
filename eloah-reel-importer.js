(()=>{
'use strict';
/* Importer : galerie des médias publiés sur les domaines ELOAH et stockage local des propres fichiers. */
function create(options){
 const ctx=options,lib=window.ELOAHImportLibrary||{items:[],folders:[],byId:new Map()};
 const state={tab:'images',domain:'all',album:'all',query:'',limit:48,preview:null,uploadDomain:'eloah',storage:'initialisation'};
 let db=null,items=[],opBusy=false,uploadInput=null,recentIds=[];
 try{recentIds=JSON.parse(localStorage.getItem('eloah_reel_import_recent')||'[]').filter(x=>typeof x==='string').slice(0,25)}catch{}
 function rememberRecent(id){
  recentIds=[id,...recentIds.filter(x=>x!==id)].slice(0,25);
  try{localStorage.setItem('eloah_reel_import_recent',JSON.stringify(recentIds))}catch{}
 }
 const objUrls=new Map();
 const domNames=new Map(lib.folders.map(f=>[f.id,f.name]));
 const esc=x=>ctx.xss(String(x??''));
 const norm=x=>String(x||'').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const getLocal=id=>items.find(x=>x.id===id);
 const get=id=>getLocal(id)||lib.byId.get(id);
 const getSrc=item=>item?.local?(objUrls.get(item.id)||''):item?.url||'';
 const getThumb=item=>item?.local?getSrc(item):item?.thumb||item?.url||'';
 const isImage=item=>item.kind==='image';
 const albumTitles=()=>[...new Set(lib.items.filter(x=>x.domain===state.domain).map(x=>x.album).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
 const mediaCount=domain=>lib.items.filter(i=>i.domain===domain&&i.kind==='image').length+items.filter(i=>i.domain===domain&&i.kind==='image').length;
 const summary=(id)=>domNames.get(id)||'Mes fichiers';
 function update(){if(ctx.getActiveTab()==='import')ctx.refresh()}
 function openDB(){
  if(!window.indexedDB){state.storage='session';return Promise.resolve(null)}
  return new Promise(resolve=>{
   try{
    const req=indexedDB.open('eloah_reel_uploads_v1',1);
    req.onupgradeneeded=()=>{
     const database=req.result;if(!database.objectStoreNames.contains('media'))database.createObjectStore('media',{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>resolve(null);
    req.onblocked=()=>resolve(null);
   }catch{resolve(null)}
  });
 }
 function allDB(database){
  return new Promise(resolve=>{
   try{const tx=database.transaction('media','readonly'),q=tx.objectStore('media').getAll();q.onsuccess=()=>resolve(q.result||[]);q.onerror=()=>resolve([])}
   catch{resolve([])}
  });
 }
 function putDB(entry){
  if(!db)return Promise.resolve(false);
  return new Promise(resolve=>{
   try{const tx=db.transaction('media','readwrite');tx.objectStore('media').put(entry);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false)}
   catch{resolve(false)}
  });
 }
 function deleteDB(id){
  if(!db)return Promise.resolve(false);
  return new Promise(resolve=>{
   try{const tx=db.transaction('media','readwrite');tx.objectStore('media').delete(id);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)}
   catch{resolve(false)}
  });
 }
 function renderCard(item){
  const src=getThumb(item),owner=item.local?'Mon fichier':item.source;
  const name=item.title||item.name||'Visuel',domain=summary(item.domain);
  return '<article class="ecs-import-card" data-search="'+esc(norm(name+' '+domain+' '+item.album+' '+owner+' '+item.alt))+'">'+
   '<button class="ecs-import-card-image" type="button" data-import-preview="'+esc(item.id)+'" title="Aperçu : '+esc(name)+'">'+
   '<img loading="lazy" decoding="async" alt="'+esc(item.alt||name)+'" src="'+esc(src)+'" onerror="this.closest(\'.ecs-import-card\').classList.add(\'ecs-import-image-failed\')">'+
   '</button><div class="ecs-import-card-actions"><button type="button" title="Ajouter dans le Reel" aria-label="Ajouter '+esc(name)+' au Reel" data-import-add="'+esc(item.id)+'">＋</button></div>'+
   '<div class="ecs-import-card-meta"><strong title="'+esc(name)+'">'+esc(name)+'</strong><small>'+esc(item.local?'Fichier sur cet appareil':domain)+'</small></div></article>';
 }
 function cardSection(title,arr,domainId,subtitle=''){
  if(!arr.length)return '';
  return '<section class="ecs-import-section"><div class="ecs-sectiontitle"><strong>'+esc(title)+'</strong>'+
   (domainId?'<button type="button" data-import-domain="'+esc(domainId)+'">Afficher tout →</button>':
   '<span>'+arr.length+' fichiers</span>')+'</div>'+
   (subtitle?'<p class="ecs-note">'+esc(subtitle)+'</p>':'')+
   '<div class="ecs-import-grid">'+arr.map(renderCard).join('')+'</div></section>';
 }
 function localItems(kind){return items.filter(x=>x.kind===kind)}
 function matches(item){const d=state.domain;return (d==='all'||d==='personal'&&item.local||item.domain===d)&&
 (state.album==='all'||item.album===state.album)&&(!state.query||norm([item.title,item.alt,item.album,item.source,summary(item.domain)].join(' ')).includes(norm(state.query)))}
 function head(){
  return '<div class="ecs-import-search"><span>⌕</span><input id="ecs-import-search" placeholder="Rechercher des mots-clés, des couleurs…" aria-label="Rechercher dans les médias" value="'+esc(state.query)+'"></div>'+
   '<div class="ecs-import-top-actions"><button type="button" data-import-upload>⇧ Importer des fichiers</button><button type="button" data-import-dossier title="Voir les dossiers">⋯</button></div>'+
   '<div class="ecs-import-upload-pick"><label for="ecs-import-upload-folder">Dossier de destination</label><select id="ecs-import-upload-folder">'+
 lib.folders.map(f=>'<option value="'+esc(f.id)+'" '+(state.uploadDomain===f.id?'selected':'')+'>'+esc(f.name)+'</option>').join('')+'</select></div>'+
 '<p class="ecs-import-subline">Ta médiathèque ELOAH · '+lib.items.length+' visuels sélectionnés pour tes projets.</p>'+
   '<div class="ecs-import-tabs" role="tablist" aria-label="Type de média">'+[['images','Images'],['videos','Vidéos'],['audio','Audio'],['folders','Dossiers']].map(([id,name])=>
   '<button type="button" role="tab" aria-selected="'+(state.tab===id)+'" class="'+(state.tab===id?'selected':'')+'" data-import-tab="'+id+'">'+name+'</button>').join('')+'</div>';
 }
 function folderCards(){
  return '<div class="ecs-import-folders">'+lib.folders.filter(f=>mediaCount(f.id)>0).map(f=>{
   const list=lib.items.filter(x=>x.domain===f.id&&isImage(x)),img=list.find(x=>!x.url.startsWith('data:'))||list[0];
   const count=mediaCount(f.id);
   return '<button type="button" class="ecs-import-folder" data-import-domain="'+esc(f.id)+'"><span class="ecs-import-folder-art">'+
   (img?'<img src="'+esc(getThumb(img))+'" loading="lazy" alt="">':'<span>'+esc(f.icon)+'</span>')+
   '</span><strong>'+esc(f.name)+'</strong><small>'+count+' visuels</small></button>';
  }).join('')+
  '<button type="button" class="ecs-import-folder" data-import-domain="personal"><span class="ecs-import-folder-art">＋</span><strong>Mes fichiers</strong><small>'+items.length+' fichier(s)</small></button></div>';
 }
 function domainChips(){
  return '<div class="ecs-import-chips"><button class="'+(state.domain==='all'?'active':'')+'" data-import-domain="all">Tous</button>'+
  lib.folders.filter(f=>mediaCount(f.id)>0).map(f=>'<button class="'+(state.domain===f.id?'active':'')+'" data-import-domain="'+esc(f.id)+'">'+esc(f.name)+'</button>').join('')+
  '<button class="'+(state.domain==='personal'?'active':'')+'" data-import-domain="personal">Mes fichiers</button></div>';
 }
 function images(){
  const media=[...localItems('image'),...lib.items.filter(isImage)];
  const selected=media.filter(matches);
  if(state.domain==='all'&&!state.query&&state.album==='all'){
   const personal=localItems('image');
   let html='<h3 class="ecs-import-title">Images de tes univers</h3>'+folderCards();
   if(personal.length)html+=cardSection('Mes images importées',personal.slice(0,12),'personal','Images sauvegardées sur cet appareil.');
   const recent=recentIds.map(get).filter(x=>x&&x.kind==='image').slice(0,12);
   if(recent.length)html+=cardSection('Utilisés récemment',recent,null);
   const sorted=lib.folders.filter(f=>mediaCount(f.id)>0);
   for(const f of sorted)html+=cardSection(f.name,lib.items.filter(x=>x.domain===f.id&&isImage(x)).slice(0,12),f.id,
   f.id==='lion'?'Visuels graphiques originaux ; ils ne représentent pas des événements réels.':'');
   return html+'<p class="ecs-note ecs-import-credits">Les photos de stock et les documents historiques portent leur provenance. Les visuels de tes sites restent hébergés sur leurs sites d’origine.</p>';
  }
  const page=selected.slice(0,state.limit);
  const albums=state.domain!=='all'&&state.domain!=='personal'?
   '<select class="ecs-import-albums" id="ecs-import-album" aria-label="Filtrer par collection"><option value="all">Toutes les collections</option>'+
   albumTitles().map(v=>'<option value="'+esc(v)+'" '+(state.album===v?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select>':'';
  const header='<div class="ecs-import-heading"><button type="button" data-import-domain="all">←</button><div><h3>'+esc(state.domain==='all'?'Résultats de recherche':state.domain==='personal'?'Mes fichiers':summary(state.domain))+'</h3>'+
   '<small>'+selected.length+' image(s)'+(state.query?' correspondent à la recherche':'')+'</small></div></div>';
  return domainChips()+header+albums+(page.length?'<div class="ecs-import-grid">'+page.map(renderCard).join('')+'</div>':
   '<p class="ecs-note ecs-import-empty">Aucune image trouvée dans ce dossier.</p>')+
   (selected.length>state.limit?'<button type="button" class="ecs-import-more" data-import-more>Afficher '+Math.min(48,selected.length-state.limit)+' autres images ↓</button>':'');
 }
 function videoTab(){
  const own=localItems('video').filter(matches);
  const clips=ctx.videoStock||[];
  return '<h3 class="ecs-import-title">Vidéos et montages</h3>'+
   '<p class="ecs-note">Tes vidéos importées restent enregistrées sur cet appareil. Les vidéos Pexels sont disponibles dans la vidéothèque.</p>'+
   (own.length?'<div class="ecs-import-grid">'+own.map(item=>renderVideoCard(item)).join('')+'</div>':'')+
   '<button type="button" class="ecs-import-explore" data-import-open-video>▶ Ouvrir la vidéothèque de stock</button>'+
   '<div class="ecs-import-mini-media">'+clips.slice(0,8).map(item=>
   '<div class="ecs-import-mediarow"><span class="ecs-import-media-icon">▶</span><strong>'+esc(item.name)+'</strong>'+
   '<button type="button" data-import-stock-preview="'+esc(item.id)+'">Voir</button><button type="button" data-import-stock-add="'+esc(item.id)+'">＋</button></div>').join('')+'</div>';
 }
 function renderVideoCard(item){
  return '<article class="ecs-import-card ecs-import-filecard">'+
  '<button class="ecs-import-card-image" type="button" data-import-preview="'+esc(item.id)+'"><video src="'+esc(getSrc(item))+'" muted playsinline preload="metadata"></video></button>'+
  '<div class="ecs-import-card-actions"><button type="button" data-import-add="'+esc(item.id)+'">＋</button></div>'+
  '<div class="ecs-import-card-meta"><strong>'+esc(item.title)+'</strong><small>Fichier enregistré</small></div></article>';
 }
 function audioTab(){
  const own=localItems('audio').filter(matches),sounds=ctx.soundLibrary||[];
  return '<h3 class="ecs-import-title">Audio et musique</h3><p class="ecs-note">Ajoute une voix off ou une musique dans la timeline.</p>'+
   (own.length?'<div class="ecs-import-audio-own">'+own.map(item=>
   '<div class="ecs-import-mediarow"><span class="ecs-import-media-icon">♫</span><strong>'+esc(item.title)+'</strong>'+
   '<button data-import-preview="'+esc(item.id)+'">Écouter</button><button data-import-add="'+esc(item.id)+'">＋</button></div>').join('')+'</div>':'')+
   '<button type="button" class="ecs-import-explore" data-import-open-audio>♫ Ouvrir la bibliothèque musicale</button>'+
   sounds.map(t=>'<div class="ecs-import-mediarow"><span class="ecs-import-media-icon">♫</span><strong>'+esc(t.name)+'</strong>'+
   '<button type="button" data-import-preview-sound="'+esc(t.id)+'">▶</button><button type="button" data-import-add-sound="'+esc(t.id)+'">＋</button></div>').join('');
 }
 function foldersTab(){
  let html='<h3 class="ecs-import-title">Mes dossiers ELOAH</h3><p class="ecs-note">Chaque domaine regroupe ses visuels, avec des collections thématiques.</p>'+folderCards();
  if(state.domain!=='all'&&state.domain!=='personal'){
   const folders=[...new Set(lib.items.filter(i=>i.domain===state.domain).map(i=>i.album))];
   html+='<h3 class="ecs-import-title">Collections · '+esc(summary(state.domain))+'</h3>'+
   '<div class="ecs-import-album-links">'+folders.map(f=>'<button type="button" data-import-album-open="'+esc(f)+'">'+esc(f)+' →</button>').join('')+'</div>';
  }
  return html;
 }
 function render(){
  let html=head();
  if(state.tab==='images')html+=images();
  else if(state.tab==='videos')html+=videoTab();
  else if(state.tab==='audio')html+=audioTab();
  else html+=foldersTab();
  return '<div class="ecs-import-gallery">'+html+
   '<div class="ecs-import-footer"><p class="ecs-note">'+(state.storage==='ready'?'Tes propres fichiers importés sont sauvegardés sur cet appareil.':
     'Les fichiers ajoutés ici restent disponibles pendant la session ; la sauvegarde locale dépend du navigateur.')+
   ' Pour les retrouver sur un autre appareil, conserve les fichiers originaux. Les visuels WordPress sont référencés, pas copiés.</p></div></div>';
 }
 function dismissPreview(){ctx.root.querySelector('.ecs-import-modal')?.remove();state.preview=null}
 function preview(id){
  const item=get(id);if(!item)return;
  dismissPreview();state.preview=id;
  const modal=document.createElement('div');modal.className='ecs-import-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
  const src=getSrc(item),image=item.kind==='image',video=item.kind==='video',audio=item.kind==='audio';
  const name=item.title||'Média';
  modal.innerHTML='<div class="ecs-import-modalbox"><header><strong>'+esc(name)+'</strong><button data-import-close aria-label="Fermer">✕</button></header>'+
   (image?'<img src="'+esc(src)+'" alt="'+esc(item.alt||name)+'">':
    video?'<video src="'+esc(src)+'" controls playsinline preload="metadata"></video>':
    audio?'<audio src="'+esc(src)+'" controls preload="metadata"></audio>':'')+
   '<p class="ecs-note">'+esc(item.local?'Fichier personnel sur cet appareil':item.source||'Visuel ELOAH')+
   (item.album?' · '+esc(item.album):'')+'</p>'+
   '<div class="ecs-import-modalactions"><button type="button" data-import-add="'+esc(id)+'">＋ Ajouter au Reel</button>'+
   (image?'<button type="button" data-import-background="'+esc(id)+'">Définir comme fond</button>':'')+
   (!item.local&&!src.startsWith('data:')?'<a href="'+esc(src)+'" target="_blank" rel="noopener noreferrer">Voir le fichier source ↗</a>':'')+
   (item.local?'<button type="button" data-import-delete="'+esc(id)+'">Supprimer de mes fichiers</button>':'')+'</div>'+
   '<p class="ecs-note">L’import dans le Reel nécessite que le navigateur puisse lire ce fichier. Si un site externe bloque le transfert, ouvre le fichier source et importe-le depuis ton appareil.</p></div>';
  modal.addEventListener('click',event=>{if(event.target===modal)dismissPreview()});
  ctx.root.appendChild(modal);
 }
 async function addMedia(id,background=false){
  const item=get(id);if(!item||opBusy)return;
  opBusy=true;ctx.toast('Préparation du média : '+item.title+'…');
  try{
   let blob;
   if(item.local)blob=item.blob;
   else{
    const src=item.url;
    let lastError=null;
    for(const candidate of [src,item.thumb].filter((v,i,a)=>v&&a.indexOf(v)===i)){
     try{
      const response=await fetch(candidate,{mode:'cors'});
      if(!response.ok)throw Error('HTTP '+response.status);
      blob=await response.blob();
      if(!blob.size||!blob.type.startsWith('image/')&&item.kind==='image')throw Error('Image indisponible');
      break;
     }catch(err){lastError=err;blob=null}
    }
    if(!blob)throw lastError||Error('Téléchargement impossible');
   }
   if(blob.size>65*1024*1024)throw Error('Fichier trop volumineux pour cet import.');
   const kind=item.kind;
   let ext=kind==='image'?(blob.type.includes('svg')?'svg':blob.type.includes('png')?'png':blob.type.includes('webp')?'webp':'jpg'):kind==='video'?'mp4':'mp3';
   const file=new File([blob],(item.title||'media').replace(/[^a-z0-9-]/gi,'-').slice(0,56)+'.'+ext,{type:blob.type|| (kind==='image'?'image/jpeg':kind==='video'?'video/mp4':'audio/mpeg')});
   let success=false;
   if(kind==='image')success=await ctx.loadImage(file,background?'background':'element');
   else if(kind==='video'){await ctx.loadVideo(file);success=true}
   else if(kind==='audio'){await ctx.loadAudio(file);success=true}
   if(success===false)throw Error('Ce média n’a pas pu être décodé.');
   rememberRecent(id);dismissPreview();
   ctx.toast('Ajouté au Reel : '+item.title);
  }catch(e){
   ctx.toast('Impossible d’ajouter directement : '+e.message+'. Ouvre la source puis importe ton fichier si nécessaire.');
   if(!item.local&&!state.preview)preview(id);
  }finally{opBusy=false}
 }
 function fileKind(file){
  if(file.type.startsWith('image/'))return 'image';
  if(file.type.startsWith('video/'))return 'video';
  if(file.type.startsWith('audio/'))return 'audio';
  return null;
 }
 async function upload(files){
  const selected=[...files].slice(0,30),errors=[];let ok=0;
  for(const file of selected){
   const kind=fileKind(file);
   if(!kind){errors.push(file.name+' : format non pris en charge');continue}
   if(file.size>65*1024*1024){errors.push(file.name+' : limite 65 Mo');continue}
   const entry={id:'local-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),
    title:file.name,alt:file.name,kind,domain:state.uploadDomain,album:'Mes fichiers importés',
    source:'Mon appareil',local:true,size:file.size,addedAt:Date.now(),blob:file};
   const saved=await putDB(entry);
   if(!saved&&db){errors.push(file.name+' : sauvegarde indisponible, conservé pour cette session')}
   items.unshift(entry);objUrls.set(entry.id,URL.createObjectURL(file));ok++;
  }
  if(ok){state.tab='images';state.domain='personal';state.album='all';state.query='';state.limit=48;ctx.toast(ok+' fichier(s) ajoutés à ELOAH. Les vidéos et audios se retrouvent dans leurs onglets.');update()}
  if(errors.length)ctx.toast(errors.slice(0,2).join(' ; '));
 }
 async function removeLocal(id){
  const item=getLocal(id);if(!item)return;
  if(!confirm('Supprimer définitivement ce fichier de la bibliothèque locale ELOAH ?'))return;
  await deleteDB(id);
  const u=objUrls.get(id);if(u)URL.revokeObjectURL(u);objUrls.delete(id);
  items=items.filter(x=>x.id!==id);dismissPreview();update();ctx.toast('Fichier retiré de la médiathèque locale.');
 }
 function switchDomain(id){
  state.domain=id;state.tab='images';state.album='all';state.limit=48;state.query='';
  if(id!=='all'&&id!=='personal')state.uploadDomain=id;
  dismissPreview();update();
 }
 function handleClick(ev){
  const find=attr=>ev.target.closest('['+attr+']');
  const tab=find('data-import-tab');if(tab){state.tab=tab.dataset.importTab;state.query='';state.limit=48;update();return true}
  const folders=find('data-import-dossier');if(folders){state.tab='folders';state.query='';update();return true}
  const uploadBtn=find('data-import-upload');if(uploadBtn){uploadInput?.click();return true}
  const domain=find('data-import-domain');if(domain){switchDomain(domain.dataset.importDomain);return true}
  const album=find('data-import-album-open');if(album){state.album=album.dataset.importAlbumOpen;state.tab='images';state.limit=48;update();return true}
  const more=find('data-import-more');if(more){state.limit+=48;update();return true}
  const close=find('data-import-close');if(close){dismissPreview();return true}
  const previewBtn=find('data-import-preview');if(previewBtn){preview(previewBtn.dataset.importPreview);return true}
  const background=find('data-import-background');if(background){addMedia(background.dataset.importBackground,true);return true}
  const addBtn=find('data-import-add');if(addBtn){addMedia(addBtn.dataset.importAdd);return true}
  const remove=find('data-import-delete');if(remove){removeLocal(remove.dataset.importDelete);return true}
  const videoBtn=find('data-import-open-video');if(videoBtn){ctx.setTab('videos');return true}
  const audioBtn=find('data-import-open-audio');if(audioBtn){ctx.setTab('audio');return true}
  const stockView=find('data-import-stock-preview');if(stockView){ctx.openStockVideo(stockView.dataset.importStockPreview);return true}
  const stockAdd=find('data-import-stock-add');if(stockAdd){ctx.importStockVideo(stockAdd.dataset.importStockAdd);return true}
  const soundPreview=find('data-import-preview-sound');if(soundPreview){ctx.previewSound(soundPreview.dataset.importPreviewSound);return true}
  const soundAdd=find('data-import-add-sound');if(soundAdd){ctx.addSound(soundAdd.dataset.importAddSound);return true}
  return false;
 }
 function handleInput(e){
  if(e.target.id!=='ecs-import-search')return false;
  state.query=e.target.value;state.limit=48;
  const caret=e.target.selectionStart;update();
  const input=ctx.root.querySelector('#ecs-import-search');
  if(input){input.focus();try{input.setSelectionRange(caret,caret)}catch{}}
  return true;
 }
 function handleChange(e){
  if(e.target.id==='ecs-import-upload-folder'){state.uploadDomain=e.target.value;return true}
  if(e.target.id==='ecs-import-album'){state.album=e.target.value;state.limit=48;update();return true}
  return false;
 }
 async function loadSaved(){
  db=await openDB();state.storage=db?'ready':'session';
  if(db){
   items=(await allDB(db)).filter(x=>x&&x.id&&x.blob&&['image','video','audio'].includes(x.kind)).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
   for(const item of items)try{objUrls.set(item.id,URL.createObjectURL(item.blob))}catch{}
  }
  update();
 }
 function setup(){
  uploadInput=document.createElement('input');uploadInput.type='file';uploadInput.multiple=true;
  uploadInput.accept='image/*,video/*,audio/*';uploadInput.id='ecs-import-upload-files';uploadInput.className='ecs-fileinput';
  uploadInput.setAttribute('aria-label','Importer des images, vidéos ou pistes audio');
  ctx.root.append(uploadInput);
  uploadInput.addEventListener('change',event=>{const list=[...(event.target.files||[])];event.target.value='';if(list.length)upload(list)});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.preview)dismissPreview()});
  loadSaved().catch(e=>{state.storage='session';ctx.toast('Bibliothèque locale momentanément indisponible.');update()});
 }
 setup();
 return {render,handleClick,handleInput,handleChange,selectedTab:()=>state.tab,getCount:()=>lib.items.length};
}
window.ELOAHReelImporter={create};
})();