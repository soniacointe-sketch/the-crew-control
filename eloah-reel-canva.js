(()=>{
'use strict';
const oldMain=document.querySelector('body > main');
if(!oldMain || document.getElementById('eloah-canva-studio'))return;
const legacy=document.createElement('div');legacy.id='eloah-reel-legacy';legacy.style.display='none';
while(oldMain.firstChild)legacy.appendChild(oldMain.firstChild);
oldMain.append(legacy);
const root=document.createElement('div');root.id='eloah-canva-studio';
oldMain.insertBefore(root,legacy);
root.innerHTML='<div class="ecs-top"><a href="mes-univers.html" title="Retour">←</a><div class="ecs-brand">ELOAH / REEL STUDIO</div><button data-action="old">Ancien studio</button><input aria-label="Nom du projet" class="ecs-projectname" id="ecs-name" value="Mon Reel"><button data-action="undo" title="Annuler">↶</button><button data-action="redo" title="Rétablir">↷</button><div class="ecs-topspacer"></div><button data-action="save">Enregistrer</button><button class="ecs-export" data-action="export">⬇ Exporter vidéo</button></div><div class="ecs-layout"><nav class="ecs-rail" aria-label="Outils de création"></nav><aside class="ecs-sidebar ecs-open"><div class="ecs-sidehead"></div><div class="ecs-sidebody"></div></aside><div class="ecs-center"><div class="ecs-toolbar"><button data-action="properties">✎ Modifier</button><button data-action="duplicate">⧉ Dupliquer</button><button data-action="delete">⌫ Supprimer</button><button data-action="forward">↑ Premier plan</button><button data-action="backward">↓ Arrière-plan</button><div class="ecs-tbspacer"></div><span>9:16 · 1080 × 1920</span></div><div class="ecs-stagewrap"><div class="ecs-stagehint">Glisse les éléments sur la page</div><div class="ecs-stagebox"><canvas id="ecs-canvas" width="1080" height="1920" aria-label="Éditeur de Reel. Clique et déplace un élément."></canvas></div></div><div class="ecs-player"><button data-action="play" id="ecs-play">▶</button><span id="ecs-clock">0:00 / 0:05</span><button data-action="restart" title="Revenir au début">⟲</button><button data-action="png">📷 Couverture PNG</button></div><div class="ecs-timeline"><div class="ecs-timelinehead"><strong>Montage vidéo</strong><button data-tab="import">＋ Ajouter un média</button><button data-tab="text">＋ Texte</button><div class="ecs-tbspacer"></div><span class="ecs-note">Déplace la tête de lecture</span></div><div class="ecs-timeline-scroll"><div id="ecs-timeruler" class="ecs-ruler"></div><div id="ecs-tracks"></div></div></div></div></div><input type="file" class="ecs-fileinput" id="ecs-video-input" accept="video/*"><input type="file" class="ecs-fileinput" id="ecs-image-input" accept="image/*" multiple><input type="file" class="ecs-fileinput" id="ecs-audio-input" accept="audio/*"><input type="file" class="ecs-fileinput" id="ecs-project-input" accept=".json,application/json"><div class="ecs-toast ecs-hide" role="status"></div>';
const one=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
const canvas=one('#ecs-canvas'),ctx=canvas.getContext('2d');
const tabs=[['models','▦','Modèles'],['elements','◈','Éléments'],['text','T','Texte'],['brand','♛','Marque'],['import','⇧','Importer'],['tools','⚒','Outils'],['projects','▤','Projets'],['photos','▧','Photos'],['audio','♫','Audio'],['videos','▶','Vidéos']];
one('.ecs-rail').innerHTML=tabs.map(([key,icon,label])=>'<button class="ecs-railbtn" data-tab="'+key+'"><span class="ecs-symbol">'+icon+'</span><span>'+label+'</span></button>').join('');
const video=document.createElement('video'),audio=document.createElement('audio');
video.playsInline=true;video.preload='auto';audio.preload='auto';
const media={videoUrl:null,audioUrl:null,imageUrl:null,bgImage:null};
let images=new Map(),activeTab='models',selected=null,nextId=1,drag=null,history=[],future=[],lastFrame=performance.now(),busy=false,toastTimer=0,importKind='background';
const S={name:'Mon Reel',duration:5,trimStart:0,time:0,playing:false,bg:'#fffaf1',filter:'none',brand:'Power & Glam',elements:[]};
const themes={
crew:{bg:'#171717',color:'#e8c475',brand:'The Crew Orchies',title:'ON VIENT POUR DANSER'},
love:{bg:'#f4efe7',color:'#a63d57',brand:'Power & Glam',title:'JE ME CHOISIS'},
velka:{bg:'#401d32',color:'#fff0dc',brand:'Sonia Velka',title:'AVANCER SANS SE RETOURNER'},
nature:{bg:'#eff9f2',color:'#28705a',brand:'ELOAH',title:'PRENDRE SON ENVOL'}
};
function xss(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(s){const box=one('.ecs-toast');box.textContent=s;box.classList.remove('ecs-hide');clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.add('ecs-hide'),5000)}
function serial(){return {name:S.name,duration:S.duration,trimStart:S.trimStart,bg:S.bg,filter:S.filter,brand:S.brand,elements:JSON.parse(JSON.stringify(S.elements))}}
function snapshot(){history.push(JSON.stringify(serial()));if(history.length>70)history.shift();future=[]}
function apply(a){Object.assign(S,a);S.elements=a.elements||[];selected=null;S.time=Math.min(S.time,S.duration);one('#ecs-name').value=S.name;renderSide();renderTimeline();draw()}
function undo(){if(!history.length)return;future.push(JSON.stringify(serial()));apply(JSON.parse(history.pop()))}
function redo(){if(!future.length)return;history.push(JSON.stringify(serial()));apply(JSON.parse(future.pop()))}
function add(kind,extra={}){snapshot();const n={id:nextId++,kind,x:110,y:790,w:860,h:280,color:'#222222',text:'Nouveau texte',font:78,start:0,end:S.duration,...extra};S.elements.push(n);selected=n.id;activeTab='properties';renderSide();renderTimeline();draw();saveLocal();return n}
function saveLocal(){try{localStorage.setItem('eloah_reel_editor',JSON.stringify(serial()))}catch{}}
function drawText(c,e){let txt=String(e.text||''),lines=txt.split('\n');c.fillStyle=e.color||'#222';c.textAlign='center';c.textBaseline='middle';let font=Math.min(250,Math.max(14,+e.font||68));c.font='800 '+font+'px system-ui,Arial';const out=[];for(const line of lines){const parts=line.split(/\s+/);let current='';for(const word of parts){if(c.measureText((current+' '+word).trim()).width>e.w-18&&current){out.push(current);current=word}else current=(current+' '+word).trim()}out.push(current)}const lineHeight=font*1.16,ty=e.y+e.h/2-(out.length-1)*lineHeight/2;out.forEach((line,i)=>c.fillText(line,e.x+e.w/2,ty+i*lineHeight,e.w-6))}
function cover(c,img){if(!img || !(img.videoWidth||img.naturalWidth))return;const w=img.videoWidth||img.naturalWidth,h=img.videoHeight||img.naturalHeight;const k=Math.max(1080/w,1920/h);c.drawImage(img,(1080-w*k)/2,(1920-h*k)/2,w*k,h*k)}
function paint(c,t,mark=false){
 c.save();c.fillStyle=S.bg;c.fillRect(0,0,1080,1920);
 c.filter=S.filter==='mono'?'grayscale(1) contrast(1.12)':S.filter==='vivid'?'saturate(1.55) contrast(1.08)':S.filter==='cinema'?'contrast(1.15) saturate(.85)':S.filter==='gold'?'sepia(.2) saturate(1.3)':'none';
 try{if(media.videoUrl&&video.readyState>=2)cover(c,video);else if(media.bgImage)cover(c,media.bgImage)}catch{}
 c.filter='none';
 for(const e of S.elements){if(t<e.start||t>e.end)continue;
  if(e.kind==='rect'){c.fillStyle=e.color;c.fillRect(e.x,e.y,e.w,e.h)}
  if(e.kind==='ellipse'){c.fillStyle=e.color;c.beginPath();c.ellipse(e.x+e.w/2,e.y+e.h/2,Math.abs(e.w/2),Math.abs(e.h/2),0,0,Math.PI*2);c.fill()}
  if(e.kind==='star'){c.save();c.translate(e.x+e.w/2,e.y+e.h/2);c.beginPath();for(let i=0;i<10;i++){const r=(i%2?0.48:1)*Math.min(e.w,e.h)/2,a=i*Math.PI/5-Math.PI/2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fillStyle=e.color;c.fill();c.restore()}
  if(e.kind==='text')drawText(c,e);
  if(e.kind==='image'){const im=images.get(e.id);if(im?.complete)try{c.drawImage(im,e.x,e.y,e.w,e.h)}catch{}}
  if(mark&&selected===e.id){c.strokeStyle='#1676d0';c.lineWidth=6;c.strokeRect(e.x,e.y,e.w,e.h);c.fillStyle='#fff';c.fillRect(e.x+e.w-12,e.y+e.h-12,24,24);c.strokeRect(e.x+e.w-12,e.y+e.h-12,24,24)}
 }
 c.restore();
}
function draw(){paint(ctx,S.time,!busy)}
function clock(t){let n=Math.max(0,Math.floor(t));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function tick(now){let dt=Math.min(.15,(now-lastFrame)/1000);lastFrame=now;if(S.playing){S.time+=dt;if(S.time>=S.duration){S.time=S.duration;pause()}if(media.videoUrl&&video.readyState>=2&&Math.abs(video.currentTime-(S.time+S.trimStart))>.25){try{video.currentTime=S.time+S.trimStart}catch{}}}
 draw();one('#ecs-clock').textContent=clock(S.time)+' / '+clock(S.duration);const ph=one('.ecs-playhead');if(ph)ph.style.left=(S.time*70)+'px';requestAnimationFrame(tick)}
function pause(){S.playing=false;video.pause();audio.pause();one('#ecs-play').textContent='▶'}
function play(){if(S.playing){pause();return}if(S.time>=S.duration)S.time=0;S.playing=true;one('#ecs-play').textContent='⏸';if(media.videoUrl){try{video.currentTime=S.time+S.trimStart;video.play().catch(()=>toast('Lecture vidéo bloquée par le navigateur.'))}catch{}}if(media.audioUrl){try{audio.currentTime=S.time;audio.play().catch(()=>{})}catch{}}}
function seek(t){S.time=Math.max(0,Math.min(S.duration,t));if(media.videoUrl&&video.readyState>=2)try{video.currentTime=S.time+S.trimStart}catch{};if(media.audioUrl&&audio.readyState>=2)try{audio.currentTime=S.time}catch{};draw()}
function renderTimeline(){
 const px=Math.max(720,S.duration*70+45),ruler=one('#ecs-timeruler'),tracks=one('#ecs-tracks');ruler.style.width=px+'px';
 ruler.innerHTML=Array.from({length:Math.floor(S.duration)+1},(_,i)=>'<span style="left:'+(i*70)+'px">'+clock(i)+'</span>').join('');
 const clip=(e,kind)=>'<button class="ecs-clip '+kind+(selected===e.id?' selected':'')+'" data-select="'+e.id+'" style="left:'+(e.start*70)+'px;width:'+Math.max(16,(e.end-e.start)*70)+'px">'+xss(e.kind==='text'?e.text:(e.kind==='image'?'Image':e.kind))+'</button>';
 let bg='<div class="ecs-track" style="width:'+px+'px"><button class="ecs-clip" data-tab="import" style="left:0;width:'+(S.duration*70)+'px">▧ '+(media.videoUrl?'Vidéo importée':media.bgImage?'Photo de fond':'Fond / scène')+'</button></div>';
 const els='<div class="ecs-track" style="width:'+px+'px">'+S.elements.map(e=>clip(e,'text')).join('')+'</div>';
 const au='<div class="ecs-track" style="width:'+px+'px">'+(media.audioUrl?'<button class="ecs-clip audio" data-tab="audio" style="left:0;width:'+(S.duration*70)+'px">♫ Piste audio</button>':'<button class="ecs-clip audio" data-tab="audio" style="left:0;width:'+(S.duration*70)+'px;opacity:.65">＋ Ajouter une piste audio</button>')+'</div>';
 tracks.innerHTML='<div style="position:relative;width:'+px+'px">'+bg+els+au+'<div class="ecs-playhead" style="left:'+(S.time*70)+'px"></div></div>';
}
const btn=(action,label,primary=false)=>'<button type="button" data-action="'+action+'" class="ecs-pillbtn'+(primary?' primary':'')+'">'+label+'</button>';
function range(label,key,min,max,step,val){return '<label class="ecs-sidelabel">'+label+'</label><input type="number" min="'+min+'" max="'+max+'" step="'+step+'" data-p="'+key+'" value="'+xss(val)+'">'}
function color(label,key,val){return '<label class="ecs-sidelabel">'+label+'</label><input type="color" data-p="'+key+'" value="'+xss(val)+'">'}
function renderSide(){
 all('.ecs-railbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeTab));
 const titles={models:'Modèles',elements:'Éléments',text:'Texte',brand:'Marque',import:'Importer',tools:'Outils de montage',projects:'Mes projets',photos:'Photos',audio:'Audio',videos:'Vidéos',properties:'Modifier l’élément'};
 one('.ecs-sidehead').textContent=titles[activeTab]||'Modifier';const box=one('.ecs-sidebody');let html='';
 if(activeTab==='models')html='<p class="ecs-note">Choisis un point de départ. Tu pourras modifier tous les éléments.</p><div class="ecs-cardgrid">'+Object.entries(themes).map(([key,t],i)=>'<button class="ecs-model m'+(i+1)+'" data-theme="'+key+'">'+xss(t.title)+'</button>').join('')+'</div><p class="ecs-note">Modèles originaux ELOAH, non issus de la bibliothèque Canva.</p>';
 if(activeTab==='elements')html='<label class="ecs-sidelabel" for="ecs-element-search">Rechercher des éléments</label><input id="ecs-element-search" placeholder="Photo, texte, forme…" autocomplete="off"><p class="ecs-sidelabel">Utilisés récemment</p><div class="ecs-list"><button class="ecs-itembtn ecs-filterable" data-action="addText"><span class="ecs-iconbig">T</span>Ajouter un texte</button><button class="ecs-itembtn ecs-filterable" data-tab="photos"><span class="ecs-iconbig">▧</span>Photos</button><button class="ecs-itembtn ecs-filterable" data-tab="videos"><span class="ecs-iconbig">▶</span>Vidéos</button></div><p class="ecs-sidelabel">Parcourir les catégories</p><div class="ecs-cardgrid"><button class="ecs-itembtn ecs-filterable" data-tab="audio"><span class="ecs-iconbig">♫</span>Audio</button><button class="ecs-itembtn ecs-filterable" data-tab="photos"><span class="ecs-iconbig">▧</span>Photos</button><button class="ecs-itembtn ecs-filterable" data-tab="videos"><span class="ecs-iconbig">▶</span>Vidéos</button><button class="ecs-itembtn ecs-filterable" data-action="rect"><span class="ecs-iconbig">▰</span>Rectangle</button><button class="ecs-itembtn ecs-filterable" data-action="ellipse"><span class="ecs-iconbig">●</span>Cercle</button><button class="ecs-itembtn ecs-filterable" data-action="star"><span class="ecs-iconbig">★</span>Étoile</button></div><p class="ecs-note">Les outils affichés sont utilisables. Les bibliothèques Canva et les animations 3D ne sont pas encore intégrées.</p>';
 if(activeTab==='text')html='<p class="ecs-note">Clique pour ajouter un texte, puis déplace-le directement sur le Reel.</p><div class="ecs-list"><button class="ecs-itembtn" data-action="heading"><strong style="font-size:23px">Ajouter un titre</strong></button><button class="ecs-itembtn" data-action="subtitle">Ajouter un sous-titre</button><button class="ecs-itembtn" data-action="addText">Ajouter un texte simple</button></div>';
 if(activeTab==='brand')html='<label class="ecs-sidelabel">Univers</label><select data-setting="brand">'+['Power & Glam','The Crew Orchies','Sonia Velka','ELOAH','Le Lion Blanc','Autre'].map(x=>'<option '+(x===S.brand?'selected':'')+'>'+x+'</option>').join('')+'</select>'+color('Couleur du fond','bg',S.bg)+'<p class="ecs-note">Les modèles apportent des palettes adaptées à tes univers.</p>'+btn('brandLabel','Ajouter la signature');
 if(activeTab==='import')html='<div class="ecs-upload"><strong>Importe tes fichiers</strong><p class="ecs-note">Glisse tes fichiers directement sur la page ou choisis ci-dessous.</p>'+btn('importVideo','Vidéo',true)+btn('importImage','Photo')+btn('importAudio','Audio')+'</div><p class="ecs-note">Fichiers traités dans le navigateur. Les photos peuvent être un fond ou un élément mobile.</p>'+btn('addImage','Photo comme élément');
 if(activeTab==='tools')html=range('Durée du Reel (secondes)','duration',1,60,.5,S.duration)+color('Fond','bg',S.bg)+'<label class="ecs-sidelabel">Effet de couleur</label><select data-setting="filter">'+[['none','Naturel'],['cinema','Cinéma'],['gold','Lumière dorée'],['vivid','Couleurs intenses'],['mono','Noir et blanc']].map(([k,v])=>'<option value="'+k+'" '+(S.filter===k?'selected':'')+'>'+v+'</option>').join('')+'</select>'+btn('png','Exporter une image PNG')+'<p class="ecs-note">Les filtres modifient la vidéo et les photos de fond. Le son est conservé selon les capacités du navigateur à l’export.</p>';
 if(activeTab==='projects')html='<p class="ecs-note">Sauvegarde ton projet en JSON pour retrouver les textes, positions et couleurs.</p>'+btn('save','Sauvegarder projet',true)+btn('load','Ouvrir un projet')+btn('reset','Nouveau projet')+'<p class="ecs-note">Les vidéos, photos et musiques ne sont pas intégrées au fichier JSON : conserve-les séparément et réimporte-les après ouverture.</p>';
 if(activeTab==='photos')html=btn('importImage','Importer une photo',true)+btn('addImage','Ajouter une photo déplaçable')+'<p class="ecs-note">Tu peux également déposer un JPEG, PNG ou WebP directement sur le plan de travail.</p>';
 if(activeTab==='audio')html=btn('importAudio','Ajouter un fichier audio',true)+'<p class="ecs-note">'+(media.audioUrl?'Piste chargée : '+xss(audio.dataset.filename||'Audio'):'Aucune piste audio ajoutée.')+'<br>Lecture synchronisée avec le montage. À l’export, l’audio dépend du format pris en charge.</p>'+(media.audioUrl?btn('removeAudio','Retirer l’audio'): '');
 if(activeTab==='videos')html=btn('importVideo','Importer une vidéo',true)+'<p class="ecs-note">'+(media.videoUrl?'Vidéo chargée : '+xss(video.dataset.filename||'Vidéo'):'Aucune vidéo chargée.')+'<br>La vidéo apparaît dans le cadre vertical. Tu peux ajouter textes et formes dessus.</p>'+(media.videoUrl?range('Commencer la vidéo à (secondes)','trimStart',0,Math.max(0,Math.floor(video.duration*10)/10),.1,S.trimStart)+'<p class="ecs-note">Découpe l’extrait en réglant son point de départ. Sa durée se règle dans Outils.</p>'+btn('removeVideo','Retirer la vidéo'): '');
 if(activeTab==='properties'){
  const e=S.elements.find(q=>q.id===selected);
  if(!e)html='<div class="ecs-empty">Sélectionne un texte, une forme ou une image sur le plan de travail.</div>';
  else{
   html='<p class="ecs-note">Fais glisser cet élément sur le Reel. Pour le redimensionner, tire le petit carré dans son angle inférieur droit.</p>';
   if(e.kind==='text')html+='<label class="ecs-sidelabel">Texte</label><textarea rows="4" data-p="text">'+xss(e.text)+'</textarea>'+range('Taille des caractères','font',14,250,1,e.font);
   if(e.kind!=='image')html+=color('Couleur','color',e.color);
   html+='<div class="ecs-rows"><div>'+range('Position X','x',0,1080,1,Math.round(e.x))+'</div><div>'+range('Position Y','y',0,1920,1,Math.round(e.y))+'</div></div><div class="ecs-rows"><div>'+range('Largeur','w',20,1080,1,Math.round(e.w))+'</div><div>'+range('Hauteur','h',20,1920,1,Math.round(e.h))+'</div></div><div class="ecs-rows"><div>'+range('Début (s)','start',0,S.duration,.1,e.start)+'</div><div>'+range('Fin (s)','end',0,S.duration,.1,e.end)+'</div></div>'+btn('duplicate','Dupliquer')+btn('delete','Supprimer');
  }
 }
 box.innerHTML=html;
}
function setTab(tab){activeTab=tab;renderSide();if(window.innerWidth<691)one('.ecs-sidebar').classList.add('ecs-open')}
function action(name){
 if(name==='old'){pause();root.style.display='none';legacy.style.display='block';document.body.classList.add('ecs-legacy-open');const h=document.querySelector('body > header');if(h)h.style.display='flex';const back=document.createElement('button');back.textContent='↗ Retour à l’éditeur visuel';back.style.cssText='position:fixed;bottom:16px;right:16px;z-index:99;background:#147a9f;color:white;padding:13px;border-radius:9px';back.onclick=()=>{legacy.style.display='none';root.style.display='flex';back.remove();if(h)h.style.display='none'};document.body.append(back);return}
 if(name==='undo'){undo();return}if(name==='redo'){redo();return}
 if(name==='play'){play();return}if(name==='restart'){pause();seek(0);return}
 if(name==='properties'){setTab('properties');return}
 if(name==='rect'){add('rect',{x:230,y:850,w:620,h:240,color:'#d7654f'});return}
 if(name==='ellipse'){add('ellipse',{x:320,y:810,w:430,h:430,color:'#28705a'});return}
 if(name==='star'){add('star',{x:360,y:780,w:360,h:360,color:'#d7ad46'});return}
 if(['heading','subtitle','addText','brandLabel'].includes(name)){add('text',name==='heading'?{text:'MON GRAND TITRE',font:90,y:770,h:310,color:'#2e2e2e'}:name==='subtitle'?{text:'Ton sous-titre ici',font:49,y:1100,h:160,color:'#303030'}:name==='brandLabel'?{text:S.brand.toUpperCase(),font:42,y:1700,h:140,color:'#c69b46'}:{text:'Écris ton texte',font:70,y:970,h:180});return}
 if(name==='duplicate'){let e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne un élément à dupliquer.');return}const {id:originalId,...copy}=e;const cloned=add(e.kind,{...copy,x:Math.min(Math.max(0,1080-e.w),e.x+36),y:Math.min(Math.max(0,1920-e.h),e.y+36)});if(e.kind==='image'&&images.has(e.id))images.set(cloned.id,images.get(e.id));return}
 if(name==='delete'){let e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne un élément à supprimer.');return}snapshot();S.elements=S.elements.filter(x=>x.id!==selected);selected=null;setTab('elements');renderTimeline();saveLocal();return}
 if(name==='forward'||name==='backward'){let i=S.elements.findIndex(x=>x.id===selected);if(i<0)return;snapshot();let e=S.elements.splice(i,1)[0];S.elements.splice(name==='forward'?S.elements.length:0,0,e);saveLocal();return}
 if(name==='importVideo'){one('#ecs-video-input').click();return}
 if(name==='importImage'){importKind='background';one('#ecs-image-input').click();return}
 if(name==='addImage'){importKind='element';one('#ecs-image-input').click();return}
 if(name==='importAudio'){one('#ecs-audio-input').click();return}
 if(name==='removeAudio'){if(media.audioUrl)URL.revokeObjectURL(media.audioUrl);media.audioUrl=null;audio.removeAttribute('src');renderTimeline();renderSide();return}
 if(name==='removeVideo'){pause();if(media.videoUrl)URL.revokeObjectURL(media.videoUrl);media.videoUrl=null;S.trimStart=0;video.removeAttribute('src');renderTimeline();renderSide();saveLocal();return}
 if(name==='png'){drawPng();return}
 if(name==='save'){saveProject();return}
 if(name==='load'){one('#ecs-project-input').click();return}
 if(name==='reset'){if(!confirm('Créer un nouveau projet ? Les modifications non exportées seront perdues.'))return;snapshot();S.elements=[];S.bg='#fffaf1';S.duration=5;S.trimStart=0;S.time=0;S.filter='none';selected=null;pause();for(const url of [media.videoUrl,media.audioUrl,media.imageUrl])if(url)URL.revokeObjectURL(url);media.videoUrl=null;media.audioUrl=null;media.imageUrl=null;media.bgImage=null;video.removeAttribute('src');audio.removeAttribute('src');images.clear();setTab('models');renderTimeline();saveLocal();return}
 if(name==='export'){exportVideo();return}
}
root.addEventListener('click',ev=>{
 const tb=ev.target.closest('[data-tab]');if(tb&&root.contains(tb)){setTab(tb.dataset.tab);return}
 const themed=ev.target.closest('[data-theme]');if(themed){snapshot();const t=themes[themed.dataset.theme];S.bg=t.bg;S.brand=t.brand;S.elements=[{id:nextId++,kind:'text',text:t.title,x:90,y:720,w:900,h:450,color:t.color,font:92,start:0,end:S.duration}];selected=null;renderTimeline();renderSide();saveLocal();return}
 const sel=ev.target.closest('[data-select]');if(sel){selected=Number(sel.dataset.select);setTab('properties');renderTimeline();return}
 const b=ev.target.closest('[data-action]');if(b)action(b.dataset.action)
});
one('#ecs-name').addEventListener('change',e=>{S.name=e.target.value.slice(0,90)||'Mon Reel';saveLocal()});
one('.ecs-sidebody').addEventListener('change',e=>{
 const p=e.target.dataset.p,setting=e.target.dataset.setting;
 if(p){const target=p==='bg'||p==='duration'||p==='trimStart'?S:S.elements.find(q=>q.id===selected);if(!target)return;snapshot();let val=['text','color','bg'].includes(p)?e.target.value:Number(e.target.value);if(!Number.isFinite(val)&&typeof val==='number')return;if(p==='duration'){val=Math.max(1,Math.min(media.videoUrl?Math.max(1,(video.duration||60)-S.trimStart):60,val));S.duration=val;S.elements.forEach(x=>x.end=Math.min(val,x.end));seek(S.time)}else if(p==='trimStart'){S.trimStart=Math.max(0,Math.min(val,Math.max(0,(video.duration||0)-1)));S.duration=Math.min(S.duration,Math.max(1,(video.duration||S.duration)-S.trimStart));S.elements.forEach(x=>x.end=Math.min(S.duration,x.end));seek(S.time)}else if(p==='start')target.start=Math.max(0,Math.min(val,target.end-.1));else if(p==='end')target.end=Math.min(S.duration,Math.max(val,target.start+.1));else target[p]=val;if(p==='duration'||p==='trimStart'||p==='start'||p==='end')renderTimeline();saveLocal();draw();return}
 if(setting){snapshot();S[setting]=e.target.value;saveLocal();draw()}
});
one('.ecs-sidebody').addEventListener('input',e=>{
 if(e.target.id==='ecs-element-search'){const term=e.target.value.trim().toLocaleLowerCase('fr');all('.ecs-filterable').forEach(button=>{button.hidden=!button.textContent.toLocaleLowerCase('fr').includes(term)});return}
 const p=e.target.dataset.p;if(p==='text'){const el=S.elements.find(q=>q.id===selected);if(el){el.text=e.target.value;draw()}}if(p==='color'||p==='bg'){if(p==='bg')S.bg=e.target.value;else{const el=S.elements.find(q=>q.id===selected);if(el)el.color=e.target.value}draw()}
});
function coords(ev){const r=canvas.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*1080,y:(ev.clientY-r.top)/r.height*1920}}
canvas.addEventListener('pointerdown',ev=>{
 ev.preventDefault();const p=coords(ev),hit=[...S.elements].reverse().find(e=>S.time>=e.start&&S.time<=e.end&&p.x>=e.x&&p.x<=e.x+e.w&&p.y>=e.y&&p.y<=e.y+e.h);
 if(hit){selected=hit.id;snapshot();drag={id:hit.id,mode:p.x>hit.x+hit.w-60&&p.y>hit.y+hit.h-60?'resize':'move',px:p.x,py:p.y,x:hit.x,y:hit.y,w:hit.w,h:hit.h};canvas.setPointerCapture(ev.pointerId);setTab('properties')}else{selected=null;drag=null;renderSide()}
 renderTimeline();draw()
});
canvas.addEventListener('pointermove',ev=>{if(!drag)return;const p=coords(ev),el=S.elements.find(e=>e.id===drag.id);if(!el)return;const dx=p.x-drag.px,dy=p.y-drag.py;
 if(drag.mode==='move'){el.x=Math.max(0,Math.min(1080-el.w,drag.x+dx));el.y=Math.max(0,Math.min(1920-el.h,drag.y+dy))}
 else{el.w=Math.max(50,Math.min(1080-el.x,drag.w+dx));el.h=Math.max(45,Math.min(1920-el.y,drag.h+dy))}
 draw()
});
canvas.addEventListener('pointerup',()=>{if(drag){drag=null;renderSide();saveLocal()}});
canvas.addEventListener('dblclick',ev=>{const p=coords(ev),e=[...S.elements].reverse().find(x=>x.kind==='text'&&p.x>=x.x&&p.x<=x.x+x.w&&p.y>=x.y&&p.y<=x.y+x.h);if(e){const t=prompt('Modifier le texte',e.text);if(t!==null){snapshot();e.text=t;selected=e.id;setTab('properties');saveLocal()}}});
document.addEventListener('keydown',ev=>{if(root.style.display==='none'||!root.contains(document.activeElement)&&!canvas.matches(':hover'))return;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(ev.key==='Delete'||ev.key==='Backspace'){ev.preventDefault();action('delete')}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?redo():undo()}});
// Montage manuel : glisser un clip pour le déplacer, tirer ses bords pour changer sa durée.
one('#ecs-tracks').addEventListener('pointerdown',event=>{
 const button=event.target.closest('.ecs-clip[data-select]');if(!button)return;
 const clip=S.elements.find(e=>e.id===Number(button.dataset.select));if(!clip)return;
 event.preventDefault();event.stopPropagation();
 const r=button.getBoundingClientRect(),edge=Math.min(12,r.width/4),offset=event.clientX-r.left;
 const mode=offset<=edge?'start':r.right-event.clientX<=edge?'end':'move';
 const initialStart=clip.start,initialEnd=clip.end,initialX=event.clientX;
 snapshot();selected=clip.id;
 const applyDelta=ev=>{
   const delta=(ev.clientX-initialX)/70;
   if(mode==='start')clip.start=Math.max(0,Math.min(initialEnd-.1,initialStart+delta));
   else if(mode==='end')clip.end=Math.min(S.duration,Math.max(initialStart+.1,initialEnd+delta));
   else{
     const length=initialEnd-initialStart;
     clip.start=Math.min(Math.max(0,S.duration-length),Math.max(0,initialStart+delta));
     clip.end=clip.start+length;
   }
   button.style.left=clip.start*70+'px';
   button.style.width=Math.max(16,(clip.end-clip.start)*70)+'px';
   seek(Math.max(clip.start,Math.min(S.time,clip.end)));
 };
 const endMove=()=>{
   window.removeEventListener('pointermove',applyDelta);
   window.removeEventListener('pointercancel',endMove);
   renderTimeline();setTab('properties');saveLocal();
 };
 window.addEventListener('pointermove',applyDelta);
 window.addEventListener('pointerup',endMove,{once:true});
 window.addEventListener('pointercancel',endMove,{once:true});
});
const scroll=one('.ecs-timeline-scroll');
scroll.addEventListener('pointerdown',ev=>{if(ev.target.closest('button'))return;const bounds=one('#ecs-tracks').getBoundingClientRect();if(!bounds.width)return;const point=ev.clientX-bounds.left;seek(point/70);const move=e=>seek((e.clientX-bounds.left)/70);scroll.addEventListener('pointermove',move);scroll.addEventListener('pointerup',()=>scroll.removeEventListener('pointermove',move),{once:true})});
async function loadVideo(file){pause();if(media.videoUrl)URL.revokeObjectURL(media.videoUrl);media.videoUrl=URL.createObjectURL(file);video.src=media.videoUrl;video.dataset.filename=file.name;try{await new Promise((res,rej)=>{video.onloadedmetadata=res;video.onerror=()=>rej(new Error('Vidéo illisible'))});S.trimStart=0;S.duration=Math.min(60,Math.max(1,Math.round(video.duration*10)/10||5));S.elements.forEach(x=>x.end=Math.min(S.duration,x.end));seek(0);renderTimeline();renderSide();toast('Vidéo ajoutée : '+file.name);saveLocal()}catch(e){toast('Impossible de lire la vidéo : '+e.message)}}
async function loadImage(file,kind){const url=URL.createObjectURL(file);const im=new Image();im.src=url;try{await im.decode()}catch{URL.revokeObjectURL(url);toast('Image non lisible.');return}
 if(kind==='element'){const e=add('image',{x:140,y:490,w:790,h:790,sourceName:file.name});images.set(e.id,im)}
 else{if(media.imageUrl)URL.revokeObjectURL(media.imageUrl);media.imageUrl=url;media.bgImage=im;toast('Image de fond ajoutée : '+file.name)}
 draw();saveLocal()}
async function loadAudio(file){if(media.audioUrl)URL.revokeObjectURL(media.audioUrl);media.audioUrl=URL.createObjectURL(file);audio.src=media.audioUrl;audio.dataset.filename=file.name;audio.load();renderTimeline();renderSide();toast('Audio ajouté : '+file.name)}
one('#ecs-video-input').addEventListener('change',e=>{if(e.target.files[0])loadVideo(e.target.files[0]);e.target.value=''});
one('#ecs-audio-input').addEventListener('change',e=>{if(e.target.files[0])loadAudio(e.target.files[0]);e.target.value=''});
one('#ecs-image-input').addEventListener('change',async e=>{const a=[...e.target.files];for(const f of a)await loadImage(f,importKind);e.target.value=''});
const stage=one('.ecs-stagewrap');
stage.addEventListener('dragover',e=>{e.preventDefault();stage.classList.add('ecs-dragover')});
stage.addEventListener('dragleave',()=>stage.classList.remove('ecs-dragover'));
stage.addEventListener('drop',async e=>{e.preventDefault();stage.classList.remove('ecs-dragover');for(const f of [...e.dataTransfer.files]){if(f.type.startsWith('video/'))await loadVideo(f);else if(f.type.startsWith('audio/'))await loadAudio(f);else if(f.type.startsWith('image/'))await loadImage(f,'background')}});
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),4000)}
function drawPng(){const c=document.createElement('canvas');c.width=1080;c.height=1920;paint(c.getContext('2d'),S.time,false);c.toBlob(b=>b?download(b,'eloah-couverture.png'):toast('Impossible de créer le PNG.'),'image/png')}
function saveProject(){S.name=one('#ecs-name').value||'Mon Reel';saveLocal();download(new Blob([JSON.stringify({version:2,...serial(),assetsNotIncluded:true},null,2)],{type:'application/json'}),'eloah-reel-projet.json');toast('Projet enregistré. Conserve les médias séparément.')}
one('#ecs-project-input').addEventListener('change',async ev=>{const f=ev.target.files[0];if(!f)return;try{const s=JSON.parse(await f.text());if(!Array.isArray(s.elements))throw Error('Format inconnu');snapshot();apply({name:s.name||'Mon Reel',duration:Math.max(1,Math.min(60,s.duration||5)),trimStart:0,bg:s.bg||'#fffaf1',filter:s.filter||'none',brand:s.brand||'ELOAH',elements:s.elements.map(e=>({...e,id:nextId++}))});toast('Projet chargé. Réimporte les médias associés.');saveLocal()}catch(e){toast('Projet impossible à ouvrir : '+e.message)}ev.target.value=''});
let exportMixer=null;
async function connectExportAudio(stream){
 const C=window.AudioContext||window.webkitAudioContext;
 if(!C)throw Error('Web Audio non pris en charge');
 if(!exportMixer){
   const context=new C(),target=context.createMediaStreamDestination(),sources=[];
   for(const player of [video,audio]){
     const source=context.createMediaElementSource(player);
     source.connect(target);
     source.connect(context.destination);
     sources.push(source);
   }
   exportMixer={context,target,sources};
 }
 await exportMixer.context.resume();
 const audioTrack=exportMixer.target.stream.getAudioTracks()[0];
 if(!audioTrack)throw Error('Pas de piste audio disponible');
 stream.addTrack(audioTrack);
 return true;
}
async function exportVideo(){
 if(busy)return;if(!window.MediaRecorder||!canvas.captureStream){toast('Export vidéo non pris en charge par ce navigateur. Utilise un navigateur compatible ou exporte la couverture PNG.');return}
 const mime=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime){toast('Aucun format vidéo exportable sur ce navigateur.');return}
 const label=one('[data-action=export]');label.disabled=true;label.textContent='Export en cours…';busy=true;pause();seek(0);
 try{
  const stream=canvas.captureStream(30);let withSound=false;
  if(media.videoUrl||media.audioUrl){try{withSound=await connectExportAudio(stream)}catch(e){console.warn('Audio non disponible dans cet export',e)}}
  const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5500000});const chunks=[];
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  const done=new Promise((res,rej)=>{recorder.onstop=res;recorder.onerror=e=>rej(new Error('Enregistrement interrompu'))});
  recorder.start(250);S.time=0;S.playing=true;if(media.videoUrl){video.currentTime=S.trimStart;await video.play().catch(()=>{})}if(media.audioUrl){audio.currentTime=0;await audio.play().catch(()=>{})}
  await new Promise(resolve=>{const end=performance.now()+S.duration*1000;const timer=setInterval(()=>{if(performance.now()>=end){clearInterval(timer);resolve()}},60)});
  pause();recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:mime});
  if(!blob.size)throw Error('Fichier vidéo vide');const ext=mime.startsWith('video/mp4')?'mp4':'webm';download(blob,'eloah-reel.'+ext);toast('Export '+ext.toUpperCase()+' terminé'+(withSound?' avec piste audio. Vérifie sa lecture après export.':'. Export sans son : vérifie les autorisations du navigateur.') );
 }catch(e){toast('Export impossible : '+e.message)}
 finally{busy=false;label.disabled=false;label.textContent='⬇ Exporter vidéo';pause();seek(0)}
}
try{const saved=JSON.parse(localStorage.getItem('eloah_reel_editor')||'null');if(saved&&Array.isArray(saved.elements)){Object.assign(S,saved);S.trimStart=0;S.time=0;S.playing=false;nextId=Math.max(1,...S.elements.map(e=>+e.id+1||1))}}catch{}
one('#ecs-name').value=S.name;renderSide();renderTimeline();requestAnimationFrame(tick);
})();
