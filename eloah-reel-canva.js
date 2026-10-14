(()=>{
'use strict';
const oldMain=document.querySelector('body > main');
if(!oldMain || document.getElementById('eloah-canva-studio'))return;
const legacy=document.createElement('div');legacy.id='eloah-reel-legacy';legacy.style.display='none';
while(oldMain.firstChild)legacy.appendChild(oldMain.firstChild);
oldMain.append(legacy);
const root=document.createElement('div');root.id='eloah-canva-studio';
oldMain.insertBefore(root,legacy);
root.innerHTML='<div class="ecs-top"><a href="mes-univers.html" title="Retour">←</a><div class="ecs-brand">ELOAH / REEL STUDIO</div><button data-action="old">Ancien studio</button><input aria-label="Nom du projet" class="ecs-projectname" id="ecs-name" value="Mon Reel"><button data-action="undo" title="Annuler">↶</button><button data-action="redo" title="Rétablir">↷</button><div class="ecs-topspacer"></div><button class="ecs-top-import" data-tab="import">▧ Mes 351 images</button><button class="ecs-top-projects" data-tab="projects" title="Retrouver mes créations et dossiers">▣ Mes projets</button><button data-action="librarySave" title="Enregistrer ce Reel dans mes projets ELOAH">Enregistrer</button><button class="ecs-export" data-action="export">⬇ Exporter vidéo</button></div><div class="ecs-layout"><nav class="ecs-rail" aria-label="Outils de création"></nav><aside class="ecs-sidebar ecs-open"><div class="ecs-sidehead"></div><div class="ecs-sidebody"></div></aside><div class="ecs-center"><div class="ecs-toolbar"><button data-action="properties">✎ Modifier</button><button data-action="duplicate">⧉ Dupliquer</button><button data-action="delete">⌫ Supprimer</button><button data-action="forward">↑ Premier plan</button><button data-action="backward">↓ Arrière-plan</button><div class="ecs-tbspacer"></div><span>9:16 · 1080 × 1920</span></div><div class="ecs-stagewrap"><div class="ecs-stagehint">Glisse les éléments sur la page</div><div class="ecs-stagebox"><canvas id="ecs-canvas" width="1080" height="1920" aria-label="Éditeur de Reel. Clique et déplace un élément."></canvas></div></div><div class="ecs-player"><button data-action="play" id="ecs-play">▶</button><span id="ecs-clock">0:00 / 0:05</span><button data-action="restart" title="Revenir au début">⟲</button><button data-action="png">📷 Couverture PNG</button></div><div class="ecs-timeline"><div class="ecs-timelinehead"><strong>Montage vidéo</strong><button data-tab="import">＋ Ajouter un média</button><button data-tab="text">＋ Texte</button><div class="ecs-tbspacer"></div><span class="ecs-note">Déplace la tête de lecture</span></div><div class="ecs-timeline-scroll"><div id="ecs-timeruler" class="ecs-ruler"></div><div id="ecs-tracks"></div></div></div></div></div><input type="file" class="ecs-fileinput" id="ecs-video-input" accept="video/*"><input type="file" class="ecs-fileinput" id="ecs-image-input" accept="image/*" multiple><input type="file" class="ecs-fileinput" id="ecs-audio-input" accept="audio/*"><input type="file" class="ecs-fileinput" id="ecs-project-input" accept=".json,application/json"><div class="ecs-toast ecs-hide" role="status"></div>';
const one=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
const canvas=one('#ecs-canvas'),ctx=canvas.getContext('2d');
const tabs=[['models','▦','Modèles'],['elements','◈','Éléments'],['text','T','Texte'],['brand','♛','Marque'],['import','⇧','Importer'],['tools','⚒','Outils'],['projects','▤','Projets'],['photos','▧','Photos'],['audio','♫','Audio'],['videos','▶','Vidéos']];
one('.ecs-rail').innerHTML=tabs.map(([key,icon,label])=>'<button class="ecs-railbtn" data-tab="'+key+'"><span class="ecs-symbol">'+icon+'</span><span>'+label+'</span></button>').join('');
const video=document.createElement('video'),audio=document.createElement('audio');
video.playsInline=true;video.preload='auto';audio.preload='auto';
const media={videoUrl:null,audioUrl:null,imageUrl:null,bgImage:null};
const soundLibrary=[
 {id:'elan',name:'Élan lumineux',artist:'ELOAH · Composition originale',duration:10,style:'Calme',icon:'✦',css:'aurora',notes:[60,64,67,72,67,64,62,67]},
 {id:'pulse',name:'Pulse Crew',artist:'ELOAH · Composition originale',duration:10,style:'Dynamique',icon:'♫',css:'pulse',notes:[48,55,60,55,48,55,63,55]},
 {id:'piano',name:'Piano des souvenirs',artist:'ELOAH · Composition originale',duration:10,style:'Émotion',icon:'♬',css:'piano',notes:[57,60,64,60,55,60,64,67]},
 {id:'summer',name:'Lumière d’été',artist:'ELOAH · Composition originale',duration:10,style:'Solaire',icon:'☀',css:'summer',notes:[60,67,69,67,64,69,72,67]},
 {id:'latin',name:'Tempo Latino',artist:'ELOAH · Composition originale',duration:10,style:'Rythmé',icon:'♪',css:'latin',notes:[57,60,64,69,64,60,62,67]},
 {id:'velka',name:'Minuit velours',artist:'ELOAH · Composition originale',duration:10,style:'Cinématique',icon:'◐',css:'velka',notes:[45,52,57,52,48,52,55,52]}
];
const soundCache=new Map();
let audioView='home',recording=null,recordStatus='',speechStatus='',voiceSelection='',voiceSpeed=1,voiceText='Bienvenue dans mon univers. Voici mon histoire.',audioPreview=null,audioPreviewId=null,audioBusy=false,recentSounds=[];
try{recentSounds=JSON.parse(localStorage.getItem('eloah_reel_recent_audio')||'[]').filter(v=>soundLibrary.some(t=>t.id===v)).slice(0,5)}catch{}
function soundRow(t){
 const playing=t.id===audioPreviewId;
 return '<div class="ecs-soundrow" data-audio-track="'+t.id+'" data-search="'+xss((t.name+' '+t.artist+' '+t.style).toLocaleLowerCase('fr'))+'"><button type="button" class="ecs-soundplay" data-preview-track="'+t.id+'" aria-label="'+(playing?'Arrêter':'Écouter')+' '+xss(t.name)+'"><span class="ecs-soundart '+t.css+'">'+(playing?'Ⅱ':t.icon)+'</span></button><div class="ecs-soundcopy"><strong>'+xss(t.name)+'</strong><small>'+xss(t.artist)+' · 0:10</small></div><button type="button" class="ecs-soundadd" data-add-track="'+t.id+'" title="Ajouter à la timeline" aria-label="Ajouter '+xss(t.name)+' à la timeline">＋</button></div>';
}
function audioSection(title,items){
 return '<section class="ecs-audiosection" data-soundsection><div class="ecs-sectiontitle"><strong>'+xss(title)+'</strong><span>'+items.length+' sons</span></div>'+items.map(soundRow).join('')+'</section>';
}
function addSynthNote(context,at,duration,midi,wave='sine',volume=.11){
 const freq=440*Math.pow(2,(midi-69)/12);
 const o=context.createOscillator(),g=context.createGain();
 o.type=wave;o.frequency.setValueAtTime(freq,at);
 g.gain.setValueAtTime(0,at);
 g.gain.linearRampToValueAtTime(volume,at+.023);
 g.gain.exponentialRampToValueAtTime(.001,at+duration);
 o.connect(g).connect(context.destination);o.start(at);o.stop(at+duration+.02);
}
function addSynthPercussion(context,at,volume=.065){
 const o=context.createOscillator(),g=context.createGain();o.type='triangle';o.frequency.setValueAtTime(130,at);o.frequency.exponentialRampToValueAtTime(55,at+.12);
 g.gain.setValueAtTime(volume,at);g.gain.exponentialRampToValueAtTime(.001,at+.17);
 o.connect(g).connect(context.destination);o.start(at);o.stop(at+.18);
}
async function createSoundBlob(track){
 const rate=22050,duration=track.duration;const C=window.OfflineAudioContext||window.webkitOfflineAudioContext;
 if(!C)throw Error('Génération musicale indisponible dans ce navigateur');
 const context=new C(1,rate*duration,rate);
 const fast=['pulse','latin','summer'].includes(track.id);
 const beat=fast?.42:.67,steps=Math.ceil(duration/beat);
 for(let i=0;i<steps;i++){
   const at=i*beat;if(at+beat*.9>=duration)break;
   const midi=track.notes[i%track.notes.length];
   addSynthNote(context,at,Math.min(.72,beat*.92),midi,track.id==='piano'?'sine':'triangle',fast?.11:.085);
   if(i%2===0)addSynthNote(context,at,Math.min(.8,beat*1.4),midi-12,'sine',.09);
   if(fast&&(i%2===0||track.id==='latin'&&i%3===2))addSynthPercussion(context,at,.05);
 }
 const rendered=await context.startRendering();
 const ch=rendered.getChannelData(0),buffer=new ArrayBuffer(44+ch.length*2),dv=new DataView(buffer);
 const str=(off,v)=>{for(let i=0;i<v.length;i++)dv.setUint8(off+i,v.charCodeAt(i))};
 str(0,'RIFF');dv.setUint32(4,36+ch.length*2,true);str(8,'WAVE');str(12,'fmt ');dv.setUint32(16,16,true);
 dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);str(36,'data');dv.setUint32(40,ch.length*2,true);
 for(let i=0;i<ch.length;i++){const x=Math.max(-1,Math.min(1,ch[i]));dv.setInt16(44+2*i,x<0?x*32768:x*32767,true)}
 return new Blob([buffer],{type:'audio/wav'});
}
async function getSound(track){
 if(soundCache.has(track.id))return soundCache.get(track.id);
 const blob=await createSoundBlob(track),url=URL.createObjectURL(blob),value={blob,url};
 soundCache.set(track.id,value);return value;
}
async function previewSound(id){
 const track=soundLibrary.find(t=>t.id===id);if(!track)return;
 if(audioPreview){audioPreview.pause();audioPreview.currentTime=0;audioPreview=null;if(audioPreviewId===id){audioPreviewId=null;renderSide();return}}
 if(audioBusy)return;audioBusy=true;
 try{
   const item=await getSound(track);audioPreview=new Audio(item.url);audioPreviewId=id;
   audioPreview.onended=()=>{audioPreview=null;audioPreviewId=null;if(activeTab==='audio')renderSide()};
   await audioPreview.play();if(activeTab==='audio')renderSide();
 }catch(e){audioPreviewId=null;toast('Écoute impossible : '+e.message)}
 finally{audioBusy=false}
}
async function addSound(id){
 const track=soundLibrary.find(t=>t.id===id);if(!track||audioBusy)return;audioBusy=true;
 try{
  if(audioPreview){audioPreview.pause();audioPreview=null;audioPreviewId=null}
  const item=await getSound(track);
  await loadAudio(new File([item.blob],track.name.replace(/[^a-z0-9-]/gi,'-')+'.wav',{type:'audio/wav'}));
  recentSounds=[id,...recentSounds.filter(x=>x!==id)].slice(0,5);
  try{localStorage.setItem('eloah_reel_recent_audio',JSON.stringify(recentSounds))}catch{}
  if(activeTab==='audio')renderSide();
  toast('♫ '+track.name+' ajouté à la timeline.');
 }catch(e){toast('Ajout de musique impossible : '+e.message)}
 finally{audioBusy=false}
}
async function startVoiceRecording(){
 if(recording)return;
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){recordStatus='Enregistrement non pris en charge par ce navigateur.';renderSide();return}
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  const options=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(m=>MediaRecorder.isTypeSupported(m));
  const recorder=new MediaRecorder(stream,options?{mimeType:options}:undefined),chunks=[];
  const rec={recorder,stream,chunks};recording=rec;
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onerror=()=>{recordStatus='Une erreur est survenue pendant l’enregistrement.';stream.getTracks().forEach(t=>t.stop());recording=null;renderSide()};
  recorder.onstop=async()=>{
    stream.getTracks().forEach(t=>t.stop());recording=null;
    const type=recorder.mimeType||'audio/webm',ext=type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'webm';
    const blob=new Blob(chunks,{type});
    if(!blob.size){recordStatus='Aucun son enregistré.';renderSide();return}
    const file=new File([blob],'Voix-off-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.'+ext,{type});
    await loadAudio(file);recordStatus='Voix enregistrée et ajoutée à la timeline.';renderSide();
  };
  recorder.start(250);recordStatus='Enregistrement en cours…';renderSide();
 }catch(e){recordStatus=e.name==='NotAllowedError'?'Permission du microphone refusée. Autorise-le dans ton navigateur.':'Microphone indisponible : '+e.message;renderSide()}
}
function stopVoiceRecording(){if(recording?.recorder.state==='recording')recording.recorder.stop()}
function synthPlay(){
 if(!window.speechSynthesis){speechStatus='Lecture vocale non disponible sur cet appareil.';renderSide();return}
 window.speechSynthesis.cancel();
 const input=one('#ecs-tts-text');voiceText=input?.value?.trim()||voiceText;
 if(!voiceText){speechStatus='Écris un texte à lire.';renderSide();return}
 const say=new SpeechSynthesisUtterance(voiceText);say.lang='fr-FR';say.rate=voiceSpeed;
 const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('fr'));
 say.voice=voices.find(v=>v.name===voiceSelection)||voices[0]||null;
 say.onstart=()=>{speechStatus='Lecture en cours sur ton appareil.'};
 say.onend=()=>{speechStatus='Lecture terminée. Pour un fichier audio, utilise la voix off enregistrée.'};
 say.onerror=()=>{speechStatus='Cette voix est indisponible. Essaie une autre.'};
 window.speechSynthesis.speak(say);speechStatus='Préparation de la lecture vocale…';renderSide();
}
// Bibliothèque de vrais enregistrements CC0, chargés à la demande depuis le dépôt public FreePD.
// Les droits sont indépendants de Canva : https://github.com/0lhi/FreePD/blob/stream/LICENSE
const publicMusic={
 loading:false,loaded:false,error:'',tracks:[],lastFilter:'',activePreview:null,
 source:'https://github.com/0lhi/FreePD'
};
const supportedAudioExtensions=/\.(?:mp3|ogg|oga|wav|m4a)$/i;
function audioDuration(s){if(!Number.isFinite(s))return '—';const t=Math.floor(s);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')}
function prettyMusicName(path){
 const name=path.split('/').pop().replace(/\.(mp3|ogg|oga|wav|m4a)$/i,'').replace(/[_-]+/g,' ').replace(/^\d+\s*[-. ]\s*/,'').trim();
 return name||'Musique sans titre';
}
function freepdMusicUrl(path){
 return 'https://raw.githubusercontent.com/0lhi/FreePD/stream/'+path.split('/').map(encodeURIComponent).join('/');
}
async function loadPublicMusic(){
 if(publicMusic.loaded||publicMusic.loading)return;
 publicMusic.loading=true;publicMusic.error='';
 if(activeTab==='audio'&&audioView==='home')renderSide();
 try{
  const response=await fetch('https://api.github.com/repos/0lhi/FreePD/git/trees/stream?recursive=1',{headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok)throw Error('Catalogue indisponible (HTTP '+response.status+')');
  const data=await response.json();
  if(!Array.isArray(data.tree))throw Error('Le catalogue ne contient pas de pistes lisibles.');
  const paths=data.tree.filter(item=>item.type==='blob'&&supportedAudioExtensions.test(item.path)&&item.size>2048&&item.size<30000000);
  if(!paths.length)throw Error('Aucun fichier musical compatible retrouvé dans la source.');
  publicMusic.tracks=paths.map((item,index)=>({
   id:'freepd-'+index,path:item.path,name:prettyMusicName(item.path),
   artist:'FreePD · Musique CC0',style:item.path.split('/')[0]||'Musique',
   icon:['♫','▶','✦','♪','♬'][index%5],css:['aurora','piano','summer','pulse','velka'][index%5],
   url:freepdMusicUrl(item.path),size:item.size,duration:null
  }));
  publicMusic.loaded=true;
 }catch(e){publicMusic.error=e.message}
 finally{publicMusic.loading=false;if(activeTab==='audio'&&audioView==='home')renderSide()}
}
function publicMusicRow(t){
 const playing=publicMusic.activePreview===t.id;
 const text=(t.name+' '+t.artist+' '+t.style).toLocaleLowerCase('fr');
 return '<div class="ecs-soundrow ecs-real-track" data-public-track="'+xss(t.id)+'" data-search="'+xss(text)+'"><button type="button" class="ecs-soundplay" data-real-preview="'+xss(t.id)+'" aria-label="Écouter '+xss(t.name)+'"><span class="ecs-soundart '+t.css+'">'+(playing?'Ⅱ':t.icon)+'</span></button><div class="ecs-soundcopy"><strong>'+xss(t.name)+'</strong><small>'+xss(t.artist)+' · '+xss(t.style)+(t.duration?' · '+audioDuration(t.duration):'')+'</small></div><button type="button" class="ecs-soundadd" data-real-add="'+xss(t.id)+'" title="Ajouter cette musique au Reel">＋</button></div>';
}
function publicMusicMarkup(){
 if(publicMusic.loading)return '<section class="ecs-audiosection"><div class="ecs-sectiontitle"><strong>Vraies musiques · Domaine public</strong></div><p class="ecs-note">Chargement de la bibliothèque FreePD…</p></section>';
 if(publicMusic.error)return '<section class="ecs-audiosection"><div class="ecs-sectiontitle"><strong>Vraies musiques · Domaine public</strong></div><p class="ecs-note">'+xss(publicMusic.error)+'</p><button type="button" class="ecs-pillbtn" data-retry-music>↻ Réessayer</button> <a class="ecs-music-source" href="https://github.com/0lhi/FreePD" target="_blank" rel="noopener noreferrer">Bibliothèque source ↗</a></section>';
 if(!publicMusic.loaded)return '<section class="ecs-audiosection"><div class="ecs-sectiontitle"><strong>Vraies musiques · Domaine public</strong></div><button class="ecs-pillbtn primary" data-retry-music>Charger les musiques gratuites</button></section>';
 const selected=publicMusic.tracks.slice(0,90);
 const groups=[['Dynamique & électronique',selected.filter(t=>/electronic|upbeat|world|dance/i.test(t.style))],['Romantique & cinématique',selected.filter(t=>/romance|scoring|epic|zoned/i.test(t.style))],['Ambiance & autres styles',selected.filter(t=>!/electronic|upbeat|world|dance|romance|scoring|epic|zoned/i.test(t.style))]];
 return '<div class="ecs-freepd"><div class="ecs-sectiontitle"><strong>Vraies musiques · Domaine public</strong><span>'+publicMusic.tracks.length+' titres</span></div><p class="ecs-note">Enregistrements CC0. ▶ pour écouter, ＋ pour ajouter une piste complète au Reel.</p>'+groups.filter(x=>x[1].length).map(([label,items])=>'<section class="ecs-audiosection" data-soundsection><div class="ecs-sectiontitle"><strong>'+label+'</strong><span>'+items.length+'</span></div>'+items.map(publicMusicRow).join('')+'</section>').join('')+'<a class="ecs-music-source" target="_blank" rel="noopener noreferrer" href="https://github.com/0lhi/FreePD">Source et licence CC0 ↗</a></div>';
}
const mixkitExamples=[
 {name:'Driving Ambition',artist:'Ahjay Stelino',time:'1:42',style:'Motivation',category:'mood/uplifting'},
 {name:'Classical vibes 4',artist:'Grigoriy Nuzhny',time:'2:17',style:'Piano',category:'instrument/piano'},
 {name:'Cat Walk',artist:'Arulo',time:'2:04',style:'Dance / House',category:'edm'},
 {name:'Wedding 01',artist:'Francisco Alvear',time:'2:26',style:'Piano émotion',category:'film-score'},
 {name:'Silent Descent',artist:'Eugenio Mininni',time:'2:40',style:'Cinématique',category:'film-score'},
 {name:'Latin Lovers',artist:'Ahjay Stelino',time:'1:35',style:'Latino',category:'instrument/piano'},
 {name:'Summer Fun',artist:'Ahjay Stelino',time:'2:19',style:'Été',category:'instrument/piano'},
 {name:'Gimme that Groove!',artist:'Michael Ramir C.',time:'1:28',style:'Funk',category:''}
];
function mixkitMarkup(){
 return '<section class="ecs-audiosection" data-soundsection><div class="ecs-sectiontitle"><strong>À découvrir · Artistes Mixkit</strong><span>8 titres</span></div><p class="ecs-note">Pour respecter les conditions de leur catalogue, télécharge ces morceaux sur Mixkit puis importe le MP3 dans ELOAH.</p>'+mixkitExamples.map((t,i)=>{
  const dest='https://mixkit.co/free-stock-music/'+(t.category?t.category+'/':'');
  return '<div class="ecs-soundrow ecs-mixkit-track" data-search="'+xss((t.name+' '+t.artist+' '+t.style).toLowerCase())+'"><a class="ecs-soundplay" href="'+dest+'" target="_blank" rel="noopener noreferrer" title="Trouver cette musique sur Mixkit"><span class="ecs-soundart '+['aurora','piano','pulse','velka','summer','latin'][i%6]+'">♫</span></a><div class="ecs-soundcopy"><strong>'+xss(t.name)+'</strong><small>'+xss(t.artist)+' · '+xss(t.time)+'</small></div><a class="ecs-soundadd" href="'+dest+'" target="_blank" rel="noopener noreferrer" title="Trouver et télécharger sur Mixkit" aria-label="Ouvrir Mixkit pour '+xss(t.name)+'">↗</a></div>';
 }).join('')+'</section>';
}
async function previewPublicMusic(id){
 const t=publicMusic.tracks.find(t=>t.id===id);if(!t)return;
 if(audioPreview){audioPreview.pause();audioPreview=null;if(publicMusic.activePreview===id){publicMusic.activePreview=null;renderSide();return}}
 if(audioBusy)return;audioBusy=true;
 try{
  audioPreview=new Audio(t.url);publicMusic.activePreview=id;
  audioPreview.preload='metadata';
  audioPreview.onloadedmetadata=()=>{if(Number.isFinite(audioPreview.duration))t.duration=audioPreview.duration};
  audioPreview.onended=()=>{audioPreview=null;publicMusic.activePreview=null;if(activeTab==='audio'&&audioView==='home')renderSide()};
  await audioPreview.play();
  toast('▶ '+t.name+' · FreePD CC0');
 }catch(e){publicMusic.activePreview=null;audioPreview=null;toast('Écoute impossible : '+e.message+' — essaie un autre morceau.')}
 finally{audioBusy=false;if(activeTab==='audio'&&audioView==='home')renderSide()}
}
async function addPublicMusic(id){
 const t=publicMusic.tracks.find(t=>t.id===id);if(!t||audioBusy)return;
 audioBusy=true;toast('Téléchargement de '+t.name+'…');
 try{
  if(audioPreview){audioPreview.pause();audioPreview=null;publicMusic.activePreview=null}
  const response=await fetch(t.url);
  if(!response.ok)throw Error('HTTP '+response.status);
  const blob=await response.blob();
  if(!blob.size||blob.size>30000000)throw Error('Fichier audio invalide ou trop volumineux');
  const ext=t.path.split('.').pop().toLowerCase();
  const mime=ext==='mp3'?'audio/mpeg':ext==='ogg'||ext==='oga'?'audio/ogg':ext==='wav'?'audio/wav':'audio/mp4';
  const file=new File([blob],t.name+'.'+ext,{type:mime});
  await loadAudio(file);
  toast('♫ '+t.name+' ajouté à la timeline · musique CC0');
  if(activeTab==='audio'&&audioView==='home')renderSide();
 }catch(e){toast('Import impossible : '+e.message+'. Ouvre le catalogue source puis importe le fichier téléchargé.')}
 finally{audioBusy=false}
}
function renderAudio(){
 if(audioView==='record')return '<button class="ecs-els-back" data-audio-view="home">← Audio</button><h3 class="ecs-panelheading">Enregistrer une voix off</h3><p class="ecs-note">Autorise ton microphone, parle, puis arrête. La prise sera placée dans la piste audio du montage.</p><div class="ecs-audio-rec"><span class="ecs-rec-mic">🎙</span><strong>'+(recording?'Enregistrement en cours…':'Microphone prêt')+'</strong><p class="ecs-note">Enregistre dans un endroit calme.</p>'+(recording?btn('recordStop','■ Arrêter l’enregistrement',true):btn('recordStart','● Enregistrer ma voix',true))+'</div><p class="ecs-note ecs-rec-status" role="status">'+xss(recordStatus||'Aucun enregistrement pour le moment.')+'</p>'+(media.audioUrl?'<p class="ecs-note">Piste actuelle : '+xss(audio.dataset.filename||'Audio')+'</p>':'')+btn('importAudio','Importer une voix enregistrée');
 if(audioView==='tts'){
  const voices=typeof speechSynthesis!=='undefined'?speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('fr')):[];
  return '<button class="ecs-els-back" data-audio-view="home">← Audio</button><h3 class="ecs-panelheading">Créer une voix de synthèse</h3><p class="ecs-note">Aperçu vocal avec une voix française de ton appareil. Ce mode n’utilise pas un générateur IA externe et ne produit pas encore un fichier audio exportable.</p><label class="ecs-sidelabel" for="ecs-tts-text">Texte à lire</label><textarea id="ecs-tts-text" rows="6">'+xss(voiceText)+'</textarea><label class="ecs-sidelabel" for="ecs-tts-voice">Voix française</label><select id="ecs-tts-voice">'+(voices.length?voices.map((v,i)=>'<option value="'+i+'" '+(voiceSelection===v.name?'selected':'')+'>'+xss(v.name)+' · '+xss(v.lang)+'</option>').join(''):'<option value="">Meilleure voix disponible</option>')+'</select><label class="ecs-sidelabel" for="ecs-tts-speed">Vitesse de lecture</label><select id="ecs-tts-speed">'+[.8,1,1.15,1.3].map(v=>'<option value="'+v+'" '+(voiceSpeed===v?'selected':'')+'>'+v+'×</option>').join('')+'</select><div class="ecs-audio-buttons">'+btn('voicePlay','▶ Écouter',true)+btn('voiceStop','■ Arrêter')+'</div><p class="ecs-note" role="status">'+xss(speechStatus||'La lecture vocale se fait sur ton appareil et ne sera pas ajoutée à l’export vidéo.')+'</p>';
 }
 const recent=recentSounds.map(id=>soundLibrary.find(t=>t.id===id)).filter(Boolean);
 return '<div class="ecs-audio-header"><button data-tab="elements" aria-label="Retour aux éléments">←</button><strong>Audio</strong></div><div class="ecs-search"><input id="ecs-audio-search" placeholder="Rechercher des éléments" aria-label="Rechercher des sons"><span>⌕</span></div><div class="ecs-sectiontitle"><strong>Voix off</strong></div><div class="ecs-audio-voicecards"><button type="button" data-audio-view="record"><span class="ecs-voiceicon mic">♩</span><strong>Enregistrez une voix off</strong></button><button type="button" data-audio-view="tts"><span class="ecs-voiceicon ai">Aa</span><strong>Générez une voix de synthèse</strong></button></div>'+publicMusicMarkup()+mixkitMarkup()+audioSection('Utilisés récemment · Boucles ELOAH',recent.length?recent:[])+audioSection('Compositions ELOAH · 10 s',soundLibrary)+'<div class="ecs-audio-footer"><p class="ecs-note">Musiques originales ELOAH et pistes FreePD CC0 disponibles. Les pistes Mixkit s’importent après téléchargement sur leur site.</p>'+btn('importAudio','＋ Importer une musique',true)+(media.audioUrl?'<div class="ecs-audio-loaded"><strong>♫ Piste ajoutée</strong><span>'+xss(audio.dataset.filename||'Audio')+'</span>'+btn('removeAudio','Retirer la piste')+'</div>':'')+'</div>';
}

let images=new Map(),activeTab=['import','tools','text','brand','elements','projects'].includes(new URLSearchParams(window.location.search).get('onglet'))?new URLSearchParams(window.location.search).get('onglet'):'models',elementsCategory=null,selected=null,nextId=1,drag=null,history=[],future=[],lastFrame=performance.now(),busy=false,toastTimer=0,importKind='background';
const S={name:'Mon Reel',duration:5,trimStart:0,time:0,playing:false,bg:'#fffaf1',filter:'none',brand:'Power & Glam',elements:[]};
let projectLibrary=null;
const elementCategories=[
 ['audio','Audio','♫','audio','audio'],
 ['videos','Vidéos','▶','video','videos'],
 ['photos','Photos','▧','photo','photos'],
 ['illustrations','Illustrations','🌻','illustration',''],
 ['relief','3D','◆','relief',''],
 ['animations','Animations','✨','animation',''],
 ['frames','Cadres','▱','frame',''],
 ['grids','Grilles','▦','grid',''],
 ['mockups','Maquettes','▣','mockup',''],
 ['shapes','Formes','◒','shape',''],
 ['charts','Graphiques','▥','chart','']
];
const elementOptions={
 illustrations:[['heart','❤️ Cœur'],['flower','🌼 Fleur'],['bolt','⚡ Éclair'],['bubble','💬 Bulle']],
 relief:[['cube','◈ Cube en relief'],['sphere','● Sphère en relief']],
 frames:[['frame','▣ Cadre rectangulaire'],['roundframe','◯ Cadre rond']],
 grids:[['grid2','▦ Grille 2 colonnes'],['grid3','▤ Grille 3 colonnes']],
 mockups:[['phone','▯ Téléphone'],['tablet','▭ Tablette']],
 shapes:[['rect','▰ Rectangle'],['ellipse','● Cercle'],['star','★ Étoile'],['triangle','▲ Triangle'],['line','━ Ligne']],
 charts:[['bars','▥ Graphique en barres'],['pie','◕ Diagramme circulaire']]
};
let illustrationView='home',illustrationSearch='';
const illustrationGroups=[
 ['Recommandations magiques',['necklace','rings','spiral','eye','charm','earring']],
 ['En vedette',['sunburst','crocodile','books','vase','butterfly','flower','gem','daisy']],
 ['Dégradés',['fade-ink','fade-sunset','fade-halo','fade-ocean','fade-blush','fade-lilac','fade-gold','fade-forest']],
 ['Animations',['robot','sale','questions','confetti','shooting','sparkles','orbit','pulse']],
 ['Réseaux sociaux',['paperplane','play','chat','like','thumb','hashtag','at','share','camera']]
];
function illustrationTile(ill){
 if(!ill)return '';
 const url=window.ELOAHIllustrations?.uri(ill.id,ill.color)||'';
 return '<button type="button" class="ecs-ill-tile" data-ill-add="'+xss(ill.id)+'" data-search="'+xss((ill.name+' '+ill.group).toLowerCase())+'" title="Ajouter '+xss(ill.name)+' au Reel"><img alt="" loading="lazy" decoding="async" src="'+url+'"><span class="ecs-ill-tilelabel">'+xss(ill.name)+'</span><span class="ecs-ill-tileplus" aria-hidden="true">＋</span></button>';
}
function illustrationSection(title,ids,slug){
 const list=ids.map(id=>window.ELOAHIllustrations?.byId.get(id)).filter(Boolean);
 if(!list.length)return '';
 return '<section class="ecs-ill-section" data-ill-section><div class="ecs-sectiontitle"><strong>'+xss(title)+'</strong><button type="button" data-ill-group="'+slug+'">Afficher tout →</button></div><div class="ecs-ill-strip">'+list.map(illustrationTile).join('')+'</div></section>';
}
function illustrationCatalog(){
 if(!window.ELOAHIllustrations)return '<p class="ecs-note">La bibliothèque d’illustrations n’a pas pu être chargée. Actualise la page.</p>';
 const recent=S.elements.filter(e=>e.kind==='vector').slice(-14).reverse().map(e=>e.variant).filter(id=>window.ELOAHIllustrations.byId.has(id));
 const header='<div class="ecs-audio-header"><button type="button" data-cat="overview" aria-label="Retour à toutes les catégories">←</button><strong>Illustrations</strong></div><div class="ecs-search"><span>＋</span><input id="ecs-ill-search" placeholder="Rechercher des illustrations" aria-label="Rechercher des illustrations" value="'+xss(illustrationSearch)+'"><span aria-hidden="true">⌕</span></div>';
 if(illustrationView!=='home'){
  const group=illustrationView==='recent'?null:illustrationGroups[Number(illustrationView.slice(1))];
  const ids=illustrationView==='recent'?recent:group?.[1]||[];
  return header+'<button class="ecs-els-back" type="button" data-ill-group="home">← Toutes les illustrations</button><h3 class="ecs-panelheading">'+xss(illustrationView==='recent'?'Utilisés récemment':group?.[0]||'Illustrations')+'</h3><div class="ecs-ill-grid">'+ids.map(id=>illustrationTile(window.ELOAHIllustrations.byId.get(id))).join('')+'</div>';
 }
 return header+(recent.length?illustrationSection('Utilisés récemment',recent.slice(0,8),'recent'):'')+illustrationGroups.map(([title,ids],i)=>illustrationSection(title,ids,'g'+i)).join('')+
 '<p class="ecs-note ecs-ill-license">Illustrations vectorielles originales ELOAH : tu peux les déplacer, les redimensionner, modifier leur couleur et les animer dans ton montage. Elles sont intégrées aux exports.</p>';
}
let animationView='home',animationSearch='';
function stickerCard(a){
 const lib=window.ELOAHAnimations;
 const src=lib?.uri(a.id,a.color)||'';
 return '<button type="button" class="ecs-anim-card" data-sticker="'+xss(a.id)+'" data-search="'+xss((a.name+' '+a.group).toLocaleLowerCase('fr'))+'" title="Ajouter '+xss(a.name)+'"><span class="ecs-anim-stage '+xss(a.motion)+'"><img src="'+src+'" alt="" loading="lazy" decoding="async"></span><span class="ecs-anim-cardlabel">'+xss(a.name)+'</span><span class="ecs-anim-add" aria-hidden="true">＋</span></button>';
}
function stickerSection(title,items,id){
 if(!items.length)return '';
 return '<section class="ecs-anim-section" data-anim-section><div class="ecs-sectiontitle"><strong>'+xss(title)+'</strong><button type="button" data-animation-group="'+xss(id)+'">Afficher tout →</button></div><div class="ecs-anim-strip">'+items.map(stickerCard).join('')+'</div></section>';
}
function stickerAnimations(){
 const lib=window.ELOAHAnimations;
 if(!lib)return '<div class="ecs-empty">Chargement de la bibliothèque Animations… Actualise la page si elle n’apparaît pas.</div>';
 const recent=S.elements.filter(e=>e.kind==='sticker').slice(-16).reverse().map(e=>lib.byId.get(e.variant)).filter(Boolean);
 const head='<div class="ecs-audio-header"><button type="button" data-cat="overview" aria-label="Retour aux éléments">←</button><strong>Animations</strong></div><div class="ecs-search"><span>＋</span><input id="ecs-animation-search" placeholder="Rechercher des animations" autocomplete="off" aria-label="Rechercher des animations" value="'+xss(animationSearch)+'"><span>⌕</span></div>';
 const selectedElement=S.elements.find(e=>e.id===selected);
 const controls=selectedElement?
 '<div class="ecs-anim-controls"><strong>Animer l’élément sélectionné</strong><p class="ecs-note">Choisis un effet, puis lance ▶ pour voir le mouvement.</p><div class="ecs-anim-effects">'+[['pulse','Pulsation'],['float','Flottement'],['bounce','Rebond'],['wobble','Oscillation'],['rotate','Rotation'],['twinkle','Clignotement'],['none','Sans effet']].map(([val,label])=>'<button data-apply-motion="'+val+'" type="button">'+label+'</button>').join('')+'</div></div>':
 '<p class="ecs-note ecs-anim-tip">Clique sur une vignette pour ajouter un élément animé. Ensuite, modifie son mouvement et sa vitesse dans les propriétés.</p>';
 if(animationView!=='home'){
  const recentView=animationView==='recent',ix=Number(animationView.slice(1)),group=lib.grouped[ix];
  const items=recentView?recent:(group?.entries||[]).map(e=>lib.byId.get(e.id)).filter(Boolean);
  return head+'<button class="ecs-els-back" data-animation-group="home">← Toutes les animations</button><h3 class="ecs-panelheading">'+xss(recentView?'Utilisés récemment':group?.group||'Animations')+'</h3><div class="ecs-anim-grid">'+items.map(stickerCard).join('')+'</div>'+controls;
 }
 return head+(recent.length?stickerSection('Utilisés récemment',recent.slice(0,10),'recent'):'')+
 lib.grouped.map((g,i)=>stickerSection(g.group,g.entries.map(e=>lib.byId.get(e.id)).filter(Boolean),'g'+i)).join('')+controls+
 '<p class="ecs-note ecs-anim-disclaimer">Autocollants animés originaux ELOAH, dessinés pour le studio. Les animations sont visibles pendant la lecture et intégrées à l’export vidéo compatible.</p>';
}


let frameView='home',frameSearch='',activeFrameSlot=0;
const framePhotos=new Map(),frameObjectUrls=new Set();
function frameTile(f){
 if(!f)return '';
 return '<button class="ecs-frame-tile" type="button" data-frame-add="'+xss(f.id)+'" data-search="'+xss((f.label+' '+f.group+' '+f.shape).toLocaleLowerCase('fr'))+'" title="Ajouter '+xss(f.label)+'">'+
 '<span class="ecs-frame-thumb"><img loading="lazy" decoding="async" src="'+window.ELOAHFrames.thumb(f.id)+'" alt=""></span><span class="ecs-frame-caption">'+xss(f.label)+'</span><span class="ecs-frame-plus" aria-hidden="true">＋</span></button>';
}
function frameSection(g,i){
 return '<section class="ecs-frame-section" data-frame-section><div class="ecs-sectiontitle"><strong>'+xss(g.name)+'</strong><button type="button" data-frame-group="g'+i+'">Afficher tout →</button></div><div class="ecs-frame-strip">'+g.items.map(frameTile).join('')+'</div></section>';
}
function frameCatalog(){
 const lib=window.ELOAHFrames;
 if(!lib)return '<div class="ecs-empty">Bibliothèque de cadres indisponible. Actualise cette page.</div>';
 const recent=S.elements.filter(e=>e.kind==='photoFrame').slice(-12).reverse().map(e=>lib.byId.get(e.variant)).filter(Boolean);
 const head='<div class="ecs-audio-header"><button type="button" data-cat="overview" aria-label="Retour aux éléments">←</button><strong>Cadres</strong></div><div class="ecs-search"><span>＋</span><input id="ecs-frame-search" placeholder="Rechercher des cadres" value="'+xss(frameSearch)+'" aria-label="Rechercher des cadres"><span>⌕</span></div>';
 if(frameView!=='home'){
  const ix=Number(frameView.slice(1)),g=lib.groups[ix],recentView=frameView==='recent';
  const items=recentView?recent:g?.items||[];
  return head+'<button class="ecs-els-back" type="button" data-frame-group="home">← Tous les cadres</button><h3 class="ecs-panelheading">'+xss(recentView?'Utilisés récemment':g?.name||'Cadres')+'</h3><div class="ecs-frame-grid">'+items.map(frameTile).join('')+'</div>';
 }
 return head+(recent.length?'<section class="ecs-frame-section" data-frame-section><div class="ecs-sectiontitle"><strong>Utilisés récemment</strong><button type="button" data-frame-group="recent">Afficher tout →</button></div><div class="ecs-frame-strip">'+recent.map(frameTile).join('')+'</div></section>':'')+
 lib.groups.map(frameSection).join('')+'<div class="ecs-frame-footer"><p class="ecs-note">187 cadres originaux ELOAH, dont des cadres à plusieurs cases. Ajoute un cadre, puis choisis les photos à placer dedans.</p><button class="ecs-pillbtn primary" data-action="addImage" type="button">＋ Importer mes photos</button></div>';
}

function captureFrameAssets(maxSide=950,maxChars=10000000){
 const assets=[];let total=0;const exists=new Set(S.elements.filter(e=>e.kind==='photoFrame').map(e=>String(e.id)));
 for(const [key,im] of framePhotos.entries()){
  const [id,slot]=key.split(':');if(!exists.has(id)||!im?.complete||!im.naturalWidth)continue;
  try{
   const k=Math.min(1,maxSide/Math.max(im.naturalWidth,im.naturalHeight));
   const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
   const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
   ctx.drawImage(im,0,0,c.width,c.height);
   const data=c.toDataURL('image/jpeg',.78);
   if(total+data.length>maxChars)continue;
   assets.push({id:Number(id),slot:Number(slot),data});total+=data.length;
  }catch(e){console.warn('Photo non embarquée dans le projet',key,e)}
 }
 return assets;
}
function saveFrameMediaLocal(){
 try{
  const frames=captureFrameAssets(800,3500000);
  localStorage.setItem('eloah_reel_editor_frame_assets',JSON.stringify(frames));
 }catch(e){console.warn('Stockage local des photos limité',e)}
}
async function restoreFrameAssets(assets,idMap=null){
 if(!Array.isArray(assets))return 0;
 let count=0;
 for(const a of assets){
  if(typeof a.data!=='string'||!a.data.startsWith('data:image/')||a.data.length>6000000)continue;
  const id=idMap?.get(String(a.id))??Number(a.id);
  const e=S.elements.find(el=>el.id===id&&el.kind==='photoFrame');
  if(!e||!Number.isInteger(a.slot)||a.slot<0||a.slot>=frameSlotCount(e))continue;
  const im=new Image();im.src=a.data;
  try{await im.decode();framePhotos.set(e.id+':'+a.slot,im);count++}catch{}
 }
 if(count){renderSide();draw()}
 return count;
}

function frameSelected(){return S.elements.find(e=>e.id===selected&&e.kind==='photoFrame')}
function frameSlotCount(e){const item=window.ELOAHFrames?.byId.get(e?.variant);return item?window.ELOAHFrames.slots(item).length:0}
function frameSlotNumberAt(e,p){
 const item=window.ELOAHFrames?.byId.get(e?.variant);if(!item)return 0;
 const x=(p.x-e.x)/e.w*1000,y=(p.y-e.y)/e.h*1000,slots=window.ELOAHFrames.slots(item,e.isGrid?e.gridGap:null);
 for(let i=slots.length-1;i>=0;i--){let q=slots[i];if(x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h)return i}
 return 0;
}
function frameProperties(e){
 const item=window.ELOAHFrames?.byId.get(e.variant);if(!item)return '<p class="ecs-note">Cadre indisponible.</p>';
 const n=frameSlotCount(e);activeFrameSlot=Math.min(Math.max(0,activeFrameSlot),n-1);
 const opt=e.frameSlots?.[activeFrameSlot]||{},hasPhoto=framePhotos.has(e.id+':'+activeFrameSlot);
 return '<div class="ecs-frame-edit"><strong>'+xss(item.label||item.name||'Cadre')+'</strong><small>'+xss(item.group)+' · '+n+' case'+(n>1?'s':'')+'</small>'+
 (e.isMockup?mockupControls(e):'')+
 (e.isGrid?'<div class="ecs-grid-edit"><label class="ecs-sidelabel" for="ecs-grid-gap-slider">Espacement entre les photos</label><input id="ecs-grid-gap-slider" type="range" min="0" max="55" step="1" data-grid-gap value="'+(e.gridGap??12)+'"><span class="ecs-note">'+(e.gridGap??12)+' px</span><div>'+btn('gridFillAll','▦ Remplir plusieurs cases',true)+'</div><p class="ecs-note">Sélectionne plusieurs photos : elles seront réparties dans les cases de la grille, de gauche à droite.</p></div>':'')+
 (n>1?'<label class="ecs-sidelabel">Choisir une case</label><select data-frame-slot>'+Array.from({length:n},(_,i)=>'<option value="'+i+'" '+(i===activeFrameSlot?'selected':'')+'>Case '+(i+1)+(framePhotos.has(e.id+':'+i)?' ✓':'')+'</option>').join('')+'</select>':'')+
 '<p class="ecs-frame-help">'+(hasPhoto?'✓ Une photo est installée dans cette case.':'Ajoute une photo pour remplacer le paysage d’exemple.')+'</p>'+
 btn('frameImage','▧ Remplir avec ma photo',true)+btn('frameLibrary','Photos ELOAH')+(hasPhoto?btn('frameClear','✕ Retirer la photo'):'')+
 '<label class="ecs-sidelabel">Zoom de la photo</label><input type="range" min="100" max="300" step="5" data-frame-opt="zoom" value="'+Math.round((opt.zoom||1)*100)+'"><span class="ecs-note">'+Math.round((opt.zoom||1)*100)+' %</span>'+
 '<div class="ecs-rows"><div><label class="ecs-sidelabel">Décalage horizontal</label><input type="range" min="-100" max="100" step="5" data-frame-opt="panX" value="'+Math.round((opt.panX||0)*100)+'"></div><div><label class="ecs-sidelabel">Décalage vertical</label><input type="range" min="-100" max="100" step="5" data-frame-opt="panY" value="'+Math.round((opt.panY||0)*100)+'"></div></div>'+
 range('Épaisseur du cadre','borderSize',0,60,1,e.borderSize??17)+
 '<p class="ecs-note">Glisse aussi une image depuis ton ordinateur sur le cadre. Tu peux sélectionner chaque case et remplir un collage.</p></div>';
}
function setFramePhoto(e,slot,image){
 if(!e||e.kind!=='photoFrame')return false;
 const n=frameSlotCount(e),index=Math.max(0,Math.min(n-1,slot));
 framePhotos.set(e.id+':'+index,image);
 if(!Array.isArray(e.frameSlots))e.frameSlots=[];
 if(!e.frameSlots[index])e.frameSlots[index]={zoom:1,panX:0,panY:0};
 activeFrameSlot=index;saveLocal();saveFrameMediaLocal();renderSide();draw();return true;
}


let gridView='all',gridSearch='';
function gridTile(g){
 const source=window.ELOAHGrids;
 return '<button type="button" class="ecs-grid-tile" data-grid-add="'+xss(g.id)+'" data-search="'+xss((g.label+' '+g.group+' '+g.customSlots.length+' cases collage').toLocaleLowerCase('fr'))+'" title="Ajouter '+xss(g.label)+' · '+g.customSlots.length+' photos">'+
  '<img loading="lazy" decoding="async" alt="" src="'+source.thumbnail(g)+'">'+
  '<span class="ecs-grid-count">'+g.customSlots.length+' <span aria-hidden="true">▧</span></span></button>';
}
function gridSection(g,index){
 return '<section class="ecs-grid-section" data-grid-section><div class="ecs-sectiontitle"><strong>'+xss(g.name)+'</strong><button type="button" data-grid-group="'+index+'">Afficher tout →</button></div>'+
  '<div class="ecs-grid-gallery">'+g.items.map(gridTile).join('')+'</div></section>';
}
function gridCatalog(){
 const lib=window.ELOAHGrids;
 if(!lib)return '<div class="ecs-empty">La bibliothèque de grilles n’est pas disponible. Recharge la page.</div>';
 const recent=S.elements.filter(e=>e.kind==='photoFrame'&&lib.byId.has(e.variant)).slice(-15).reverse().map(e=>lib.byId.get(e.variant));
 const selectedGroup=gridView==='all'?null:lib.groups[Number(gridView)];
 const header='<div class="ecs-audio-header"><button type="button" data-cat="overview" aria-label="Retour aux éléments">←</button><strong>Grilles</strong></div>'+
  '<div class="ecs-search"><span>▦</span><input id="ecs-grid-search" placeholder="Rechercher une grille" value="'+xss(gridSearch)+'" aria-label="Rechercher une grille ou un nombre de cases" autocomplete="off"><span>⌕</span></div>'+
  '<p class="ecs-note">Choisis une mise en page. Chaque case peut accueillir une photo différente.</p>';
 const tabs='<div class="ecs-grid-filters">'+
  '<button class="'+(gridView==='all'?'is-active':'')+'" data-grid-group="all">Toutes · '+lib.catalogue.length+'</button>'+
  lib.groups.map((g,i)=>'<button class="'+(gridView===String(i)?'is-active':'')+'" data-grid-group="'+i+'">'+xss(g.name)+'</button>').join('')+'</div>';
 const controls='<div class="ecs-grid-footer"><p class="ecs-note">'+lib.catalogue.length+' compositions originales ELOAH. Photos redimensionnables et exportables avec le Reel.</p>'+
  btn('addImage','＋ Importer mes photos',true)+'</div>';
 if(selectedGroup)return header+tabs+gridSection(selectedGroup,Number(gridView))+controls;
 return header+tabs+(recent.length?'<section class="ecs-grid-section" data-grid-section><div class="ecs-sectiontitle"><strong>Utilisés récemment</strong><span>'+recent.length+'</span></div><div class="ecs-grid-gallery">'+recent.map(gridTile).join('')+'</div></section>':'')+
  lib.groups.map(gridSection).join('')+controls;
}


let mockupView='home',mockupSearch='';
function mockupTile(m){
 const library=window.ELOAHMockups;
 return '<button type="button" class="ecs-mock-tile" data-mockup-add="'+xss(m.id)+'" data-search="'+xss((m.name+' '+m.group+' '+m.palette.name).toLocaleLowerCase('fr'))+'" title="Ajouter '+xss(m.name)+'">'+
 '<span class="ecs-mock-thumb"><img src="'+library.thumb(m.id)+'" alt="" loading="lazy" decoding="async"></span>'+
 '<span class="ecs-mock-caption">'+xss(m.name)+'</span><span class="ecs-mock-plus" aria-hidden="true">＋</span></button>';
}
function mockupSection(name,items,code){
 return '<section class="ecs-mock-section" data-mockup-section><div class="ecs-sectiontitle"><strong>'+xss(name)+'</strong><button type="button" data-mockup-group="'+xss(code)+'">Afficher tout →</button></div>'+
 '<div class="ecs-mock-strip">'+items.map(mockupTile).join('')+'</div></section>';
}
function mockupCatalog(){
 const lib=window.ELOAHMockups;
 if(!lib)return '<div class="ecs-empty">Bibliothèque Maquettes indisponible. Actualise la page.</div>';
 const recent=S.elements.filter(e=>e.isMockup&&lib.byId.has(e.variant)).slice(-14).reverse().map(e=>lib.byId.get(e.variant));
 const head='<div class="ecs-audio-header"><button type="button" data-cat="overview" aria-label="Retour aux éléments">←</button><strong>Maquettes</strong></div>'+
 '<div class="ecs-search"><span>▣</span><input id="ecs-mockup-search" aria-label="Rechercher des maquettes" autocomplete="off" placeholder="Rechercher des maquettes" value="'+xss(mockupSearch)+'"><span>⌕</span></div>';
 if(mockupView!=='home'){
   const recentView=mockupView==='recent',group=lib.groups[Number(mockupView.slice(1))],items=recentView?recent:group?.items||[];
   return head+'<button type="button" class="ecs-els-back" data-mockup-group="home">← Toutes les maquettes</button><h3 class="ecs-panelheading">'+xss(recentView?'Utilisés récemment':group?.name||'Maquettes')+'</h3><div class="ecs-mock-grid">'+items.map(mockupTile).join('')+'</div>';
 }
 return head+(recent.length?mockupSection('Utilisés récemment',recent,'recent'):'')+
 lib.groups.map((g,i)=>mockupSection(g.name,g.items,'g'+i)).join('')+
 '<div class="ecs-mock-footer"><p class="ecs-note">Maquettes illustrées 2D originales ELOAH. Insère tes propres visuels dans leurs emplacements. Pour les écrans, tu peux aussi utiliser ta vidéo importée.</p>'+
 '<div class="ecs-mock-links">'+btn('addImage','＋ Importer une image',true)+btn('importVideo','Importer une vidéo')+'</div></div>';
}
function mockupControls(e){
 const m=window.ELOAHMockups?.byId.get(e.variant);if(!m)return '';
 const slot=Number(e.videoSlot)||0,playing=!!e.mockVideo&&slot===activeFrameSlot;
 return '<div class="ecs-mock-edit"><strong>Maquette · '+xss(m.name)+'</strong><p class="ecs-note">Illustration de présentation 2D. Remplace le paysage dans chaque case par une de tes photos, ou associe une vidéo à un écran.</p>'+
 (m.type==='video'||m.type==='phone'||m.type==='device'?
 '<div class="ecs-mock-videoctrl"><p class="ecs-note">'+(media.videoUrl?'Vidéo importée : '+xss(video.dataset.filename||'Vidéo'):'Aucune vidéo importée.')+'</p>'+
 btn('mockupVideo',playing?'■ Retirer la vidéo de cette case':'▶ Placer ma vidéo dans cette case',true)+
 (!media.videoUrl?btn('importVideo','Importer une vidéo MP4'):'')+
 '<p class="ecs-note">La vidéo apparaît à la lecture et dans l’export compatible. Elle doit être réimportée lorsque tu ouvres un projet JSON.</p></div>':'')+
 '</div>';
}


let shapeView='home',shapeSearch='';
function shapeTile(item){
 if(!item)return '';
 const linear=window.ELOAHShapes.isLine(item);
 const term=(item.label+' '+item.group+' '+item.id).toLocaleLowerCase('fr');
 return '<button type="button" class="ecs-shape-tile'+(linear?' is-line':'')+'" data-shape-add="'+xss(item.id)+'" data-search="'+xss(term)+'" title="Ajouter '+xss(item.label)+' au Reel">'+
 '<span class="ecs-shape-preview"><img src="'+window.ELOAHShapes.thumb(item.id)+'" alt="" loading="lazy" decoding="async"></span>'+
 '<span class="ecs-shape-caption">'+xss(item.label)+'</span><span class="ecs-shape-plus" aria-hidden="true">＋</span></button>';
}
function shapeSection(group,index,items=group.items){
 return '<section class="ecs-shape-section" data-shape-section><div class="ecs-sectiontitle"><strong>'+xss(group.name)+'</strong><button type="button" data-shape-group="g'+index+'">Afficher tout →</button></div>'+
 '<div class="ecs-shape-strip">'+items.map(shapeTile).join('')+'</div></section>';
}
function shapeCatalog(){
 const lib=window.ELOAHShapes;
 if(!lib)return '<p class="ecs-note">Les formes ne sont pas chargées. Actualise la page.</p>';
 const recent=S.elements.filter(e=>e.kind==='shapeAsset').slice(-16).reverse().map(e=>lib.byId.get(e.variant)).filter(Boolean);
 const head='<div class="ecs-audio-header"><button data-cat="overview" aria-label="Retour aux éléments" type="button">←</button><strong>Formes</strong></div>'+
 '<div class="ecs-search"><span>＋</span><input id="ecs-shape-search" autocomplete="off" aria-label="Rechercher des formes" placeholder="Rechercher des formes" value="'+xss(shapeSearch)+'"><span>⌕</span></div>';
 if(shapeView!=='home'){
  const recentView=shapeView==='recent',index=Number(shapeView.slice(1)),g=lib.groups[index];
  const items=recentView?recent:g?.items||[];
  return head+'<button class="ecs-els-back" type="button" data-shape-group="home">← Toutes les formes</button><h3 class="ecs-panelheading">'+xss(recentView?'Utilisés récemment':g?.name||'Formes')+'</h3>'+
   '<div class="ecs-shape-grid">'+items.map(shapeTile).join('')+'</div>';
 }
 return head+(recent.length?'<section class="ecs-shape-section" data-shape-section><div class="ecs-sectiontitle"><strong>Utilisés récemment</strong><button data-shape-group="recent" type="button">Afficher tout →</button></div><div class="ecs-shape-strip">'+recent.map(shapeTile).join('')+'</div></section>':'')+
 lib.groups.map((g,i)=>shapeSection(g,i)).join('')+
 '<p class="ecs-note ecs-shape-foot">166 formes vectorielles originales ELOAH. Clique pour les ajouter, puis personnalise leur couleur, contour, transparence, angle et position.</p>';
}
function shapeProperties(e){
 const lib=window.ELOAHShapes,def=lib?.byId.get(e.variant);
 if(!def)return '<p class="ecs-note">Cette forme n’est plus dans la bibliothèque.</p>';
 const linear=lib.isLine(def),opa=Math.round((e.opacity??1)*100);
 return '<div class="ecs-shape-properties"><strong>'+xss(def.label)+'</strong><small>'+xss(def.group)+'</small>'+
 '<div class="ecs-shape-inline">'+
 (linear?range('Épaisseur du trait','lineWidth',1,120,1,e.lineWidth??20):
 range('Épaisseur du contour','strokeWidth',0,100,1,e.strokeWidth??0)+color('Couleur du contour','strokeColor',e.strokeColor||'#ffffff'))+
 '</div>'+
 '<label class="ecs-sidelabel">Style de ligne</label><select data-p="lineStyle">'+[['solid','Trait continu'],['dash','Tirets'],['dot','Pointillés']].map(([v,t])=>'<option value="'+v+'" '+((e.lineStyle||'solid')===v?'selected':'')+'>'+t+'</option>').join('')+'</select>'+
 (linear?'<label class="ecs-sidelabel">Extrémités</label><select data-p="lineCap">'+[['round','Arrondies'],['butt','Plates'],['square','Carrées']].map(([v,t])=>'<option value="'+v+'" '+((e.lineCap||'round')===v?'selected':'')+'>'+t+'</option>').join('')+'</select>':'')+
 '<label class="ecs-sidelabel">Opacité</label><input type="range" min="0" max="100" step="5" value="'+opa+'" data-shape-opacity><span class="ecs-note ecs-opacity-value">'+opa+' %</span>'+
 range('Rotation (en degrés)','rotation',-180,180,1,e.rotation||0)+
 '<div class="ecs-shape-flips"><button type="button" data-shape-flip="flipX" aria-pressed="'+!!e.flipX+'">↔ Inverser H</button><button type="button" data-shape-flip="flipY" aria-pressed="'+!!e.flipY+'">↕ Inverser V</button></div>'+
 '<p class="ecs-note">Toutes ces modifications sont enregistrées dans ton projet et dans la vidéo exportée.</p></div>';
}


let chartView='home',chartSearch='';
const chartLabel=id=>window.ELOAHCharts?.byId.get(id)?.label||'Graphique';
function chartTile(item){
 if(!item)return '';
 const src=window.ELOAHCharts.thumbnail(item.id);
 return '<button type="button" class="ecs-chart-tile" data-chart-add="'+xss(item.id)+'" data-search="'+xss((item.label+' '+item.group+' '+item.type).toLocaleLowerCase('fr'))+'" title="Ajouter '+xss(item.label)+' au Reel">'+
 '<span class="ecs-chart-thumb"><img src="'+src+'" alt="" loading="lazy" decoding="async"></span>'+
 '<span class="ecs-chart-caption">'+xss(item.label)+'</span><span class="ecs-chart-plus" aria-hidden="true">＋</span></button>';
}
function chartSection(group,i){
 return '<section class="ecs-chart-section" data-chart-section><div class="ecs-sectiontitle"><strong>'+xss(group.name)+'</strong><button type="button" data-chart-group="g'+i+'">Afficher tout →</button></div>'+
 '<div class="ecs-chart-strip">'+group.items.map(chartTile).join('')+'</div></section>';
}
function chartCatalog(){
 const lib=window.ELOAHCharts;
 if(!lib)return '<div class="ecs-empty">La bibliothèque de graphiques n’a pas chargé. Actualise la page.</div>';
 const recent=S.elements.filter(e=>e.kind==='chart').slice(-12).reverse().map(e=>lib.byId.get(e.variant)||lib.byId.get(e.variant==='pie'?'eloah-chart-pie':'eloah-chart-vertical'));
 const head='<div class="ecs-audio-header"><button type="button" data-cat="overview" aria-label="Retour aux éléments">←</button><strong>Graphiques</strong></div>'+
 '<div class="ecs-search"><span>▥</span><input id="ecs-chart-search" placeholder="Rechercher un graphique" aria-label="Rechercher un graphique" autocomplete="off" value="'+xss(chartSearch)+'"><span>⌕</span></div>'+
 '<button type="button" class="ecs-chart-data-launch" data-chart-open-data><span>▤</span> Ajouter des données <span>＋</span></button>';
 if(chartView!=='home'){
  const recentView=chartView==='recent',group=lib.groups[Number(chartView.slice(1))],items=recentView?recent:group?.items||[];
  return head+'<button class="ecs-els-back" data-chart-group="home">← Tous les graphiques</button><h3 class="ecs-panelheading">'+xss(recentView?'Utilisés récemment':group?.name||'Graphiques')+'</h3>'+
   '<div class="ecs-chart-grid">'+items.map(chartTile).join('')+'</div>';
 }
 return head+(recent.length?'<section class="ecs-chart-section" data-chart-section><div class="ecs-sectiontitle"><strong>Utilisés récemment</strong><button data-chart-group="recent">Afficher tout →</button></div><div class="ecs-chart-strip">'+recent.map(chartTile).join('')+'</div></section>':'')+
 lib.groups.map(chartSection).join('')+
 '<p class="ecs-note ecs-chart-disclaimer">Des graphiques éditables, intégrés à ton Reel. Clique pour ajouter un modèle puis remplace les chiffres par les tiens. Aucun abonnement ni connexion externe nécessaires.</p>';
}
function serializeChartTable(dataset){
 const escapeCell=v=>{
  const value=String(v??'');
  return /[;\n\r"]/.test(value)?'"'+value.replace(/"/g,'""')+'"':value;
 };
 const head=['Catégorie',...dataset.names].map(escapeCell).join(';');
 const rows=dataset.labels.map((label,i)=>[label,...(dataset.values[i]||[])].map(escapeCell).join(';'));
 return [head,...rows].join('\n');
}
function chartTableMarkup(e){
 const lib=window.ELOAHCharts,data=lib.parse(lib.migrateLegacy(e));
 if(!data.labels.length||!data.names.length)return '<div class="ecs-empty">Ajoute des données CSV pour modifier les cellules.</div>';
 const cols=data.names.slice(0,3),labels=data.labels.slice(0,24);
 const head='<tr><th>Catégorie</th>'+cols.map((name,i)=>'<th><input type="text" aria-label="Nom de la série '+(i+1)+'" data-chart-series="'+i+'" value="'+xss(name)+'"></th>').join('')+'<th aria-label="Supprimer">✕</th></tr>';
 const rows=labels.map((label,i)=>'<tr><td><input type="text" data-chart-cell="'+i+':0" aria-label="Nom de la catégorie '+(i+1)+'" value="'+xss(label)+'"></td>'+
 cols.map((name,j)=>'<td><input type="number" step="any" data-chart-cell="'+i+':'+(j+1)+'" aria-label="'+xss(name)+' · '+xss(label)+'" value="'+(Number(data.values[i]?.[j])||0)+'"></td>').join('')+
 '<td><button type="button" data-chart-remove-row="'+i+'" title="Supprimer cette catégorie" aria-label="Supprimer '+xss(label)+'">×</button></td></tr>').join('');
 return '<div class="ecs-chart-tablewrap"><table class="ecs-chart-table"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>'+
 '<div class="ecs-chart-data-actions">'+
 '<button type="button" class="ecs-pillbtn" data-chart-add-row>＋ Ligne</button>'+
 '<button type="button" class="ecs-pillbtn" data-chart-add-series>＋ Série</button>'+
 '<button type="button" class="ecs-pillbtn" data-chart-remove-series>− Série</button></div>'+
 '<p class="ecs-note">Les cellules sont modifiables directement. Maximum 24 catégories et 3 séries pour l’affichage.</p>';
}
function updateChartTable(mutator){
 const e=S.elements.find(el=>el.id===selected&&el.kind==='chart');if(!e)return;
 const source=window.ELOAHCharts.parse(window.ELOAHCharts.migrateLegacy(e));
 const data={labels:[...source.labels],names:source.names.slice(0,3),values:source.values.map(row=>row.slice(0,3))};
 mutator(data);snapshot();e.dataText=serializeChartTable(data);
 saveLocal();renderSide();draw();
}
function chartProperties(e){
 const lib=window.ELOAHCharts,def=lib?.byId.get(e.variant)||lib?.byId.get(e.variant==='pie'?'eloah-chart-pie':'eloah-chart-vertical');
 if(!def)return '<p class="ecs-note">Ce modèle de graphique n’est pas disponible.</p>';
 const data=lib.migrateLegacy(e);
 const paletteOptions={original:'Bleu · Canva-like',editorial:'Power & Glam',crew:'The Crew · Noir & or',ocean:'Océan',nature:'Nature',pastel:'Pastel'};
 const flags=[['chartShowTitle','Afficher le titre'],['chartShowGrid','Afficher la grille'],['chartShowLegend','Afficher la légende'],['chartShowValues','Afficher les chiffres']];
 return '<div class="ecs-chart-edit"><strong>▥ '+xss(def.label)+'</strong><small>'+xss(def.group)+'</small>'+
 '<label class="ecs-sidelabel">Nom du graphique</label><input data-p="chartTitle" maxlength="65" value="'+xss(e.chartTitle??'Résultats')+'" placeholder="Exemple : Mes résultats">'+
 '<label class="ecs-sidelabel" for="ecs-chart-data">Ajouter des données</label><p class="ecs-note">Une ligne par catégorie, première ligne pour les titres des colonnes. Utilise un point-virgule, une virgule ou une tabulation comme séparateur.</p>'+
 chartTableMarkup(e)+'<label class="ecs-sidelabel" for="ecs-chart-data">Coller ou corriger les données CSV</label>'+
 '<textarea id="ecs-chart-data" rows="7" spellcheck="false" data-p="dataText" aria-label="Tableau des données du graphique">'+xss(data)+'</textarea>'+
 '<div class="ecs-chart-data-actions">'+btn('chartImportCSV','↑ Importer CSV',true)+btn('chartExportCSV','↓ Exporter CSV')+btn('chartExample','↻ Exemple')+'</div>'+
 '<label class="ecs-sidelabel">Couleurs</label><select data-p="chartPalette">'+Object.entries(paletteOptions).map(([k,label])=>'<option value="'+k+'" '+((e.chartPalette||'original')===k?'selected':'')+'>'+xss(label)+'</option>').join('')+'</select>'+
 '<div class="ecs-chart-swatches">'+(lib.palettes[e.chartPalette]||lib.palettes.original).map(color=>'<span style="background:'+color+'"></span>').join('')+'</div>'+
 '<label class="ecs-sidelabel">Fond du graphique</label><input type="color" data-p="chartBackground" value="'+xss(e.chartBackground||'#ffffff')+'">'+
 '<div class="ecs-chart-flags">'+flags.map(([key,label])=>'<label class="ecs-chart-check"><input type="checkbox" data-chart-flag="'+key+'" '+(e[key]!==false&&e[key]!==undefined||e[key]===true?'checked':'')+'><span>'+label+'</span></label>').join('')+'</div>'+
 range('Taille du titre','chartFontSize',20,65,1,e.chartFontSize||34)+
 '<p class="ecs-note">Ces chiffres, couleurs et options sont conservés dans le projet JSON et visibles dans les exports image et vidéo.</p></div>';
}
function createChart(id,openData=false){
 const lib=window.ELOAHCharts;if(!lib)return toast('Moteur de graphiques non chargé.');
 const def=lib.byId.get(id)||lib.catalogue[0];
 const options=lib.settings(def.id);
 const e=add('chart',{...options,x:120,y:690,w:840,h:650});
 if(openData)requestAnimationFrame(()=>one('#ecs-chart-data')?.focus());
 return e;
}


let textView='home',textSearch='',textMagicInput='',textMagicTone='crew',textMagicSuggestions=[];
let textRecentPresets=[];
try{textRecentPresets=JSON.parse(localStorage.getItem('eloah_reel_recent_text_presets')||'[]').filter(x=>typeof x==='string').slice(0,15)}catch{}
function textComboCard(p){
 const lib=window.ELOAHText;
 return '<button type="button" class="ecs-type-card" data-text-preset="'+xss(p.id)+'" data-search="'+xss((p.title+' '+p.subtitle+' '+p.group).toLocaleLowerCase('fr'))+'" title="Ajouter '+xss(p.title)+' au montage">'+
 '<span class="ecs-type-preview"><img loading="lazy" decoding="async" src="'+lib.preview(p.id)+'" alt="Style typographique '+xss(p.title)+'"></span>'+
 '<span class="ecs-type-add" aria-hidden="true">＋</span></button>';
}
function textPresetSection(g,index,limit=0){
 const items=limit?g.items.slice(0,limit):g.items;
 return '<section class="ecs-type-section" data-type-section><div class="ecs-sectiontitle"><strong>'+xss(g.name)+'</strong><button type="button" data-text-view="g'+index+'">Afficher tout →</button></div>'+
 '<div class="ecs-type-strip">'+items.map(textComboCard).join('')+'</div></section>';
}
function textMagicScreen(){
 const suggestions=textMagicSuggestions.map((suggestion,i)=>'<div class="ecs-magic-result"><p>'+xss(suggestion)+'</p><button type="button" data-text-magic-add="'+i+'">＋ Ajouter au Reel</button></div>').join('');
 return '<button type="button" class="ecs-els-back" data-text-view="home">← Texte</button>'+
 '<h3 class="ecs-panelheading">Écriture magique · ELOAH</h3>'+
 '<p class="ecs-note">Suggestions de rédaction créées localement à partir de tes mots. Ce n’est pas une génération par IA : tu gardes la main sur chaque texte.</p>'+
 '<label class="ecs-sidelabel" for="ecs-magic-idea">Ton idée ou ton message</label>'+
 '<textarea id="ecs-magic-idea" rows="5" placeholder="Exemple : notre prochain atelier danse, tous niveaux…" maxlength="600">'+xss(textMagicInput)+'</textarea>'+
 '<label class="ecs-sidelabel" for="ecs-magic-tone">Ton souhaité</label>'+
 '<select id="ecs-magic-tone">'+[['crew','Dynamique · The Crew'],['glam','Éditorial · Power & Glam'],['direct','Direct et franc'],['soft','Doux et chaleureux']].map(([id,name])=>'<option value="'+id+'" '+(textMagicTone===id?'selected':'')+'>'+name+'</option>').join('')+'</select>'+
 '<button type="button" class="ecs-text-primary" data-text-magic-generate>✨ Proposer 3 formulations</button>'+
 (suggestions?'<h3 class="ecs-panelheading">Tes propositions</h3><div class="ecs-magic-results">'+suggestions+'</div>':'<p class="ecs-note">Écris une idée puis génère des formulations éditables.</p>');
}
function textPanel(){
 const lib=window.ELOAHText;
 if(!lib)return '<div class="ecs-empty">La bibliothèque Texte n’est pas chargée. Actualise la page.</div>';
 if(textView==='magic')return textMagicScreen();
 const head='<div class="ecs-text-search"><span>⌕</span><input type="search" id="ecs-text-search" aria-label="Rechercher des styles de texte" placeholder="Rechercher des polices et combinaisons" autocomplete="off" value="'+xss(textSearch)+'"></div>';
 if(textView!=='home'){
  const g=lib.groups[Number(textView.slice(1))];
  if(!g)return head+'<button class="ecs-els-back" data-text-view="home">← Texte</button>';
  return head+'<button class="ecs-els-back" data-text-view="home">← Tout le texte</button>'+
   '<h3 class="ecs-panelheading">'+xss(g.name)+'</h3><div class="ecs-type-grid">'+g.items.map(textComboCard).join('')+'</div>';
 }
 const recent=textRecentPresets.map(id=>lib.byId.get(id)).filter(Boolean).slice(0,6);
 const features='<section class="ecs-type-features"><div class="ecs-sectiontitle"><strong>Texte dynamique</strong></div>'+
 '<button type="button" class="ecs-type-feature" data-text-add="caption"><span class="ecs-feature-art subtitles">▤</span><span><strong>Sous-titres</strong><small>Texte chronométré · à saisir</small></span><span class="ecs-feature-arrow">›</span></button>'+
 '<button type="button" class="ecs-type-feature" data-text-add="page"><span class="ecs-feature-art numbering">1 <small>2</small></span><span><strong>Numérotation de page</strong><small>Compteur selon la durée</small></span><span class="ecs-feature-arrow">›</span></button></section>';
 const apps='<section class="ecs-type-apps"><div class="ecs-sectiontitle"><strong>Studios typographiques ELOAH</strong><button type="button" data-text-view="g5">Afficher tout →</button></div>'+
 '<div class="ecs-text-app-grid"><button data-text-app="studio"><span class="ecs-text-app-icon typestudio">T<span>▰</span></span><strong>TypeStudio</strong></button>'+
 '<button data-text-app="craft"><span class="ecs-text-app-icon typecraft">Typo</span><strong>TypeCraft</strong></button>'+
 '<button data-text-app="motion"><span class="ecs-text-app-icon motiontext">M<span>↗</span></span><strong>MotionText</strong></button></div>'+
 '<p class="ecs-note">Trois espaces de création intégrés à ELOAH : textes expressifs, compositions et mouvement. Pas d’accès aux applications de Canva.</p></section>';
 const identity='<section class="ecs-type-identity"><div class="ecs-sectiontitle"><strong>♛ Identité visuelle</strong><button type="button" data-tab="brand">Modifier →</button></div>'+
 '<button type="button" class="ecs-type-identity-btn heading" data-text-add="heading">En-tête</button>'+
 '<button type="button" class="ecs-type-identity-btn subheading" data-text-add="subtitle">Sous-titre</button>'+
 '<button type="button" class="ecs-type-identity-btn body" data-text-add="body">CORPS DE TEXTE</button></section>';
 const combos='<section class="ecs-type-combinations"><div class="ecs-sectiontitle"><strong>Combinaisons de polices</strong><button type="button" data-text-view="g0">Voir les collections →</button></div>'+
 '<div class="ecs-type-grid">'+lib.presets.slice(0,16).map(textComboCard).join('')+'</div></section>';
 return head+'<button type="button" class="ecs-text-primary" data-text-add="simple"><span>T</span> Ajouter une zone de texte</button>'+
 '<button type="button" class="ecs-text-magic" data-text-view="magic"><span>✧</span> Écriture magique <small>Suggestions locales</small></button>'+
 identity+features+apps+(recent.length?'<section class="ecs-type-recent"><div class="ecs-sectiontitle"><strong>Utilisés récemment</strong></div><div class="ecs-type-strip">'+recent.map(textComboCard).join('')+'</div></section>':'')+
 combos+lib.groups.map((g,i)=>textPresetSection(g,i,8)).join('')+
 '<p class="ecs-note ecs-text-disclaimer">90 combinaisons originales ELOAH, modifiables et exportables avec tes vidéos.</p>';
}
function textProperties(e){
 const lib=window.ELOAHText;if(!lib)return '';
 const combo=e.kind==='textCombo',preset=combo?lib.byId.get(e.variant):null;
 const families=Object.entries(lib.families);
 const options=(value)=>families.map(([id,info])=>'<option value="'+id+'" '+((value===id)?'selected':'')+'>'+xss(info.name)+'</option>').join('');
 const textInput='<label class="ecs-sidelabel">Texte principal</label><textarea data-p="text" rows="3" maxlength="600">'+xss(e.text||'')+'</textarea>';
 const secondary=combo?'<label class="ecs-sidelabel">Sous-texte</label><input type="text" data-p="subtext" maxlength="140" value="'+xss(e.subtext??preset?.subtitle??'')+'">'+
  '<label class="ecs-sidelabel">Mention supérieure</label><input type="text" data-p="eyebrow" maxlength="85" value="'+xss(e.eyebrow??preset?.eyebrow??'')+'">'+
  '<label class="ecs-sidelabel">Police secondaire</label><select data-p="secondaryFont">'+options(e.secondaryFont||preset?.subFont||'classic')+'</select>'+
  color('Couleur secondaire','accentColor',e.accentColor||preset?.accent||'#c69b46')+
  '<label class="ecs-sidelabel">Fond de la composition</label><div class="ecs-text-bg"><label><input type="checkbox" data-text-transparent '+(e.comboBackground==='transparent'?'checked':'')+'> Sans fond</label><input type="color" data-p="comboBackground" value="'+xss(e.comboBackground&&e.comboBackground!=='transparent'?e.comboBackground:preset?.back||'#f4efe7')+'"></div>':'';
 const font=e.fontFamily||preset?.font||'sans';
 const style='<div class="ecs-type-controls"><label class="ecs-sidelabel">Police de caractère</label><select data-p="fontFamily">'+options(font)+'</select>'+
 '<div class="ecs-text-props-row"><div>'+range('Taille','font',14,250,1,e.font||70)+'</div><div><label class="ecs-sidelabel">Graisse</label><select data-p="fontWeight">'+[300,400,500,600,700,800,900].map(n=>'<option value="'+n+'" '+(Number(e.fontWeight||800)===n?'selected':'')+'>'+n+'</option>').join('')+'</select></div></div>'+
 '<div class="ecs-text-toggle-row"><label><input type="checkbox" data-text-toggle="italic" '+(e.italic?'checked':'')+'> Italique</label>'+
 '<label><input type="checkbox" data-text-toggle="shadow" '+(e.shadow?'checked':'')+'> Ombre</label></div>'+
 '<label class="ecs-sidelabel">Alignement</label><div class="ecs-text-align">'+[['left','≡ Gauche'],['center','☷ Centre'],['right','≡ Droite']].map(([v,t])=>'<button type="button" data-text-align="'+v+'" aria-pressed="'+((e.align||'center')===v)+'">'+t+'</button>').join('')+'</div>'+
 (combo?'':range('Espacement des lettres','tracking',-3,28,1,e.tracking??0)+
 range('Interligne','lineHeight',.7,2,.05,e.lineHeight??1.16)+
 range('Contour','outlineWidth',0,25,1,e.outlineWidth||0)+color('Couleur du contour','outlineColor',e.outlineColor||'#111111')+
 '<div class="ecs-text-toggle-row"><label><input type="checkbox" data-text-toggle="textBackground" '+(!!e.backgroundColor?'checked':'')+'> Fond derrière le texte</label></div>'+
 (e.backgroundColor?color('Couleur du fond','backgroundColor',e.backgroundColor):''))+
 '<label class="ecs-sidelabel">Animation du texte</label><select data-p="textMode">'+Object.entries(lib.modeNames).map(([v,t])=>'<option value="'+v+'" '+((e.textMode||'none')===v?'selected':'')+'>'+t+'</option>').join('')+'</select>'+
 ((e.textMode==='counter')?range('Durée par page (s)','pageInterval',.2,20,.1,e.pageInterval||2):'')+
 ((e.textMode==='caption')?'<p class="ecs-note">Le texte est réparti sur la durée de l’élément. Ce n’est pas une transcription automatique de l’audio.</p>':'')+
 '</div>';
 return '<div class="ecs-type-editor"><strong>'+xss(combo?'Composition · '+(preset?.group||'Personnalisée'):'Modifier ton texte')+'</strong>'+
 '<p class="ecs-note">Modifie les mots et le style. Déplace ou redimensionne ce bloc directement sur le Reel.</p>'+
 textInput+secondary+style+'</div>';
}
function createTextPreset(presetId){
 const lib=window.ELOAHText,p=lib?.byId.get(presetId);if(!p)return;
 const el=add('textCombo',{variant:p.id,text:p.title,subtext:p.subtitle,eyebrow:p.eyebrow,
  x:100,y:630,w:880,h:550,font:p.defaultSize,fontFamily:p.font,secondaryFont:p.subFont,
  fontWeight:800,shadow:p.layout==='poster',align:'center',color:p.ink,accentColor:p.accent,comboBackground:p.back,textMode:'none'});
 textRecentPresets=[p.id,...textRecentPresets.filter(x=>x!==p.id)].slice(0,15);
 try{localStorage.setItem('eloah_reel_recent_text_presets',JSON.stringify(textRecentPresets))}catch{}
 toast('Style "'+p.title+'" ajouté : textes modifiables dans le panneau.');
 return el;
}
function createTextBlock(kind){
 const lib=window.ELOAHText;
 const detail=lib.textElement(kind);
 const {kind:blockKind,...rest}=detail;
 const el=add(blockKind,rest);
 toast(kind==='caption'?'Sous-titres chronométrés ajoutés : saisis tes mots dans Modifier.':
 kind==='page'?'Numérotation ajoutée. Règle les secondes par page dans Modifier.':'Zone de texte ajoutée.');
 return el;
}
function magicSuggestions(text,tone){
 const idea=String(text||'').trim().replace(/\s+/g,' ').slice(0,350);
 if(!idea)return [];
 const short=idea.replace(/[.!?]+$/,'');
 if(tone==='crew')return [
  short.toUpperCase()+' ! 🔥 Viens partager le mouvement avec nous.',
  'Chez The Crew, on avance ensemble. '+short+'. Et toi, tu nous rejoins ?',
  short+'. Pas besoin d’être parfait : on vient pour vivre le moment.'
 ];
 if(tone==='glam')return [
  short+'. Parce que les petits choix dessinent parfois de grandes histoires.',
  'Et si tout commençait ici ? '+short+'. Un instant pour se choisir.',
  short+'. Une autre manière de regarder la vie, avec liberté et intention.'
 ];
 if(tone==='direct')return [
  short+'. Voilà le sujet. Maintenant, on passe à l’action.',
  'On arrête de tourner autour : '+short+'. À toi de jouer.',
  short+'. Sans détour, sans chichis, avec du concret.'
 ];
 return [
  short+'. Prends le temps de savourer ce moment.',
  'Aujourd’hui, j’avais envie de partager ceci : '+short+'.',
  short+'. À ton rythme, simplement et avec le cœur.'
 ];
}

function elementsMarkup(){
 if(elementsCategory==='illustrations')return illustrationCatalog();
 if(elementsCategory==='animations')return stickerAnimations();
 if(elementsCategory==='frames')return frameCatalog();
 if(elementsCategory==='grids')return gridCatalog();
 if(elementsCategory==='mockups')return mockupCatalog();
 if(elementsCategory==='shapes')return shapeCatalog();
 if(elementsCategory==='charts')return chartCatalog();
 const search='<label class="ecs-sidelabel" for="ecs-element-search">Rechercher des éléments</label><div class="ecs-search"><span>⌕</span><input id="ecs-element-search" placeholder="Rechercher des éléments" autocomplete="off"><span aria-hidden="true">✦</span></div>';
 if(elementsCategory){
  const c=elementCategories.find(x=>x[0]===elementsCategory),title=elementsCategory==='recent'?'Utilisés récemment':c?.[1]||'Éléments';
  let content='';
  if(elementsCategory==='recent'){
    content=S.elements.length?'<div class="ecs-gallery">'+S.elements.slice().reverse().map(e=>'<button class="ecs-galleryitem" data-recent="'+e.id+'"><span class="ecs-galleryicon">'+(e.kind==='text'?'T':e.kind==='image'?'▧':e.kind==='chart'?'▥':'◈')+'</span><span>'+xss(e.kind==='text'?e.text.slice(0,35):e.kind)+'</span></button>').join('')+'</div>':'<p class="ecs-note">Pas encore d’éléments récents dans ce projet.</p>';
  }else if(['audio','videos','photos'].includes(elementsCategory)){
    content='<p class="ecs-note">Importe un fichier depuis ton appareil pour l’utiliser dans ton Reel.</p><div class="ecs-list"><button class="ecs-itembtn" data-tab="'+elementsCategory+'">Ouvrir les outils '+title.toLowerCase()+' →</button></div>';
  }else{
    content='<p class="ecs-note">'+(elementsCategory==='relief'?'Effets de relief dessinés en 2D, pas des objets 3D importés.':elementsCategory==='frames'?'Cadres décoratifs à placer au-dessus d’une photo.':elementsCategory==='mockups'?'Silhouettes de maquettes personnalisables et déplaçables.':'Ajoute un élément en cliquant dessus, puis déplace-le sur la page.')+'</p><div class="ecs-gallery">'+(elementOptions[elementsCategory]||[]).map(([key,label],i)=>'<button class="ecs-galleryitem" data-action="'+key+'"><span class="ecs-galleryicon g'+(i%6)+'">'+label.split(' ')[0]+'</span><span>'+xss(label.substring(label.indexOf(' ')+1))+'</span></button>').join('')+'</div>';
  }
  return '<button class="ecs-els-back" data-cat="overview">← Toutes les catégories</button><h3 class="ecs-panelheading">'+xss(title)+'</h3>'+content;
 }
 const recent=S.elements.slice(-4).reverse();
 const recentHtml=recent.length?recent.map((e,i)=>'<button class="ecs-recentitem" data-recent="'+e.id+'" title="Dupliquer cet élément"><span class="ecs-recentpreview r'+i+'">'+(e.kind==='text'?'T':e.kind==='image'?'▧':e.kind==='chart'?'▥':e.kind==='illustration'?'♥':'◈')+'</span></button>').join(''):'<span class="ecs-note">Tes prochains éléments apparaîtront ici.</span>';
 return search+'<div class="ecs-sectiontitle"><strong>Utilisés récemment</strong><button type="button" class="ecs-els-all" data-cat="recent">Afficher tout →</button></div><div class="ecs-recentgrid">'+recentHtml+'</div><h3 class="ecs-panelheading">Parcourir les catégories</h3><div class="ecs-categorygrid">'+elementCategories.map(c=>'<button class="ecs-category" data-cat="'+c[0]+'" data-search="'+(c[1]+' '+c[0]+' '+({illustrations:'cœur coeur fleur éclair eclair bulle dessin',relief:'3D cube sphère sphere',frames:'cadre contour photo',grids:'grille colonnes',mockups:'maquette téléphone telephone tablette',shapes:'forme rectangle cercle triangle étoile etoile ligne',charts:'graphiques barres diagramme camembert',animations:'fondu zoom glissement'}[c[0]]||'')).toLowerCase()+'"><span class="ecs-categoryart '+c[3]+'">'+c[2]+'</span><span class="ecs-categorylabel">'+c[1]+'</span></button>').join('')+'</div><p class="ecs-note">Ta bibliothèque ELOAH : éléments intégrés et médias importés depuis ton appareil.</p>';
}
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
function saveLocal(){try{localStorage.setItem('eloah_reel_editor',JSON.stringify(serial()))}catch{};projectLibrary?.scheduleAutoSave()}
function drawText(c,e){let txt=String(e.text||''),lines=txt.split('\n');c.fillStyle=e.color||'#222';c.textAlign='center';c.textBaseline='middle';let font=Math.min(250,Math.max(14,+e.font||68));c.font='800 '+font+'px system-ui,Arial';const out=[];for(const line of lines){const parts=line.split(/\s+/);let current='';for(const word of parts){if(c.measureText((current+' '+word).trim()).width>e.w-18&&current){out.push(current);current=word}else current=(current+' '+word).trim()}out.push(current)}const lineHeight=font*1.16,ty=e.y+e.h/2-(out.length-1)*lineHeight/2;out.forEach((line,i)=>c.fillText(line,e.x+e.w/2,ty+i*lineHeight,e.w-6))}
function cover(c,img){if(!img || !(img.videoWidth||img.naturalWidth))return;const w=img.videoWidth||img.naturalWidth,h=img.videoHeight||img.naturalHeight;const k=Math.max(1080/w,1920/h);c.drawImage(img,(1080-w*k)/2,(1920-h*k)/2,w*k,h*k)}
function paint(c,t,mark=false){
 c.save();c.fillStyle=S.bg;c.fillRect(0,0,1080,1920);
 c.filter=S.filter==='mono'?'grayscale(1) contrast(1.12)':S.filter==='vivid'?'saturate(1.55) contrast(1.08)':S.filter==='cinema'?'contrast(1.15) saturate(.85)':S.filter==='gold'?'sepia(.2) saturate(1.3)':'none';
 try{const videoInMockup=S.elements.some(e=>e.kind==='photoFrame'&&e.isMockup&&e.mockVideo);
 if(media.videoUrl&&video.readyState>=2&&!videoInMockup)cover(c,video);
 else if(media.bgImage)cover(c,media.bgImage)}catch{}
 c.filter='none';
 for(const e of S.elements){if(t<e.start||t>e.end)continue;
  c.save();
  const phase=(S.playing||busy)?Math.max(0,Math.min(1,(t-e.start)/0.65)):1;
  if(e.animation==='fade')c.globalAlpha*=phase;
  if(e.animation==='pop'){const z=.25+.75*(1-Math.pow(1-phase,3));c.translate(e.x+e.w/2,e.y+e.h/2);c.scale(z,z);c.translate(-e.x-e.w/2,-e.y-e.h/2)}
  if(e.animation==='slide'){c.translate((1-phase)*-400,0);c.globalAlpha*=.35+.65*phase}
  if(window.ELOAHAnimations&&(e.kind==='sticker'||['pulse','float','bounce','wobble','swing','rotate','twinkle','fall','shake'].includes(e.animation)))window.ELOAHAnimations.applyMotion(c,e,t,S.playing||busy);
  if(e.kind==='rect'){c.fillStyle=e.color;c.fillRect(e.x,e.y,e.w,e.h)}
  if(e.kind==='ellipse'){c.fillStyle=e.color;c.beginPath();c.ellipse(e.x+e.w/2,e.y+e.h/2,Math.abs(e.w/2),Math.abs(e.h/2),0,0,Math.PI*2);c.fill()}
  if(e.kind==='star'){c.save();c.translate(e.x+e.w/2,e.y+e.h/2);c.beginPath();for(let i=0;i<10;i++){const r=(i%2?0.48:1)*Math.min(e.w,e.h)/2,a=i*Math.PI/5-Math.PI/2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fillStyle=e.color;c.fill();c.restore()}

  if(e.kind==='illustration'){
    c.save();c.translate(e.x,e.y);c.scale(e.w/100,e.h/100);c.fillStyle=e.color||'#d7654f';
    if(e.variant==='heart'){c.beginPath();c.moveTo(50,91);c.bezierCurveTo(38,79,4,56,4,31);c.bezierCurveTo(4,2,37,-2,50,23);c.bezierCurveTo(68,-2,96,2,96,31);c.bezierCurveTo(96,56,62,79,50,91);c.fill()}
    if(e.variant==='flower'){for(let i=0;i<8;i++){c.save();c.translate(50,50);c.rotate(i*Math.PI/4);c.beginPath();c.ellipse(0,-25,15,28,0,0,Math.PI*2);c.fill();c.restore()}c.beginPath();c.arc(50,50,15,0,Math.PI*2);c.fillStyle='#80543f';c.fill()}
    if(e.variant==='bolt'){c.beginPath();[[55,0],[22,49],[44,49],[35,100],[84,37],[61,37],[74,0]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
    if(e.variant==='bubble'){c.beginPath();c.moveTo(18,10);c.lineTo(82,10);c.quadraticCurveTo(95,10,95,24);c.lineTo(95,66);c.quadraticCurveTo(95,81,80,81);c.lineTo(39,81);c.lineTo(17,96);c.lineTo(21,81);c.quadraticCurveTo(5,81,5,65);c.lineTo(5,24);c.quadraticCurveTo(5,10,18,10);c.fill();c.fillStyle='#ffffffbb';for(let i=0;i<3;i++){c.beginPath();c.arc(28+i*22,48,6,0,Math.PI*2);c.fill()}}
    c.restore();
  }
  if(e.kind==='triangle'){c.beginPath();c.moveTo(e.x+e.w/2,e.y);c.lineTo(e.x+e.w,e.y+e.h);c.lineTo(e.x,e.y+e.h);c.closePath();c.fillStyle=e.color;c.fill()}
  if(e.kind==='line'){c.beginPath();c.moveTo(e.x,e.y+e.h/2);c.lineTo(e.x+e.w,e.y+e.h/2);c.lineWidth=Math.max(6,e.h);c.strokeStyle=e.color;c.lineCap='round';c.stroke()}
  if(e.kind==='cube'){
    const {x,y,w,h}=e;c.save();c.translate(x,y);c.fillStyle=e.color||'#738ece';
    c.beginPath();c.moveTo(w/2,0);c.lineTo(w,h*.25);c.lineTo(w/2,h*.53);c.lineTo(0,h*.25);c.closePath();c.fill();
    c.fillStyle='#3f578e';c.beginPath();c.moveTo(0,h*.25);c.lineTo(w/2,h*.53);c.lineTo(w/2,h);c.lineTo(0,h*.72);c.closePath();c.fill();
    c.fillStyle='#9bb9eb';c.beginPath();c.moveTo(w,h*.25);c.lineTo(w/2,h*.53);c.lineTo(w/2,h);c.lineTo(w,h*.72);c.closePath();c.fill();c.restore();
  }
  if(e.kind==='sphere'){let g=c.createRadialGradient(e.x+e.w*.33,e.y+e.h*.28,4,e.x+e.w*.51,e.y+e.h*.5,Math.max(e.w,e.h)*.63);g.addColorStop(0,'#fff');g.addColorStop(.28,e.color||'#d86d9c');g.addColorStop(1,'#44345d');c.fillStyle=g;c.beginPath();c.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2,e.h/2,0,0,Math.PI*2);c.fill()}
  if(e.kind==='frame'||e.kind==='roundframe'){
    c.save();c.lineWidth=Math.max(15,Math.min(e.w,e.h)*.067);c.strokeStyle=e.color||'#d6ae59';c.shadowColor='#0004';c.shadowBlur=14;
    if(e.kind==='frame'){c.strokeRect(e.x+c.lineWidth/2,e.y+c.lineWidth/2,e.w-c.lineWidth,e.h-c.lineWidth)}
    else{c.beginPath();c.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2-c.lineWidth/2,e.h/2-c.lineWidth/2,0,0,Math.PI*2);c.stroke()}c.restore();
  }
  if(e.kind==='phone'||e.kind==='tablet'){
    const pad=Math.min(e.w,e.h)*.045,rad=Math.min(e.w,e.h)*.09;c.save();c.strokeStyle=e.color||'#252b35';c.lineWidth=pad*1.8;c.fillStyle='#00000015';
    c.beginPath();c.roundRect(e.x+pad,e.y+pad,e.w-pad*2,e.h-pad*2,rad);c.fill();c.stroke();
    c.fillStyle=e.color||'#252b35';c.beginPath();c.roundRect(e.x+e.w*.38,e.y+pad*.95,e.w*.24,pad*.7,pad*.3);c.fill();c.restore();
  }
  if(e.kind==='chart'&&window.ELOAHCharts)window.ELOAHCharts.render(c,e);
  if(e.kind==='text'||e.kind==='textCombo'){if(window.ELOAHText)window.ELOAHText.draw(c,e,t);else drawText(c,e)}
  if(e.kind==='image'){const im=images.get(e.id);if(im?.complete)try{c.drawImage(im,e.x,e.y,e.w,e.h)}catch{}}
  if(e.kind==='vector'&&window.ELOAHIllustrations)window.ELOAHIllustrations.render(c,e);
  if(e.kind==='sticker'&&window.ELOAHAnimations)window.ELOAHAnimations.render(c,e);
  if(e.kind==='shapeAsset'&&window.ELOAHShapes)window.ELOAHShapes.draw(c,e);
  if(e.kind==='inkStroke'&&window.ELOAHCanvasTools)window.ELOAHCanvasTools.draw(c,e);
  if(e.kind==='brandAsset')brandImage(c,e);
  if(e.kind==='photoFrame'&&e.isMockup&&window.ELOAHMockups)window.ELOAHMockups.draw(c,e,framePhotos,mark&&selected===e.id?activeFrameSlot:-1,video);
  else if(e.kind==='photoFrame'&&window.ELOAHFrames)window.ELOAHFrames.draw(c,e,framePhotos,mark&&selected===e.id?activeFrameSlot:-1);
  c.restore();
  if(mark&&selected===e.id){c.strokeStyle='#1676d0';c.lineWidth=6;c.strokeRect(e.x,e.y,e.w,e.h);c.fillStyle='#fff';c.fillRect(e.x+e.w-12,e.y+e.h-12,24,24);c.strokeRect(e.x+e.w-12,e.y+e.h-12,24,24)}
 }
 c.restore();
}
function draw(){paint(ctx,S.time,!busy);if(inkDraft&&window.ELOAHCanvasTools)window.ELOAHCanvasTools.drawDraft(ctx,inkDraft)}
function clock(t){let n=Math.max(0,Math.floor(t));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function tick(now){let dt=Math.min(.15,(now-lastFrame)/1000);lastFrame=now;if(S.playing){S.time+=dt;if(S.time>=S.duration){S.time=S.duration;pause()}if(media.videoUrl&&video.readyState>=2&&Math.abs(video.currentTime-(S.time+S.trimStart))>.25){try{video.currentTime=S.time+S.trimStart}catch{}}}
 draw();one('#ecs-clock').textContent=clock(S.time)+' / '+clock(S.duration);const ph=one('.ecs-playhead');if(ph)ph.style.left=(S.time*70)+'px';requestAnimationFrame(tick)}
function pause(){S.playing=false;video.pause();audio.pause();one('#ecs-play').textContent='▶'}
function play(){if(S.playing){pause();return}if(S.time>=S.duration)S.time=0;S.playing=true;one('#ecs-play').textContent='⏸';if(media.videoUrl){try{video.currentTime=S.time+S.trimStart;video.play().catch(()=>toast('Lecture vidéo bloquée par le navigateur.'))}catch{}}if(media.audioUrl){try{audio.currentTime=S.time;audio.play().catch(()=>{})}catch{}}}
function seek(t){S.time=Math.max(0,Math.min(S.duration,t));if(media.videoUrl&&video.readyState>=2)try{video.currentTime=S.time+S.trimStart}catch{};if(media.audioUrl&&audio.readyState>=2)try{audio.currentTime=S.time}catch{};draw()}
function renderTimeline(){
 const px=Math.max(720,S.duration*70+45),ruler=one('#ecs-timeruler'),tracks=one('#ecs-tracks');ruler.style.width=px+'px';
 ruler.innerHTML=Array.from({length:Math.floor(S.duration)+1},(_,i)=>'<span style="left:'+(i*70)+'px">'+clock(i)+'</span>').join('');
 const clip=(e,kind)=>'<button class="ecs-clip '+kind+(selected===e.id?' selected':'')+'" data-select="'+e.id+'" style="left:'+(e.start*70)+'px;width:'+Math.max(16,(e.end-e.start)*70)+'px">'+xss(e.kind==='text'||e.kind==='textCombo'?e.text:e.kind==='shapeAsset'?(window.ELOAHShapes?.byId.get(e.variant)?.label||'Forme'):e.kind==='photoFrame'?(e.isGrid?'Grille · ':e.isMockup?'Maquette · ':'Cadre · ')+((window.ELOAHFrames?.byId.get(e.variant)?.label||window.ELOAHFrames?.byId.get(e.variant)?.name)||'Photos'):(e.kind==='image'?'Image':e.kind))+'</button>';
 let bg='<div class="ecs-track" style="width:'+px+'px"><button class="ecs-clip" data-tab="import" style="left:0;width:'+(S.duration*70)+'px">▧ '+(media.videoUrl?'Vidéo importée':media.bgImage?'Photo de fond':'Fond / scène')+'</button></div>';
 const els='<div class="ecs-track" style="width:'+px+'px">'+S.elements.map(e=>clip(e,'text')).join('')+'</div>';
 const au='<div class="ecs-track" style="width:'+px+'px">'+(media.audioUrl?'<button class="ecs-clip audio" data-tab="audio" style="left:0;width:'+(S.duration*70)+'px">♫ Piste audio</button>':'<button class="ecs-clip audio" data-tab="audio" style="left:0;width:'+(S.duration*70)+'px;opacity:.65">＋ Ajouter une piste audio</button>')+'</div>';
 tracks.innerHTML='<div style="position:relative;width:'+px+'px">'+bg+els+au+'<div class="ecs-playhead" style="left:'+(S.time*70)+'px"></div></div>';
}
const btn=(action,label,primary=false)=>'<button type="button" data-action="'+action+'" class="ecs-pillbtn'+(primary?' primary':'')+'">'+label+'</button>';
function range(label,key,min,max,step,val){return '<label class="ecs-sidelabel">'+label+'</label><input type="number" min="'+min+'" max="'+max+'" step="'+step+'" data-p="'+key+'" value="'+xss(val)+'">'}
function color(label,key,val){return '<label class="ecs-sidelabel">'+label+'</label><input type="color" data-p="'+key+'" value="'+xss(val)+'">'}
// Galerie de vidéos de stock. URLs publiées dans des exemples techniques Pexels,
// chaque fiche renvoie aussi à la vidéo d'origine. La durée réelle est lue par le navigateur.
const videoStock=[
 {id:'pexels-17169505',name:'Plan vertical · Portrait 01',category:'people',size:'hd',url:'https://videos.pexels.com/video-files/17169505/17169505-hd_1080_1920_30fps.mp4',page:'https://www.pexels.com/video/17169505/',format:'vertical'},
 {id:'pexels-8468212',name:'Plan vertical · Portrait 02',category:'people',size:'hd',url:'https://videos.pexels.com/video-files/8468212/8468212-hd_1080_1920_30fps.mp4',page:'https://www.pexels.com/video/8468212/',format:'vertical'},
 {id:'pexels-9244375',name:'Scène verticale · Lifestyle',category:'people',size:'hd',url:'https://videos.pexels.com/video-files/9244375/9244375-hd_1080_1920_25fps.mp4',page:'https://www.pexels.com/video/9244375/',format:'vertical'},
 {id:'pexels-35143877',name:'Plan vertical · Inspiration',category:'trends',size:'uhd',url:'https://videos.pexels.com/video-files/35143877/14887902_1440_2560_30fps.mp4',page:'https://www.pexels.com/video/35143877/',format:'vertical'},
 {id:'pexels-5873605',name:'Portrait vertical · Cinématique',category:'trends',size:'uhd',url:'https://videos.pexels.com/video-files/5873605/5873605-uhd_2160_3840_24fps.mp4',page:'https://www.pexels.com/video/5873605/',format:'vertical'},
 {id:'pexels-4188339',name:'Lever de soleil · Hawaï',category:'background',size:'uhd',url:'https://videos.pexels.com/video-files/4188339/4188339-uhd_4096_2160_24fps.mp4',page:'https://www.pexels.com/video/4188339/',format:'horizontal'},
 {id:'pexels-36505810',name:'Falaises · Mer du Nord',category:'background',size:'sd',url:'https://videos.pexels.com/video-files/36505810/15479711_640_360_60fps.mp4',page:'https://www.pexels.com/video/dramatic-drone-view-of-north-sea-cliffs-36505810/',format:'horizontal'},
 {id:'pexels-4977395',name:'Chats sur la pelouse',category:'trends',size:'hd',url:'https://videos.pexels.com/video-files/4977395/4977395-hd_1920_1080_24fps.mp4',page:'https://www.pexels.com/video/adorable-cats-on-the-lawn-4977395/',format:'horizontal'},
 {id:'pexels-1409899',name:'Clip nature · Plan large',category:'background',size:'sd',url:'https://videos.pexels.com/video-files/1409899/1409899-sd_640_360_25fps.mp4',page:'https://www.pexels.com/video/1409899/',format:'horizontal'},
 {id:'pexels-1192116',name:'Séquence · Plan large',category:'effects',size:'sd',url:'https://videos.pexels.com/video-files/1192116/1192116-sd_640_360_30fps.mp4',page:'https://www.pexels.com/video/1192116/',format:'horizontal'},
 {id:'pexels-1918465',name:'Océan · Drone',category:'background',size:'uhd',url:'https://videos.pexels.com/video-files/1918465/1918465-uhd_3840_2160_24fps.mp4',page:'https://www.pexels.com/video/1918465/',format:'horizontal'},
 {id:'pexels-20271094',name:'Fond marin · Cinématique',category:'background',size:'uhd',url:'https://videos.pexels.com/video-files/20271094/20271094-uhd_2560_1440_25fps.mp4',page:'https://www.pexels.com/video/20271094/',format:'horizontal'},
 {id:'pexels-36505810-transition',name:'Mer · Transition panoramique',category:'effects',size:'sd',url:'https://videos.pexels.com/video-files/36505810/15479711_640_360_60fps.mp4',page:'https://www.pexels.com/video/dramatic-drone-view-of-north-sea-cliffs-36505810/',format:'horizontal'}
];
let stockView='home',stockSearch='',stockPreview=null,stockLoading=false,stockRecent=[];
const stockDuration=new Map();
try{stockRecent=JSON.parse(localStorage.getItem('eloah_reel_recent_videos')||'[]').filter(id=>videoStock.some(v=>v.id===id)).slice(0,12)}catch{}
const stockGroup=[
 ['Recommandations magiques',['pexels-17169505','pexels-4188339','pexels-4977395','pexels-8468212']],
 ['Tendances',['pexels-35143877','pexels-5873605','pexels-4977395','pexels-9244375']],
 ['People',['pexels-17169505','pexels-8468212','pexels-9244375']],
 ['Arrière-plans',['pexels-4188339','pexels-36505810','pexels-1918465','pexels-20271094','pexels-1409899']],
 ['Transitions et effets',['pexels-1192116','pexels-36505810-transition']]
];
function videoTile(c){
 const d=stockDuration.get(c.id),duration=Number.isFinite(d)?audioDuration(d):'Vidéo';
 return '<div class="ecs-video-card" data-stock="'+c.id+'" data-search="'+xss((c.name+' '+c.category+' '+c.format).toLowerCase())+'">'+
 '<button type="button" class="ecs-video-open" data-stock-open="'+c.id+'" aria-label="Prévisualiser '+xss(c.name)+'"><video class="ecs-video-thumb" muted playsinline preload="none" data-thumb-src="'+xss(c.url)+'#t=0.5" aria-hidden="true"></video><span class="ecs-video-overlay">▶</span><span class="ecs-video-duration">'+duration+'</span></button>'+
 '<div class="ecs-video-caption">'+xss(c.name)+'</div><button class="ecs-video-plus" type="button" data-stock-add="'+c.id+'" title="Ajouter cette vidéo dans le Reel">＋</button></div>';
}
function stockSection(title,clips,slug){
 if(!clips.length)return '';
 return '<section class="ecs-video-section" data-video-section><div class="ecs-sectiontitle"><strong>'+xss(title)+'</strong><button type="button" data-stock-group="'+xss(slug)+'">Afficher tout →</button></div><div class="ecs-video-row">'+clips.map(videoTile).join('')+'</div></section>';
}
function videoCatalog(){
 const recent=stockRecent.map(id=>videoStock.find(v=>v.id===id)).filter(Boolean);
 const header='<div class="ecs-audio-header"><button data-tab="elements" aria-label="Retour aux éléments">←</button><strong>Vidéos</strong></div>'+
 '<div class="ecs-search"><input id="ecs-video-search" placeholder="Rechercher des vidéos" value="'+xss(stockSearch)+'" aria-label="Rechercher des vidéos"><span>⌕</span></div>';
 if(stockView!=='home'){
   const section=stockView==='recent'?recent:stockGroup.find((group,index)=>'g'+index===stockView)?.[1].map(id=>videoStock.find(v=>v.id===id)).filter(Boolean)||[];
   const groupName=stockView==='recent'?'Utilisés récemment':stockGroup.find((group,index)=>'g'+index===stockView)?.[0]||'Vidéos';
   return header+'<button type="button" class="ecs-els-back" data-stock-group="home">← Toutes les vidéos</button><h3 class="ecs-panelheading">'+xss(groupName)+'</h3><div class="ecs-video-grid">'+section.map(videoTile).join('')+'</div>';
 }
 return header+(recent.length?stockSection('Utilisés récemment',recent,'recent'):'')+
 stockGroup.map(([title,ids],i)=>stockSection(title,ids.map(id=>videoStock.find(v=>v.id===id)).filter(Boolean),'g'+i)).join('')+
 '<p class="ecs-note ecs-video-license">Sélection de vidéos Pexels pour tes montages. Les clips peuvent être utilisés et modifiés selon la licence Pexels. Les personnes et marques visibles restent protégées par leurs droits.</p>'+
 '<div class="ecs-video-stocklinks"><a target="_blank" rel="noopener noreferrer" href="https://www.pexels.com/search/videos/dance/">Plus de danse ↗</a><a target="_blank" rel="noopener noreferrer" href="https://www.pexels.com/search/videos/people/">Plus de personnes ↗</a><a target="_blank" rel="noopener noreferrer" href="https://www.pexels.com/search/videos/background/">Plus de fonds ↗</a></div>'+
 '<div class="ecs-video-actions">'+btn('importVideo','＋ Importer ma vidéo',true)+(media.videoUrl?'<p class="ecs-note">Montage actuel : '+xss(video.dataset.filename||'Vidéo')+'</p>':'')+'</div>';
}
function scheduleStockThumbnails(){
 const el=one('.ecs-sidebody');if(!el||activeTab!=='videos')return;
 const items=[...el.querySelectorAll('video[data-thumb-src]')];
 const loadThumb=v=>{
   if(v.getAttribute('src'))return;
   const id=v.closest('[data-stock]')?.dataset.stock;
   v.muted=true;v.playsInline=true;
   v.addEventListener('loadedmetadata',()=>{
     if(id&&Number.isFinite(v.duration))stockDuration.set(id,v.duration);
     const label=v.closest('.ecs-video-open')?.querySelector('.ecs-video-duration');
     if(label&&Number.isFinite(v.duration))label.textContent=audioDuration(v.duration);
     try{v.currentTime=Math.min(.5,Math.max(0,(v.duration||1)-.1))}catch{}
   },{once:true});
   v.addEventListener('error',()=>{const card=v.closest('.ecs-video-card');if(card)card.classList.add('ecs-video-unavailable')},{once:true});
   v.preload='metadata';v.src=v.dataset.thumbSrc;v.load();
 };
 if(!('IntersectionObserver' in window)){items.slice(0,6).forEach(loadThumb);return}
 const observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){loadThumb(entry.target);observer.unobserve(entry.target)}
 },{root:el,rootMargin:'60px'});
 items.forEach(item=>observer.observe(item));
}
function rememberStock(id){
 stockRecent=[id,...stockRecent.filter(x=>x!==id)].slice(0,12);
 try{localStorage.setItem('eloah_reel_recent_videos',JSON.stringify(stockRecent))}catch{}
}
function closeStockPreview(){
 const modal=root.querySelector('.ecs-video-modal');if(modal)modal.remove();stockPreview=null;
}
function openStockVideo(id){
 const c=videoStock.find(c=>c.id===id);if(!c)return;closeStockPreview();stockPreview=id;
 const dialog=document.createElement('div');dialog.className='ecs-video-modal';dialog.addEventListener('click',e=>{if(e.target===dialog)closeStockPreview()});dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Prévisualisation vidéo');
 dialog.innerHTML='<div class="ecs-video-modalbox"><div class="ecs-video-modalhead"><strong>'+xss(c.name)+'</strong><button type="button" data-stock-close aria-label="Fermer">✕</button></div><video controls playsinline preload="metadata" src="'+xss(c.url)+'"></video><p class="ecs-note">Source : Pexels · '+xss(c.format)+' · '+xss(c.size.toUpperCase())+'</p><div class="ecs-video-modalactions"><button type="button" data-stock-add="'+xss(c.id)+'">＋ Ajouter au Reel</button><a target="_blank" rel="noopener noreferrer" href="'+xss(c.page)+'">Voir la vidéo originale ↗</a></div><p class="ecs-note">Si la lecture ou l’importation sont bloquées, télécharge le MP4 depuis la page Pexels, puis importe-le dans ELOAH.</p></div>';
 root.append(dialog);
 const v=dialog.querySelector('video');
 v.addEventListener('loadedmetadata',()=>{if(Number.isFinite(v.duration))stockDuration.set(c.id,v.duration)});
 v.play().catch(()=>{});
}
async function importStockVideo(id){
 const c=videoStock.find(c=>c.id===id);if(!c||stockLoading)return;stockLoading=true;
 toast('Importation de '+c.name+'…');
 try{
   // Limite de taille pour conserver un éditeur réactif sur mobile et PC.
   const response=await fetch(c.url,{mode:'cors'});
   if(!response.ok)throw Error('HTTP '+response.status);
   if(Number(response.headers.get('content-length')||0)>55*1024*1024)throw Error('Fichier volumineux');
   const blob=await response.blob();
   if(!blob.size||blob.size>55*1024*1024)throw Error('Fichier trop volumineux');
   const file=new File([blob],c.id+'.mp4',{type:'video/mp4'});
   await loadVideo(file);
   rememberStock(id);closeStockPreview();
   toast('Vidéo ajoutée au montage : '+c.name+'. Tu peux la découper dans les réglages.');
   if(activeTab==='videos')renderSide();
 }catch(e){
   toast('Import direct indisponible ('+e.message+'). Ouvre la fiche source pour télécharger, puis importe le MP4.');
   const panel=one('.ecs-sidebody');
   if(panel&&!panel.querySelector('.ecs-video-fallback')){
     const box=document.createElement('p');box.className='ecs-video-fallback ecs-note';
     box.innerHTML='Import direct bloqué. <a href="'+xss(c.page)+'" target="_blank" rel="noopener noreferrer">Télécharger cette vidéo sur Pexels ↗</a>, puis utiliser « Importer ma vidéo ».';
     panel.prepend(box);
   }
 }finally{stockLoading=false}
}

// Photos Pexels soigneusement sélectionnées, chaque fiche renvoie à son photographe et sa source.
const curatedPhotos=[{"id":"px-9259704","pexelsId":9259704,"name":"Vagues turquoise","category":"Eau & océan","photographer":"Jess Loiterton"},{"id":"px-36229964","pexelsId":36229964,"name":"Eau turquoise douce","category":"Eau & océan","photographer":"Jonathan Borba"},{"id":"px-7338890","pexelsId":7338890,"name":"Texture d'océan","category":"Eau & océan","photographer":"Gülşah PEHLİVAN"},{"id":"px-6573152","pexelsId":6573152,"name":"Rivage turquoise","category":"Eau & océan","photographer":"Ethan Tien"},{"id":"px-17137720","pexelsId":17137720,"name":"Lagune tropicale","category":"Eau & océan","photographer":"Francesco Ungaro"},{"id":"px-3654870","pexelsId":3654870,"name":"Littoral vu du ciel","category":"Eau & océan","photographer":"Griffin Wooldridge"},{"id":"px-16598628","pexelsId":16598628,"name":"Bleu profond","category":"Eau & océan","photographer":"Josh Withers"},{"id":"px-8732561","pexelsId":8732561,"name":"Hibiscus rouge","category":"Fleurs & été","photographer":"Arshan alam"},{"id":"px-9399998","pexelsId":9399998,"name":"Fleur tropicale","category":"Fleurs & été","photographer":"Engin Akyurt"},{"id":"px-12224493","pexelsId":12224493,"name":"Parasol rose","category":"Fleurs & été","photographer":"Nayla Charo"},{"id":"px-18888082","pexelsId":18888082,"name":"Parasol à la mer","category":"Fleurs & été","photographer":"Vika Glitter"},{"id":"px-5677563","pexelsId":5677563,"name":"Plage ensoleillée","category":"Fleurs & été","photographer":"Waldemar Brandt"},{"id":"px-7260252","pexelsId":7260252,"name":"Bougie et tissu","category":"Lifestyle","photographer":"gravity cut"},{"id":"px-8903657","pexelsId":8903657,"name":"Livres et bougie","category":"Lifestyle","photographer":"RDNE Stock project"},{"id":"px-9586204","pexelsId":9586204,"name":"Cocooning","category":"Lifestyle","photographer":"Esra Nur Kalay"},{"id":"px-27592573","pexelsId":27592573,"name":"Café et ordinateur","category":"Lifestyle","photographer":"Lisa Fotios"},{"id":"px-24877185","pexelsId":24877185,"name":"Casque et café","category":"Lifestyle","photographer":"Kadir Avşar"},{"id":"px-33686046","pexelsId":33686046,"name":"Lecture et chandelle","category":"Lifestyle","photographer":"fzaytt"},{"id":"px-6603477","pexelsId":6603477,"name":"Bureau sur le lit","category":"Lifestyle","photographer":"Hanna Pad"},{"id":"px-12260089","pexelsId":12260089,"name":"Matin minimaliste","category":"Lifestyle","photographer":"Alina Tomylko"},{"id":"px-12405483","pexelsId":12405483,"name":"Femme à la fenêtre","category":"Portraits","photographer":"RDNE Stock project"},{"id":"px-19201219","pexelsId":19201219,"name":"Portrait contemplatif","category":"Portraits","photographer":"esra demir"},{"id":"px-8151753","pexelsId":8151753,"name":"Yoga et lumière","category":"Portraits","photographer":"RDNE Stock project"},{"id":"px-6039237","pexelsId":6039237,"name":"Fougères tropicales","category":"Nature","photographer":"Enric Cruz López"},{"id":"px-12659294","pexelsId":12659294,"name":"Verdure forêt","category":"Nature","photographer":"Berke Can"},{"id":"px-17373428","pexelsId":17373428,"name":"Feuillage délicat","category":"Nature","photographer":"Diana"},{"id":"px-5114905","pexelsId":5114905,"name":"Fougère sombre","category":"Nature","photographer":"Diana"},{"id":"px-35038279","pexelsId":35038279,"name":"Forêt et lumière","category":"Nature","photographer":"Nguyễn Tiến Thịnh"},{"id":"px-5359307","pexelsId":5359307,"name":"Bougies et lecture","category":"Lifestyle","photographer":"cottonbro studio"},{"id":"px-27396422","pexelsId":27396422,"name":"Lecture à la fenêtre","category":"Lifestyle","photographer":"Esra Erdem"}];
const curatedGroups=[
 ['Recommandations magiques',['px-12224493','px-8732561','px-17137720','px-9259704','px-9399998','px-5677563']],
 ['Tendances',['px-7260252','px-27592573','px-24877185','px-33686046','px-9586204','px-12405483','px-12260089','px-8903657','px-5359307','px-27396422']],
 ['Eau & océan',curatedPhotos.filter(p=>p.category==='Eau & océan').map(p=>p.id)],
 ['Fleurs & été',curatedPhotos.filter(p=>p.category==='Fleurs & été').map(p=>p.id)],
 ['Portraits',curatedPhotos.filter(p=>p.category==='Portraits').map(p=>p.id)],
 ['Nature',curatedPhotos.filter(p=>p.category==='Nature').map(p=>p.id)]
];
let photoView='home',photoSearch='',photoRecent=[];
try{photoRecent=JSON.parse(localStorage.getItem('eloah_reel_recent_photos')||'[]').filter(id=>curatedPhotos.some(p=>p.id===id)).slice(0,16)}catch{}
function photoURL(item,w=360){return 'https://images.pexels.com/photos/'+item.pexelsId+'/pexels-photo-'+item.pexelsId+'.jpeg?auto=compress&cs=tinysrgb&w='+w}
function photoPage(item){return 'https://www.pexels.com/photo/'+item.pexelsId+'/'}
function photoItem(id){return curatedPhotos.find(p=>p.id===id)}
function photoTile(p){
 return '<div class="ecs-photo-tile" data-photo-id="'+xss(p.id)+'" data-search="'+xss((p.name+' '+p.category+' '+p.photographer).toLocaleLowerCase('fr'))+'"><button class="ecs-photo-photo" data-photo-open="'+xss(p.id)+'" type="button" title="Voir '+xss(p.name)+'"><img src="'+photoURL(p,320)+'" alt="'+xss(p.name)+'" loading="lazy" decoding="async" onerror="this.closest(\'.ecs-photo-tile\').classList.add(\'ecs-photo-error\')"></button><button class="ecs-photo-add" type="button" data-photo-add="'+xss(p.id)+'" aria-label="Ajouter '+xss(p.name)+' au Reel">＋</button></div>';
}
function photoSection(title,items,slug,kind){
 if(!items.length)return '';
 return '<section class="ecs-photo-section" data-photo-section><div class="ecs-sectiontitle"><strong>'+xss(title)+'</strong><button type="button" data-photo-group="'+slug+'">Afficher tout →</button></div><div class="'+(kind==='masonry'?'ecs-photo-masonry':'ecs-photo-strip')+'">'+items.map(photoTile).join('')+'</div></section>';
}
function photoCatalog(){
 const recent=photoRecent.map(photoItem).filter(Boolean);
 const intro='<div class="ecs-audio-header"><button type="button" data-tab="elements" aria-label="Retour aux éléments">←</button><strong>Photos</strong></div><div class="ecs-search"><input id="ecs-photo-search" placeholder="Rechercher des photos" aria-label="Rechercher des photos" value="'+xss(photoSearch)+'"><span>⌕</span></div>';
 if(photoView!=='home'){
   const rec=photoView==='recent';
   const ix=Number(photoView.slice(1)),group=curatedGroups[ix];
   const photos=rec?recent:(group?.[1]||[]).map(photoItem).filter(Boolean);
   return intro+'<button class="ecs-els-back" type="button" data-photo-group="home">← Toutes les photos</button><h3 class="ecs-panelheading">'+xss(rec?'Utilisés récemment':group?.[0]||'Photos')+'</h3><div class="ecs-photo-masonry ecs-photo-all">'+photos.map(photoTile).join('')+'</div>';
 }
 return intro+(recent.length?photoSection('Utilisés récemment',recent.slice(0,6),'recent'):'')+
 curatedGroups.map(([title,ids],i)=>photoSection(title,ids.map(photoItem).filter(Boolean),'g'+i,i===1?'masonry':'strip')).join('')+
 '<div class="ecs-photo-actions"><p class="ecs-note">Photographies réelles Pexels. Clique sur une photo pour la prévisualiser ou utilise ＋ pour la placer dans le Reel. Chaque image garde un lien vers son auteur.</p>'+
 btn('addImage','＋ Importer mes photos',true)+btn('importImage','Définir un fond photo')+
 '<p class="ecs-note"><a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">Licence d’utilisation Pexels ↗</a> · Ne pas revendre les fichiers bruts.</p></div>';
}
function closePhotoModal(){root.querySelector('.ecs-photo-modal')?.remove()}
function openPhoto(id){
 const p=photoItem(id);if(!p)return;closePhotoModal();
 const m=document.createElement('div');m.className='ecs-photo-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Aperçu '+p.name);
 m.innerHTML='<div class="ecs-photo-modalbox"><div class="ecs-photo-modalhead"><strong>'+xss(p.name)+'</strong><button type="button" data-photo-close aria-label="Fermer">✕</button></div><img src="'+photoURL(p,1100)+'" alt="'+xss(p.name)+'"><p class="ecs-note">Photo : '+xss(p.photographer)+' · Pexels</p><div class="ecs-photo-modalactions"><button type="button" data-photo-add="'+p.id+'">＋ Ajouter sur la page</button><button type="button" data-photo-background="'+p.id+'">Utiliser comme fond</button><a href="'+photoPage(p)+'" rel="noopener noreferrer" target="_blank">Voir la source ↗</a></div></div>';
 m.addEventListener('click',e=>{if(e.target===m)closePhotoModal()});root.append(m);
}
function rememberPhoto(id){
 photoRecent=[id,...photoRecent.filter(x=>x!==id)].slice(0,16);
 try{localStorage.setItem('eloah_reel_recent_photos',JSON.stringify(photoRecent))}catch{}
}
let photoDownloading=false;
async function usePhoto(id,asBackground=false){
 const p=photoItem(id);if(!p||photoDownloading)return;
 photoDownloading=true;toast('Chargement de la photo : '+p.name+'…');
 try{
  const response=await fetch(photoURL(p,1600),{mode:'cors'});
  if(!response.ok)throw Error('Image inaccessible (HTTP '+response.status+')');
  const blob=await response.blob();
  if(!blob.size||!blob.type.startsWith('image/'))throw Error('Fichier reçu non reconnu comme image');
  if(blob.size>15*1024*1024)throw Error('Image trop volumineuse');
  const f=new File([blob],p.id+'.jpg',{type:blob.type});
  const filled=!!frameSelected()&&!asBackground;
  const added=await loadImage(f,asBackground?'background':filled?'frame':'element');
  if(added===false)throw Error('Décodage de l’image impossible');
  rememberPhoto(id);closePhotoModal();if(activeTab==='photos')renderSide();
  toast(asBackground?'Fond photo installé : '+p.name:filled?'Photo placée dans le cadre : '+p.name:'Photo ajoutée sur le Reel : '+p.name);
 }catch(e){
  toast('Ajout direct impossible : '+e.message+'. Ouvre Pexels puis télécharge et importe la photo.');
  const section=one('.ecs-sidebody');
  if(section&&!section.querySelector('.ecs-photo-fallback')){
   const note=document.createElement('p');note.className='ecs-photo-fallback ecs-note';
   note.innerHTML='Cette image ne peut pas être importée directement. <a target="_blank" rel="noopener noreferrer" href="'+photoPage(p)+'">Télécharger la photo sur Pexels ↗</a>, puis utilise « Importer mes photos ».';
   section.prepend(note);
  }
 }finally{photoDownloading=false}
}


let brandView='overview',brandSearch='',brandUploadCategory='photos',brandUploadTargetId='';
let brandKitId='';
try{brandKitId=localStorage.getItem('eloah_reel_active_brand')||''}catch{}
const brandImageCache=new Map(),brandEmbeddedImages=new Map();
function brandKit(){
 const lib=window.ELOAHBrand;if(!lib)return null;
 if(!brandKitId){brandKitId=lib.all().find(k=>k.name===S.brand)?.id||lib.all()[0].id}
 return lib.all().find(k=>k.id===brandKitId)||lib.all()[0];
}
function brandStatus(result,success){
 if(!result){toast('Action indisponible pour cette identité.');return false}
 if(result.result)result=result.result;
 if(result.ok===false){toast(result.message||'Stockage local impossible. Exporte ton kit en JSON.');return false}
 if(success)toast(success);
 return true;
}
function brandFamilyName(key){return window.ELOAHText?.families?.[key]?.name||key}
function brandTypeSections(){
 return [['overview','Toutes les ressources','▦'],['guides','Directives','▤'],['models','Modèles de marque','▧'],
 ['logos','Logos','◈'],['colors','Couleurs','●'],['fonts','Polices','T'],['voice','Voix de marque','♫'],
 ['photos','Photos','▣'],['illustrations','Illustrations','❀'],['icons','Icônes','☆'],['charts','Graphiques','▥']];
}
function brandNav(){
 return '<nav class="ecs-brand-nav" aria-label="Rubriques de la marque">'+brandTypeSections().map(([key,label,icon])=>
 '<button type="button" class="'+(brandView===key?'active':'')+'" data-brand-view="'+key+'"><span>'+icon+'</span>'+label+'</button>').join('')+'</nav>';
}
function brandBrandLogo(kit){
 const mono=kit.name.split(/\s+/).filter(Boolean).slice(0,3).map(x=>x[0]).join('').toUpperCase();
 return kit.logo?'<img src="'+kit.logo+'" alt="Logo importé de '+xss(kit.name)+'">':
 '<span class="ecs-brand-monogram" style="background:'+kit.colors[0][1]+';color:'+kit.colors[Math.min(1,kit.colors.length-1)][1]+'">'+xss(mono)+'</span>';
}
function brandOverview(kit){
 const modelCards=kit.models.slice(0,3).map(m=>
 '<button class="ecs-brand-mini-model" data-brand-use-model="'+xss(m.id)+'"><span>▧</span><strong>'+xss(m.name)+'</strong><small>Réutiliser →</small></button>').join('');
 const colors='<div class="ecs-brand-swatch-strip">'+kit.colors.map((v,i)=>
 '<button type="button" data-brand-quickcolor="'+i+'" style="background:'+v[1]+'" title="'+xss(v[0])+' · '+v[1]+'" aria-label="Appliquer '+xss(v[0])+' au fond"></button>').join('')+'</div>';
 const header='<section class="ecs-brand-section"><h3>Tous les modèles de marque</h3><div class="ecs-brand-hero"><span>▧</span><strong>Crée des designs homogènes</strong><p>Conserve tes couleurs, polices, logos et modèles dans une même identité ELOAH.</p><button class="ecs-brand-primary" data-brand-save-model>＋ Enregistrer ce Reel comme modèle</button></div>'+
 (modelCards?'<div class="ecs-brand-mini-models">'+modelCards+'</div>':'<p class="ecs-note">Aucun modèle enregistré pour cette identité. Commence avec une composition prête à utiliser.</p>')+
 '<button class="ecs-brand-outline" data-brand-apply>Appliquer cette identité au Reel ↗</button>'+
 '<div class="ecs-brand-layout-actions">'+[['cover','Couverture'],['quote','Citation'],['event','Annonce'],['story','Story'],['banner','Signature']].map(([k,n])=>'<button data-brand-layout="'+k+'">＋ '+n+'</button>').join('')+'</div></section>';
 return header+'<section class="ecs-brand-section"><div class="ecs-sectiontitle"><strong>Logos</strong><button data-brand-view="logos">Afficher tout →</button></div>'+
 '<button type="button" class="ecs-brand-logo-tile" data-brand-view="logos">'+brandBrandLogo(kit)+'</button>'+
 '<p class="ecs-note">'+(kit.logo?'Ton logo est enregistré sur cet appareil.':'Monogramme provisoire : importe ton véritable logo.')+'</p></section>'+
 '<section class="ecs-brand-section"><div class="ecs-sectiontitle"><strong>Couleurs</strong><button data-brand-view="colors">Afficher tout →</button></div>'+
 colors+'<p class="ecs-note">Clique une couleur pour l’appliquer au fond du Reel.</p></section>'+
 '<section class="ecs-brand-section"><div class="ecs-sectiontitle"><strong>Polices</strong><button data-brand-view="fonts">Afficher tout →</button></div>'+
 '<button class="ecs-brand-font-preview" data-brand-view="fonts"><span style="font-family:Georgia,serif">En-tête</span><small>'+xss(brandFamilyName(kit.heading))+' · '+xss(brandFamilyName(kit.body))+'</small></button></section>'+
 '<section class="ecs-brand-section"><div class="ecs-sectiontitle"><strong>Directives et voix</strong><button data-brand-view="guides">Voir →</button></div><p class="ecs-note">'+xss(kit.voice||'Définis ici la voix de ta marque.')+'</p></section>';
}
function brandGuides(kit){
 return '<div class="ecs-brand-fields"><h3>Directives</h3><p class="ecs-note">Définis une identité utilisable dans tes créations et tes textes.</p>'+
 '<label class="ecs-sidelabel">Nom</label><input data-brand-field="name" maxlength="80" value="'+xss(kit.name)+'">'+
 '<label class="ecs-sidelabel">Description</label><input data-brand-field="tagline" maxlength="125" value="'+xss(kit.tagline)+'">'+
 '<label class="ecs-sidelabel">Signature</label><input data-brand-field="signature" maxlength="110" value="'+xss(kit.signature)+'">'+
 '<label class="ecs-sidelabel">À privilégier</label><textarea data-brand-field="doText" rows="5">'+xss(kit.doText)+'</textarea>'+
 '<label class="ecs-sidelabel">À éviter</label><textarea data-brand-field="dontText" rows="5">'+xss(kit.dontText)+'</textarea>'+
 '<button data-brand-insert-signature class="ecs-brand-primary">＋ Ajouter la signature au Reel</button></div>';
}
function brandModels(kit){
 const builtin=[['cover','Couverture éditoriale'],['quote','Citation'],['event','Annonce événement'],['story','Story verticale'],['banner','Signature / bandeau']];
 const saved=kit.models.map(m=>'<div class="ecs-brand-model-row" data-brand-filterable data-search="'+xss(m.name.toLowerCase())+'"><span>▧</span><div><strong>'+xss(m.name)+'</strong><small>'+m.elements.length+' élément(s) sans médias</small></div>'+
 '<button data-brand-use-model="'+xss(m.id)+'" title="Ajouter les éléments au Reel">＋</button><button data-brand-remove-model="'+xss(m.id)+'" title="Supprimer ce modèle">×</button></div>').join('');
 return '<h3>Modèles de marque</h3><p class="ecs-note">Ajoute un modèle prêt à personnaliser ou enregistre la composition actuelle. Le projet existant ne sera pas effacé.</p>'+
 '<div class="ecs-brand-model-layouts">'+builtin.map(([key,name])=>'<button data-brand-layout="'+key+'"><span>'+['▧','❝','▤','▣','◈'][builtin.findIndex(x=>x[0]===key)]+'</span>'+name+'</button>').join('')+'</div>'+
 '<h3>Mes modèles sauvegardés</h3>'+(saved||'<p class="ecs-note">Aucun modèle sauvegardé pour le moment.</p>')+
 '<label class="ecs-sidelabel">Nom du modèle à enregistrer</label><input id="ecs-brand-model-name" maxlength="80" placeholder="Ex. Couverture du magazine">'+
 '<button class="ecs-brand-primary" data-brand-save-model>＋ Enregistrer le Reel comme modèle</button>'+
 '<p class="ecs-note">Les éléments vectoriels, textes et graphiques sont repris. Les fichiers photo et vidéo externes ne sont pas intégrés aux modèles.</p>';
}
function brandLogos(kit){
 return '<h3>Logos</h3><p class="ecs-note">Les vrais logos doivent être importés depuis tes fichiers. Aucune image Canva n’est récupérée.</p>'+
 '<div class="ecs-brand-logo-large">'+brandBrandLogo(kit)+'</div>'+
 '<div class="ecs-brand-actions"><button data-brand-upload="logo" class="ecs-brand-primary">↑ Importer mon logo</button>'+
 (kit.logo?'<button data-brand-insert-logo>＋ Placer le logo</button><button data-brand-remove-logo>Supprimer</button>':
 '<button data-brand-insert-signature>＋ Ajouter un monogramme texte</button>')+'</div>'+
 '<p class="ecs-note">PNG transparent recommandé. Le logo importé pourra être placé, déplacé et redimensionné dans le Reel.</p>';
}
function brandColors(kit){
 return '<h3>Couleurs</h3><p class="ecs-note">Clique un échantillon pour l’appliquer au fond. Modifie les valeurs pour personnaliser ton identité.</p>'+
 '<div class="ecs-brand-color-list">'+kit.colors.map(([name,hex],i)=>
 '<div class="ecs-brand-color-row" data-brand-filterable data-search="'+xss(name.toLowerCase())+'">'+
 '<input type="color" data-brand-color="'+i+'" value="'+hex+'" aria-label="Couleur '+xss(name)+'">'+
 '<input type="text" maxlength="80" data-brand-color-name="'+i+'" value="'+xss(name)+'" aria-label="Nom de la couleur">'+
 '<span>'+hex+'</span><button data-brand-quickcolor="'+i+'" title="Appliquer au fond">↗</button>'+
 (kit.colors.length>1?'<button data-brand-delete-color="'+i+'" title="Supprimer la couleur">×</button>':'')+'</div>').join('')+'</div>'+
 '<button class="ecs-brand-outline" data-brand-add-color>＋ Ajouter une couleur</button>'+
 '<button class="ecs-brand-outline" data-brand-apply-to-element>Appliquer la couleur d’accent à l’élément sélectionné</button>'+
 '<button class="ecs-brand-primary" data-brand-apply>Appliquer l’identité au Reel</button>';
}
function brandFonts(kit){
 const fonts=window.ELOAHText?.families||{};
 return '<h3>Polices</h3><p class="ecs-note">Les polices sont celles disponibles dans le studio et sur ton appareil ; elles ne sont pas importées depuis Canva.</p>'+
 '<label class="ecs-sidelabel">Police des en-têtes</label><select data-brand-font="heading">'+Object.entries(fonts).map(([id,info])=>'<option value="'+id+'" '+(kit.heading===id?'selected':'')+'>'+xss(info.name)+'</option>').join('')+'</select>'+
 '<label class="ecs-sidelabel">Police du corps</label><select data-brand-font="body">'+Object.entries(fonts).map(([id,info])=>'<option value="'+id+'" '+(kit.body===id?'selected':'')+'>'+xss(info.name)+'</option>').join('')+'</select>'+
 '<label class="ecs-sidelabel">Police d’accent</label><select data-brand-font="accent">'+Object.entries(fonts).map(([id,info])=>'<option value="'+id+'" '+((kit.accent||'hand')===id?'selected':'')+'>'+xss(info.name)+'</option>').join('')+'</select>'+
 '<div class="ecs-brand-font-example"><div style="font-family:'+(fonts[kit.heading]?.css||'Georgia,serif')+'">En-tête de marque</div>'+
 '<p style="font-family:'+(fonts[kit.body]?.css||'Arial,sans-serif')+'">Un texte clair et cohérent pour ton univers.</p>'+
 '<div style="font-family:'+(fonts[kit.accent]?.css||'cursive')+';font-size:26px">Une note personnelle</div></div>'+
 '<button class="ecs-brand-primary" data-brand-add-heading>＋ Insérer un titre avec cette police</button>';
}
function brandVoice(kit){
 return '<h3>Voix de marque</h3><p class="ecs-note">Ces consignes sont enregistrées pour cette identité. Elles ne déclenchent pas automatiquement un générateur IA.</p>'+
 '<label class="ecs-sidelabel">Comment cette marque s’exprime-t-elle ?</label>'+
 '<textarea data-brand-field="voice" rows="8" maxlength="1400" placeholder="Ton, vocabulaire, rythme, mots à privilégier…">'+xss(kit.voice)+'</textarea>'+
 '<button class="ecs-brand-primary" data-brand-insert-signature>＋ Utiliser ma signature dans le Reel</button>';
}
function brandResourcePanel(kit,category){
 const titles={photos:'Photos',illustrations:'Illustrations',icons:'Icônes',charts:'Graphiques'};
 const items=kit.assets.filter(a=>a.category===category);
 const list=items.map(a=>
 '<div class="ecs-brand-asset" data-brand-filterable data-search="'+xss(a.name.toLowerCase())+'"><img src="'+a.data+'" alt="'+xss(a.name)+'"><small>'+xss(a.name)+'</small>'+
 '<div><button data-brand-asset-insert="'+xss(a.id)+'">＋ Ajouter</button><button data-brand-asset-delete="'+xss(a.id)+'" aria-label="Supprimer '+xss(a.name)+'">×</button></div></div>').join('');
 const buttons=category==='illustrations'?'<button class="ecs-brand-outline" data-brand-open-elements="illustrations">Explorer les illustrations ELOAH →</button>':
 category==='icons'?'<button class="ecs-brand-outline" data-brand-open-elements="shapes">Explorer les formes et icônes ELOAH →</button>':
 category==='charts'?'<button class="ecs-brand-primary" data-brand-open-elements="charts">▥ Ouvrir Graphiques ELOAH</button>':'';
 return '<h3>'+titles[category]+'</h3>'+
 (category==='charts'?'<p class="ecs-note">Les graphiques modifiables du Reel Studio utilisent les données que tu saisis. Retrouve ici les ressources enregistrées de ton identité.</p>':
 '<p class="ecs-note">Ajoute tes propres ressources à cette identité, sans les confondre avec une banque d’images commerciale.</p>')+
 (category!=='charts'?'<button data-brand-upload="'+category+'" class="ecs-brand-primary">↑ Importer '+titles[category].toLowerCase()+'</button>':'')+
 (items.length?'<div class="ecs-brand-assets">'+list+'</div>':'<p class="ecs-note">Aucune ressource ajoutée dans cette catégorie.</p>')+
 buttons;
}
function brandPanel(){
 const lib=window.ELOAHBrand;if(!lib)return '<p>Les identités de marque ne sont pas chargées. Actualise la page.</p>';
 const kit=brandKit(),options=lib.all().map(k=>'<option value="'+xss(k.id)+'" '+(kit.id===k.id?'selected':'')+'>'+xss(k.name)+'</option>').join('');
 const top='<div class="ecs-brand-kitbar"><label for="ecs-brand-kit">Identité visuelle</label><div><select id="ecs-brand-kit" aria-label="Choisir une identité visuelle">'+options+'</select><button data-brand-create title="Créer une identité de marque">＋</button></div>'+
 (brandCreating?'<div class="ecs-brand-newkit"><input id="ecs-brand-new-name" placeholder="Nom de la nouvelle marque" maxlength="80"><button data-brand-create-confirm>Créer</button></div>':'')+'</div>';
 const details=brandView==='overview'?brandOverview(kit):brandView==='guides'?brandGuides(kit):brandView==='models'?brandModels(kit):
 brandView==='logos'?brandLogos(kit):brandView==='colors'?brandColors(kit):brandView==='fonts'?brandFonts(kit):
 brandView==='voice'?brandVoice(kit):brandResourcePanel(kit,brandView);
 const tools='<div class="ecs-brand-backup"><button data-brand-export>↓ Exporter le kit</button><button data-brand-import>↑ Importer un kit</button>'+
 '<p>Les identités sont enregistrées localement sur cet appareil. Pour les transférer, exporte leur fichier JSON.</p></div>';
 return '<div class="ecs-brand-panel"><div class="ecs-brand-search"><span>⌕</span><input id="ecs-brand-search" placeholder="Rechercher une ressource" aria-label="Rechercher dans la marque" value="'+xss(brandSearch)+'"></div><div id="ecs-brand-results">'+brandSearchMarkup(brandSearch,kit)+'</div>'+
 top+'<div class="ecs-brand-workspace">'+brandNav()+'<div class="ecs-brand-content">'+
 '<div class="ecs-brand-section-heading"><small>'+xss(kit.tagline||'Identité visuelle')+'</small><h2>'+xss(brandView==='overview'?'Toutes les ressources':brandTypeSections().find(x=>x[0]===brandView)?.[1]||'Marque')+'</h2></div>'+
 details+tools+'</div></div></div>';
}


let brandCreating=false;
function brandApplyIdentity(){
 const kit=brandKit();if(!kit)return;
 snapshot();S.brand=kit.name;S.bg=kit.colors[0][1];saveLocal();draw();
 toast('Identité '+kit.name+' appliquée au fond de ce Reel. Les éléments existants sont conservés.');
}
function brandAddSignature(){
 const kit=brandKit();if(!kit)return;
 add('text',{text:kit.signature||kit.name.toUpperCase(),font:66,fontFamily:kit.heading,fontWeight:800,
 x:100,y:1520,w:880,h:200,color:kit.colors[Math.min(1,kit.colors.length-1)][1],align:'center'});
 toast('Signature '+kit.name+' ajoutée.');
}
function brandAddHeading(){
 const kit=brandKit();if(!kit)return;
 add('text',{text:'MON GRAND TITRE',font:105,fontFamily:kit.heading,fontWeight:800,x:95,y:710,w:890,h:340,
 color:kit.colors[Math.min(1,kit.colors.length-1)][1],align:'center'});
 toast('En-tête ajouté avec la police de marque.');
}
function brandCompose(type){
 const kit=brandKit();if(!kit)return;
 const bg=kit.colors[0][1],ink=kit.colors[1]?.[1]||'#222222',accent=kit.colors[2]?.[1]||ink;
 snapshot();S.brand=kit.name;S.bg=bg;
 const addText=(text,x,y,w,h,size,opts={})=>S.elements.push({id:nextId++,kind:'text',
 text,font:size,fontFamily:opts.family||kit.heading,fontWeight:opts.weight||800,
 color:opts.color||ink,x,y,w,h,align:opts.align||'center',start:0,end:S.duration,...opts});
 const accentLine=(x,y,w)=>S.elements.push({id:nextId++,kind:'rect',x,y,w,h:13,color:accent,start:0,end:S.duration});
 if(type==='cover'){accentLine(160,560,760);addText(kit.name.toUpperCase(),90,655,900,380,114);addText(kit.tagline||'Le nouveau dossier',130,1060,820,195,58,{color:accent,family:kit.body,weight:500})}
 else if(type==='quote'){addText('“ Écris une phrase qui te ressemble. ”',100,690,880,560,86,{family:kit.heading});addText('— '+kit.name,200,1370,680,150,40,{family:kit.body,color:accent})}
 else if(type==='event'){addText('PROCHAIN ÉVÉNEMENT',95,570,890,250,100);accentLine(160,852,760);addText('Date · Lieu · Programme',120,968,840,190,60,{family:kit.body,color:accent});addText(kit.name,130,1460,820,120,42,{family:kit.body})}
 else if(type==='story'){addText('TON MESSAGE',95,640,890,340,115);addText('Écris ici ta prochaine story.',115,1010,850,340,67,{family:kit.body,weight:500,color:accent});addText(kit.signature||kit.name,120,1570,840,150,44)}
 else{accentLine(110,1500,860);addText(kit.signature||kit.name,120,1515,840,210,68,{family:kit.heading})}
 selected=S.elements[S.elements.length-1]?.id||null;saveLocal();renderTimeline();setTab('properties');draw();
 toast('Modèle '+type+' ajouté avec l’identité '+kit.name+'. Tes anciens éléments sont conservés.');
}
function brandSaveModel(){
 const kit=brandKit();if(!kit)return;
 const items=S.elements.filter(e=>!['image','photoFrame'].includes(e.kind));
 if(!items.length){toast('Ajoute d’abord un titre, une forme ou un graphique dans ton Reel.');return}
 const name=one('#ecs-brand-model-name')?.value.trim()||S.name||'Mon modèle';
 const result=window.ELOAHBrand.addModel(kit.id,name,items);
 if(brandStatus(result,'Modèle de marque enregistré : '+name)){brandView='models';renderSide()}
}
function brandUseModel(id){
 const kit=brandKit(),model=kit?.models.find(x=>x.id===id);if(!model)return;
 if(!model.elements.length){toast('Ce modèle ne contient pas d’éléments à ajouter.');return}
 snapshot();
 for(const element of model.elements){
  const {id:original,...copy}=JSON.parse(JSON.stringify(element));
  if(copy.kind==='brandAsset')copy.brandId=kit.id;
  const inserted={...copy,id:nextId++,start:Math.max(0,Math.min(S.duration-.1,Number(copy.start)||0)),
   end:Math.max(.1,Math.min(S.duration,Number(copy.end)||S.duration))};
  S.elements.push(inserted);
  if(inserted.kind==='brandAsset'){
   const media=window.ELOAHBrand.getAsset(kit.id,inserted.assetId);
   if(validBrandImageData(media?.data))brandEmbeddedImages.set(inserted.id,media.data);
  }
 }
 saveBrandMediaLocal();
 selected=S.elements.at(-1).id;saveLocal();renderTimeline();setTab('properties');draw();
 toast('Modèle "'+model.name+'" ajouté sans remplacer le contenu actuel.');
}

function validBrandImageData(data){
 return typeof data==='string'&&data.length<800000&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(data);
}
function captureBrandAssets(maxChars=19500000){
 const items=[],used=new Set();let size=0,skipped=0;
 for(const e of S.elements){
  if(e.kind!=='brandAsset'||used.has(e.id))continue;
  used.add(e.id);
  const embedded=brandEmbeddedImages.get(e.id);
  const data=validBrandImageData(embedded)?embedded:window.ELOAHBrand?.getAsset(e.brandId,e.assetId)?.data;
  if(!validBrandImageData(data)){skipped++;continue}
  if(size+data.length>maxChars){skipped++;continue}
  items.push({id:e.id,data});size+=data.length;
 }
 return {items,skipped};
}
function saveBrandMediaLocal(){
 try{
  const result=captureBrandAssets(2450000);
  localStorage.setItem('eloah_reel_editor_brand_assets',JSON.stringify(result.items));
  return result.skipped===0;
 }catch(e){console.warn('Stockage des médias de marque limité',e);return false}
}
function restoreBrandAssets(items,idMap=null){
 if(!Array.isArray(items))return 0;
 let count=0;
 for(const item of items.slice(0,120)){
  const id=idMap?.get(String(item.id))??Number(item.id);
  if(!Number.isInteger(id)||!S.elements.some(e=>e.id===id&&e.kind==='brandAsset'))continue;
  if(!validBrandImageData(item.data))continue;
  brandEmbeddedImages.set(id,item.data);count++;
 }
 return count;
}

function brandInsertAsset(id){
 const kit=brandKit(),asset=window.ELOAHBrand.getAsset(kit?.id,id);
 if(!asset?.data){toast('Importe d’abord une image pour pouvoir l’ajouter.');return}
 const result=add('brandAsset',{brandId:kit.id,assetId:id,
  sourceName:asset.name,color:'#ffffff',x:id==='logo'?300:170,y:id==='logo'?715:540,
  w:id==='logo'?480:740,h:id==='logo'?480:740});
 if(validBrandImageData(asset.data))brandEmbeddedImages.set(result.id,asset.data);
 const persisted=saveBrandMediaLocal();
 toast(asset.name+' ajouté au Reel.'+(persisted?'':' Exporte le projet en JSON pour conserver ce visuel.'));
}
function brandImage(ctx,e){
 const data=brandEmbeddedImages.get(e.id)||window.ELOAHBrand?.getAsset(e.brandId,e.assetId)?.data;
 if(!validBrandImageData(data))return;
 const cacheId='element:'+e.id;
 let cache=brandImageCache.get(cacheId);
 if(!cache||cache.src!==data){
  const im=new Image();im.onload=()=>{draw()};im.onerror=()=>{console.warn('Logo ou ressource illisible',cacheId)};
  im.src=data;cache={src:data,image:im};brandImageCache.set(cacheId,cache);
 }
 const im=cache.image;if(!im.complete||!im.naturalWidth)return;
 const ratio=Math.min(e.w/im.naturalWidth,e.h/im.naturalHeight),w=im.naturalWidth*ratio,h=im.naturalHeight*ratio;
 const x=e.x+(e.w-w)/2,y=e.y+(e.h-h)/2;
 try{ctx.drawImage(im,x,y,w,h)}catch{}
}
function brandSearchMarkup(value,kit){
 const q=String(value||'').trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(!q)return '';
 const match=v=>String(v||'').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q);
 const sections=brandTypeSections().filter(x=>match(x[1])).map(x=>'<button data-brand-view="'+x[0]+'">▸ '+xss(x[1])+'</button>');
 const colors=kit.colors.map(([label,hex],i)=>({label,hex,i})).filter(v=>match(v.label)||match(v.hex)).map(v=>'<button data-brand-quickcolor="'+v.i+'"><span style="background:'+v.hex+'"></span>'+xss(v.label)+'</button>');
 const assets=kit.assets.filter(x=>match(x.name)).slice(0,9).map(x=>'<button data-brand-asset-insert="'+xss(x.id)+'">＋ '+xss(x.name)+'</button>');
 const models=kit.models.filter(x=>match(x.name)).slice(0,9).map(x=>'<button data-brand-use-model="'+xss(x.id)+'">▧ '+xss(x.name)+'</button>');
 const all=[...sections,...colors,...assets,...models];
 return '<div class="ecs-brand-result-list">'+(all.length?all.join(''):'<p>Aucune ressource correspondant à la recherche.</p>')+'</div>';
}
async function resizeBrandImage(file,logo=false){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Format accepté : JPG, PNG ou WebP.');
 if(file.size>22*1024*1024)throw Error('Fichier trop volumineux : 22 Mo maximum.');
 const src=URL.createObjectURL(file),im=new Image();im.src=src;
 try{await im.decode()}finally{URL.revokeObjectURL(src)}
 const width=logo?650:1000,limit=logo?730000:620000;
 let scale=Math.min(1,width/Math.max(im.naturalWidth,im.naturalHeight)),url='',quality=.82;
 for(let i=0;i<6;i++){
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*scale));c.height=Math.max(1,Math.round(im.naturalHeight*scale));
  const cx=c.getContext('2d');
  if(!logo){cx.fillStyle='#ffffff';cx.fillRect(0,0,c.width,c.height)}
  cx.drawImage(im,0,0,c.width,c.height);
  url=c.toDataURL(logo?'image/png':'image/jpeg',quality);
  if(url.length<limit)break;
  scale*=.76;quality=Math.max(.55,quality-.08);
 }
 if(!url||url.length>=limit)throw Error('Image encore trop lourde. Réduis sa résolution et réessaie.');
 return url;
}

const reelImporter=window.ELOAHReelImporter?.create({
 root,xss,toast,getActiveTab:()=>activeTab,refresh:()=>renderSide(),setTab,
 loadImage,loadVideo,loadAudio,openStockVideo,importStockVideo,previewSound,addSound,
 videoStock,soundLibrary
})||null;

let inkMode='select',inkColor='#d32027',inkWidth=14,inkDraft=null,inkPointer=null,inkEraseActive=false,inkPaletteOpen=true;
try{const v=JSON.parse(localStorage.getItem('eloah_ink_prefs')||'null');if(v){if(window.ELOAHCanvasTools?.map.has(v.mode))inkMode=v.mode;if(/^#[0-9a-f]{6}$/i.test(v.color||''))inkColor=v.color;inkWidth=Math.min(70,Math.max(2,+v.width||14))}}catch{}
function saveInkPrefs(){try{localStorage.setItem('eloah_ink_prefs',JSON.stringify({mode:inkMode,color:inkColor,width:inkWidth}))}catch{}}
function inkButtons(compact=false){
 return (window.ELOAHCanvasTools?.tools||[]).map(item=>
 '<button type="button" data-ink-tool="'+item.id+'" aria-pressed="'+(inkMode===item.id)+'" title="'+xss(item.description)+'" aria-label="'+xss(item.label)+'"><span>'+item.icon+'</span>'+
 (compact?'':'<small>'+xss(item.label)+'</small>')+'</button>').join('');
}
function inkPanel(){
 if(!window.ELOAHCanvasTools)return '<div class="ecs-ink-panel"><strong>Palette Outils indisponible.</strong><p class="ecs-note">Actualise la page pour charger les commandes de dessin.</p><a href="eloah-reel-studio.html?onglet=tools&v=2">↻ Recharger les outils</a></div>';
 return '<div class="ecs-ink-panel"><h3>Mes outils</h3><p class="ecs-note">Sélectionne un outil puis utilise le plan de travail pour dessiner, annoter ou ajouter du texte.</p>'+
 '<div class="ecs-ink-buttons">'+inkButtons()+'</div>'+
 '<div class="ecs-ink-settings"><label>Couleur <input type="color" data-ink-color value="'+inkColor+'"></label>'+
 '<label>Épaisseur <input type="range" min="2" max="70" step="1" data-ink-width value="'+inkWidth+'"><output>'+inkWidth+' px</output></label></div>'+
 '<button type="button" class="ecs-ink-palette-toggle" data-ink-palette-toggle>'+(inkPaletteOpen?'Masquer':'Afficher')+' la palette flottante</button>'+
 '<button type="button" class="ecs-ink-clear" data-ink-clear>Effacer tous les tracés</button>'+
 '<h3>Réglages du Reel</h3>'+range('Durée du Reel (secondes)','duration',1,60,.5,S.duration)+color('Fond','bg',S.bg)+
 '<label class="ecs-sidelabel">Effet de couleur</label><select data-setting="filter">'+
 [['none','Naturel'],['cinema','Cinéma'],['gold','Lumière dorée'],['vivid','Couleurs intenses'],['mono','Noir et blanc']].map(([a,b])=>
 '<option value="'+a+'" '+(S.filter===a?'selected':'')+'>'+b+'</option>').join('')+'</select>'+
 btn('png','Exporter une image PNG')+'<p class="ecs-note">Le stylo, le surligneur et les flèches restent dans ton projet et dans les exports. La gomme retire un tracé entier.</p></div>';
}
function inkPalette(){
 const wrap=one('.ecs-stagewrap');if(!wrap)return;
 let el=wrap.querySelector('.ecs-ink-float');
 if(activeTab!=='tools'||!inkPaletteOpen){if(el)el.remove();canvas.style.cursor='default';return}
 if(!el){el=document.createElement('div');el.className='ecs-ink-float';el.setAttribute('role','toolbar');el.setAttribute('aria-label','Outils de création ELOAH');wrap.append(el)}
 el.innerHTML='<button class="ecs-ink-close" data-ink-palette-toggle aria-label="Fermer">×</button>'+inkButtons(true);
 canvas.style.cursor=inkMode==='select'?'default':inkMode==='eraser'?'cell':'crosshair';
}


function inkErase(pt){
 const lib=window.ELOAHCanvasTools;
 const target=[...S.elements].reverse().find(e=>e.kind==='inkStroke'&&S.time>=e.start&&S.time<=e.end&&lib.intersects(e,pt));
 if(!target)return;
 if(!inkEraseActive){snapshot();inkEraseActive=true}
 S.elements=S.elements.filter(e=>e.id!==target.id);
 if(selected===target.id)selected=null;
 renderTimeline();draw();saveLocal();
}
function inkPlace(pt){
 const x=Math.max(0,Math.min(850,pt.x-165)),y=Math.max(0,Math.min(1710,pt.y-85));
 if(inkMode==='note'){
  add('text',{text:'Ma note',x,y,w:440,h:245,font:56,fontFamily:'sans',fontWeight:700,color:'#4a3922',backgroundColor:'#ffe177',bgOpacity:.95,align:'center'});
  toast('Note ajoutée. Modifie son texte dans les propriétés.');return true;
 }
 if(inkMode==='text'){
  add('text',{text:'Ton texte',x,y,w:525,h:220,font:78,fontFamily:'sans',fontWeight:700,color:inkColor,align:'center'});
  return true;
 }
 if(inkMode==='signature'){
  const sig=prompt('Signature décorative à afficher dans la vidéo :','');
  if(sig?.trim())add('text',{text:sig.trim().slice(0,95),x,y,w:670,h:230,font:92,fontFamily:'caveat',fontWeight:500,italic:true,color:inkColor});
  return true;
 }
 return false;
}
function inkDown(ev,pt){
 if(activeTab!=='tools'||inkMode==='select'||!window.ELOAHCanvasTools)return false;
 ev.preventDefault();if(S.playing)pause();
 if(window.ELOAHCanvasTools.isPlaceTool(inkMode))return inkPlace(pt);
 inkPointer=ev.pointerId;try{canvas.setPointerCapture(ev.pointerId)}catch{}
 if(inkMode==='eraser'){inkEraseActive=false;inkErase(pt);return true}
 if(window.ELOAHCanvasTools.isDrawTool(inkMode)){
  inkDraft={tool:inkMode,color:inkColor,width:inkWidth,points:[[pt.x,pt.y]],start:S.time,end:S.duration};
  draw();return true;
 }
 return false;
}
function inkMove(ev,pt){
 if(activeTab!=='tools'||inkPointer===null||ev.pointerId!==inkPointer)return false;
 if(inkMode==='eraser'){inkErase(pt);return true}
 if(!inkDraft)return true;
 const pts=inkDraft.points,last=pts[pts.length-1];
 if(['line','arrow'].includes(inkMode)){
  if(pts.length===1)pts.push([pt.x,pt.y]);
  else pts[pts.length-1]=[pt.x,pt.y];
 }else if(pts.length<1750&&Math.hypot(pt.x-last[0],pt.y-last[1])>=2)pts.push([pt.x,pt.y]);
 draw();return true;
}
function inkUp(ev,pt,cancel=false){
 if(inkPointer===null||inkPointer!==ev.pointerId)return false;
 inkPointer=null;try{canvas.releasePointerCapture(ev.pointerId)}catch{}
 if(inkMode==='eraser'){inkEraseActive=false;return true}
 if(inkDraft){
  const draft=inkDraft;inkDraft=null;
  if(!cancel){
   const pts=draft.points,last=pts[pts.length-1];
   if(pts.length===1||Math.hypot(pt.x-last[0],pt.y-last[1])>2)pts.push([pt.x,pt.y]);
   const element=window.ELOAHCanvasTools.fromDraft(draft);
   if(element){snapshot();element.id=nextId++;S.elements.push(element);selected=null;renderTimeline();saveLocal()}
  }
  draw();return true;
 }
 return true;
}


/* Projets ELOAH : sauvegarde locale multi-designs, prévisualisation et médias associés. */
async function captureCurrentForProjects({quick=false}={}){
 S.name=one('#ecs-name').value||S.name;
 const warnings=[];
 const frames=captureFrameAssets(quick?1050:1400,quick?11000000:18000000);
 const brand=captureBrandAssets(quick?12000000:19500000);
 const photos=captureReelImages(quick?1200:1500,quick?12000000:16500000);
 const data={version:6,...serial(),frameAssets:frames,brandAssets:brand.items,
  imageAssets:photos.assets,backgroundImage:photos.background,
  videoName:video.dataset.filename||null,audioName:audio.dataset.filename||null};
 if(brand.skipped||photos.skipped)warnings.push('Certaines images trop lourdes ne sont pas incluses.');
 const thumbCanvas=document.createElement('canvas');
 thumbCanvas.width=230;thumbCanvas.height=409;
 let thumbnail=null;
 try{
  const preview=thumbCanvas.getContext('2d');preview.scale(230/1080,409/1920);
  paint(preview,S.time,false);
  thumbnail=thumbCanvas.toDataURL('image/webp',.67);
 }catch(e){console.warn('Aperçu du projet indisponible',e)}
 async function captureBlob(url,label){
  if(quick||!url)return null;
  try{
   const response=await fetch(url);if(!response.ok)throw Error('Lecture impossible');
   const blob=await response.blob();
   if(blob.size>65000000){warnings.push(label+' trop volumineux pour être intégré au projet (65 Mo maximum).');return null}
   return blob;
  }catch(e){warnings.push(label+' conservé séparément : '+e.message);return null}
 }
 const [videoBlob,audioBlob]=await Promise.all([captureBlob(media.videoUrl,'Vidéo'),captureBlob(media.audioUrl,'Musique')]);
 return {data,thumbnail,videoBlob,audioBlob,warnings};
}
async function restoreProjectFromLibrary(data,stored){
 if(!data||!Array.isArray(data.elements))throw Error('Ce projet n’a pas de composition valide.');
 pause();
 snapshot();
 for(const url of [media.videoUrl,media.audioUrl,media.imageUrl])if(url)URL.revokeObjectURL(url);
 media.videoUrl=null;media.audioUrl=null;media.imageUrl=null;media.bgImage=null;
 video.pause();audio.pause();video.removeAttribute('src');audio.removeAttribute('src');video.dataset.filename='';audio.dataset.filename='';
 images.clear();framePhotos.clear();brandEmbeddedImages.clear();brandImageCache.clear();
 const idMap=new Map();
 const elements=data.elements.slice(0,250).map(raw=>{
  const id=nextId++;idMap.set(String(raw.id),id);return {...raw,id};
 });
 apply({name:String(data.name||'Mon Reel').slice(0,90),duration:Math.max(1,Math.min(60,Number(data.duration)||5)),
   trimStart:Math.max(0,Number(data.trimStart)||0),bg:data.bg||'#fffaf1',
   filter:data.filter||'none',brand:data.brand||'ELOAH',elements});
 if(stored?.videoBlob instanceof Blob&&stored.videoBlob.size){
  media.videoUrl=URL.createObjectURL(stored.videoBlob);video.src=media.videoUrl;
  video.dataset.filename=data.videoName||'Vidéo du projet';
  video.load();
 }
 if(stored?.audioBlob instanceof Blob&&stored.audioBlob.size){
  media.audioUrl=URL.createObjectURL(stored.audioBlob);audio.src=media.audioUrl;
  audio.dataset.filename=data.audioName||'Audio du projet';audio.load();
 }
 const frameCount=await restoreFrameAssets(data.frameAssets,idMap);
 const brandCount=restoreBrandAssets(data.brandAssets,idMap);
 const imageCount=await restoreReelImages({images:data.imageAssets,background:data.backgroundImage},idMap);
 S.playing=false;S.time=0;
 saveLocal();saveFrameMediaLocal();saveBrandMediaLocal();saveReelImageAssetsLocal();
 draw();renderTimeline();renderSide();
 const absent=(data.videoName&&!stored?.videoBlob||data.audioName&&!stored?.audioBlob);
 if(absent)toast('Projet ouvert. Une vidéo ou une musique doit être réimportée depuis ton appareil.');
 return {frames:frameCount,brand:brandCount,images:imageCount};
}
function projectDownload(data,record){
 if(!data){saveProject();return}
 const text=JSON.stringify({...data,otherMediaNotIncluded:!!(record?.videoBlob||record?.audioBlob||data.videoName||data.audioName)},null,2);
 const name=(record?.name||data.name||'eloah-projet').replace(/[^\p{L}\p{N}\- ]/gu,'').slice(0,60).trim().replace(/\s+/g,'-')||'eloah-projet';
 download(new Blob([text],{type:'application/json;charset=utf-8'}),name+'.json');
 toast('Projet exporté en JSON. Les grosses vidéos et pistes audio doivent rester séparées.');
}


projectLibrary=window.ELOAHReelProjects?.create({
 root,getName:()=>one('#ecs-name')?.value||S.name,getBrand:()=>S.brand,
 getActiveTab:()=>activeTab,refresh:()=>renderSide(),toast,
 setName:value=>{S.name=value;one('#ecs-name').value=value;saveLocal()},
 capture:captureCurrentForProjects,open:restoreProjectFromLibrary,
 newProject:()=>action('reset'),
 exportJSON:projectDownload,
 importJSON:()=>one('#ecs-project-input').click(),
 importCanvaExport:()=>{setTab('import');reelImporter?.openUpload()},
 getMedia:kind=>kind==='image'?(reelImporter?.getItems('image')||[]).map(item=>({
  id:item.id,title:item.title||'Image',thumb:item.thumb||item.url||null,domain:item.domain||'',album:item.album||''
 })):[
  ...(reelImporter?.getItems('video')||[]).map(item=>({id:item.id,title:item.title||'Vidéo'})),
  ...videoStock.map(item=>({id:item.id,title:item.name||'Vidéo'}))
 ],
 openMediaTab:kind=>{setTab('import');reelImporter?.showTab(kind)},
 openMedia:(kind,id)=>{
  if(kind==='image'){setTab('import');if(!reelImporter?.openById(id))toast('Visuel introuvable dans Importer.')}
  else if(videoStock.some(item=>item.id===id)){setTab('videos');openStockVideo(id)}
  else{setTab('import');if(!reelImporter?.openById(id))toast('Vidéo introuvable dans Importer.')}
 }
})||null;

function renderSide(){
 all('.ecs-railbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeTab));
 const titles={models:'Modèles',elements:'Éléments',text:'Texte',brand:'Marque',import:'Importer',tools:'Outils de montage',projects:'Mes projets',photos:'Photos',audio:'Audio',videos:'Vidéos',properties:'Modifier l’élément'};
 one('.ecs-sidehead').textContent=titles[activeTab]||'Modifier';const box=one('.ecs-sidebody');let html='';
 if(activeTab==='models')html='<p class="ecs-note">Choisis un point de départ. Tu pourras modifier tous les éléments.</p><div class="ecs-cardgrid">'+Object.entries(themes).map(([key,t],i)=>'<button class="ecs-model m'+(i+1)+'" data-theme="'+key+'">'+xss(t.title)+'</button>').join('')+'</div><p class="ecs-note">Modèles originaux ELOAH, non issus de la bibliothèque Canva.</p>';
 if(activeTab==='elements')html=elementsMarkup();
 if(activeTab==='text')html=textPanel();
 if(activeTab==='brand')html=brandPanel();
 if(activeTab==='import')html=reelImporter?reelImporter.render():
 '<div class="ecs-import-error"><strong>La médiathèque n’a pas été chargée.</strong><p>Actualise cette page pour récupérer les images.</p>'+
 '<a href="eloah-reel-studio.html?onglet=import&vue=toutes&rechargement=1">↻ Recharger les images</a></div>';
 if(activeTab==='tools')html=inkPanel();
 if(activeTab==='projects')html=projectLibrary?projectLibrary.render():'<div class="ecs-empty"><strong>Bibliothèque Projets indisponible.</strong><p>Recharge la page pour accéder à tes designs.</p></div>';
 if(activeTab==='photos')html=photoCatalog();
 if(activeTab==='audio')html=renderAudio();
 if(activeTab==='videos')html=videoCatalog();
 if(activeTab==='properties'){
  const e=S.elements.find(q=>q.id===selected);
  if(!e)html='<div class="ecs-empty">Sélectionne un texte, une forme ou une image sur le plan de travail.</div>';
  else{
   html='<p class="ecs-note">Fais glisser cet élément sur le Reel. Pour le redimensionner, tire le petit carré dans son angle inférieur droit.</p>';
   if(e.kind==='text'||e.kind==='textCombo')html+=textProperties(e);
   if(e.kind==='photoFrame')html+=frameProperties(e);
   if(e.kind==='shapeAsset')html+=shapeProperties(e);
   if(e.kind==='inkStroke')html+='<p class="ecs-note">Trait dessiné · déplace-le ou modifie sa couleur et son épaisseur.</p>'+range('Épaisseur','inkWidth',2,70,1,e.inkWidth||14)+range('Opacité','inkOpacity',0,1,.05,e.inkOpacity??1);
   if(e.kind==='chart')html+=chartProperties(e);
   if(e.kind==='sticker')html+='<p class="ecs-note">Sticker animé : '+xss(window.ELOAHAnimations?.byId.get(e.variant)?.name||'Animation ELOAH')+'</p><label class="ecs-sidelabel">Mouvement</label><select data-p="motion">'+Object.entries(window.ELOAHAnimations?.motionNames||{}).map(([v,n])=>'<option value="'+v+'" '+((e.motion||'pulse')===v?'selected':'')+'>'+n+'</option>').join('')+'</select>'+range('Vitesse (0,2× à 4×)','speed',.2,4,.1,e.speed||1);
   else html+='<label class="ecs-sidelabel">Animation</label><select data-p="animation">'+[['none','Aucune'],['fade','Apparition douce'],['pop','Zoom dynamique'],['slide','Entrée latérale'],['pulse','Pulsation'],['float','Flottement'],['bounce','Rebond'],['wobble','Oscillation'],['swing','Balancement'],['rotate','Rotation'],['twinkle','Clignotement'],['shake','Vibration']].map(([v,n])=>'<option value="'+v+'" '+((e.animation||'none')===v?'selected':'')+'>'+n+'</option>').join('')+'</select>';

   if(e.kind!=='image')html+=color('Couleur','color',e.color);
   html+='<div class="ecs-rows"><div>'+range('Position X','x',0,1080,1,Math.round(e.x))+'</div><div>'+range('Position Y','y',0,1920,1,Math.round(e.y))+'</div></div><div class="ecs-rows"><div>'+range('Largeur','w',20,1080,1,Math.round(e.w))+'</div><div>'+range('Hauteur','h',20,1920,1,Math.round(e.h))+'</div></div><div class="ecs-rows"><div>'+range('Début (s)','start',0,S.duration,.1,e.start)+'</div><div>'+range('Fin (s)','end',0,S.duration,.1,e.end)+'</div></div>'+btn('duplicate','Dupliquer')+btn('delete','Supprimer');
  }
 }
 box.innerHTML=html;
 if(activeTab==='videos')requestAnimationFrame(scheduleStockThumbnails);
 inkPalette();
}
function setTab(tab){if(tab!=='tools'){inkDraft=null;inkPointer=null}if(tab==='elements'){elementsCategory=null;chartView='home';chartSearch=''}if(tab==='audio')audioView='home';if(tab==='videos'){stockView='home';stockSearch=''}if(tab==='photos'){photoView='home';photoSearch=''}activeTab=tab;renderSide();if(tab==='audio'&&!publicMusic.loaded&&!publicMusic.loading&&!publicMusic.error)loadPublicMusic();if(window.innerWidth<691)one('.ecs-sidebar').classList.add('ecs-open')}
function action(name){
 if(name==='old'){pause();root.style.display='none';legacy.style.display='block';document.body.classList.add('ecs-legacy-open');const h=document.querySelector('body > header');if(h)h.style.display='flex';const back=document.createElement('button');back.textContent='↗ Retour à l’éditeur visuel';back.style.cssText='position:fixed;bottom:16px;right:16px;z-index:99;background:#147a9f;color:white;padding:13px;border-radius:9px';back.onclick=()=>{legacy.style.display='none';root.style.display='flex';back.remove();if(h)h.style.display='none'};document.body.append(back);return}
 if(name==='undo'){undo();return}if(name==='redo'){redo();return}
 if(name==='play'){play();return}if(name==='restart'){pause();seek(0);return}
 if(name==='properties'){setTab('properties');return}
 if(name==='rect'){add('rect',{x:230,y:850,w:620,h:240,color:'#d7654f'});return}
 if(name==='ellipse'){add('ellipse',{x:320,y:810,w:430,h:430,color:'#28705a'});return}
 if(['heart','flower','bolt','bubble'].includes(name)){add('illustration',{variant:name,x:260,y:650,w:560,h:560,color:name==='heart'?'#d76565':name==='flower'?'#e8b844':name==='bolt'?'#e3ac29':'#86b9df'});return}
 if(['cube','sphere'].includes(name)){add(name,{x:260,y:700,w:560,h:560,color:name==='cube'?'#738ece':'#d86d9c'});return}
 if(['frame','roundframe'].includes(name)){add(name,{x:160,y:380,w:760,h:1060,color:'#d6ae59'});return}
 if(['phone','tablet'].includes(name)){add(name,{x:200,y:430,w:680,h:1000,color:'#252b35'});return}
 if(['grid2','grid3'].includes(name)){snapshot();const cols=name==='grid2'?2:3,gap=22,x=75,y=660,w=930,h=590;for(let i=0;i<cols;i++){S.elements.push({id:nextId++,kind:'rect',x:x+i*(w+gap)/cols,y,w:w/cols-gap,h,color:['#e9cad7','#c9e4ed','#cfddb4'][i],start:0,end:S.duration})}selected=null;renderTimeline();draw();saveLocal();toast('Grille ajoutée. Chaque bloc est modifiable.');return}
 if(['bars','pie'].includes(name)){add('chart',{variant:name,values:'35,55,25,45',x:130,y:720,w:820,h:550,color:'#419fc0'});return}
 if(name==='triangle'){add('triangle',{x:280,y:700,w:520,h:510,color:'#b173b8'});return}
 if(name==='line'){add('line',{x:160,y:950,w:760,h:20,color:'#2479a7'});return}
 
 if(name==='star'){add('star',{x:360,y:780,w:360,h:360,color:'#d7ad46'});return}
 if(['heading','subtitle','addText','brandLabel'].includes(name)){const k=name==='addText'?'simple':name==='brandLabel'?'simple':name;const e=createTextBlock(k);if(name==='brandLabel'){brandAddSignature();return}
 if(name==='brandLabelOld'){e.text=S.brand.toUpperCase();e.font=43;e.y=1700;e.h=130;e.color='#c69b46';saveLocal();draw()}return}
 if(name==='duplicate'){let e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne un élément à dupliquer.');return}const {id:originalId,...copy}=e;const cloned=add(e.kind,{...copy,x:Math.min(Math.max(0,1080-e.w),e.x+36),y:Math.min(Math.max(0,1920-e.h),e.y+36)});if(e.kind==='image'&&images.has(e.id)){images.set(cloned.id,images.get(e.id));saveReelImageAssetsLocal()}if(e.kind==='brandAsset'&&brandEmbeddedImages.has(e.id)){brandEmbeddedImages.set(cloned.id,brandEmbeddedImages.get(e.id));saveBrandMediaLocal()}if(e.kind==='photoFrame'){for(let i=0;i<frameSlotCount(e);i++){const src=framePhotos.get(e.id+':'+i);if(src)framePhotos.set(cloned.id+':'+i,src)}saveFrameMediaLocal()}return}
 if(name==='delete'){let e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne un élément à supprimer.');return}snapshot();S.elements=S.elements.filter(x=>x.id!==selected);if(e.kind==='image'){images.delete(e.id);saveReelImageAssetsLocal()}if(e.kind==='brandAsset'){brandEmbeddedImages.delete(e.id);saveBrandMediaLocal()}if(e.kind==='photoFrame'){for(let i=0;i<frameSlotCount(e);i++)framePhotos.delete(e.id+':'+i);saveFrameMediaLocal()}selected=null;setTab('elements');renderTimeline();saveLocal();return}
 if(name==='forward'||name==='backward'){let i=S.elements.findIndex(x=>x.id===selected);if(i<0)return;snapshot();let e=S.elements.splice(i,1)[0];S.elements.splice(name==='forward'?S.elements.length:0,0,e);saveLocal();return}
 if(name==='chartImportCSV'){one('#ecs-chart-file-input')?.click();return}
 if(name==='chartExportCSV'){
  const e=S.elements.find(x=>x.id===selected&&x.kind==='chart');if(!e)return toast('Sélectionne un graphique.');
  const csv=window.ELOAHCharts.migrateLegacy(e);
  download(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'eloah-donnees-graphique.csv');
  toast('Données CSV exportées.');return;
 }
 if(name==='chartExample'){
  const e=S.elements.find(x=>x.id===selected&&x.kind==='chart');if(!e)return;
  snapshot();e.dataText=window.ELOAHCharts.settings(e.variant).dataText;saveLocal();renderSide();draw();toast('Données d’exemple adaptées au modèle.');return;
 }
  if(name==='mockupVideo'){
  const e=frameSelected();
  if(!e?.isMockup){toast('Sélectionne une maquette avec écran.');return}
  snapshot();
  if(e.mockVideo&&e.videoSlot===activeFrameSlot){e.mockVideo=false;toast('La vidéo a été retirée de cet écran.')}
  else{e.mockVideo=true;e.videoSlot=activeFrameSlot;if(!media.videoUrl){toast('Choisis une vidéo à insérer dans la maquette.');one('#ecs-video-input').click()}}
  saveLocal();renderSide();draw();return;
 }
  if(name==='gridFillAll'){
  const f=frameSelected();if(!f?.isGrid){toast('Sélectionne une grille.');return}
  activeFrameSlot=0;importKind='frame';one('#ecs-image-input').click();return;
 }
  if(name==='frameImage'){if(!frameSelected()){toast('Sélectionne un cadre.');return}importKind='frame';one('#ecs-image-input').click();return}
 if(name==='frameLibrary'){if(!frameSelected()){toast('Sélectionne un cadre.');return}setTab('photos');return}
 if(name==='frameClear'){const frame=frameSelected();if(!frame)return;framePhotos.delete(frame.id+':'+activeFrameSlot);saveFrameMediaLocal();renderSide();draw();saveLocal();return}
 if(name==='importVideo'){one('#ecs-video-input').click();return}
 if(name==='importImage'){importKind='background';one('#ecs-image-input').click();return}
 if(name==='addImage'){importKind='element';one('#ecs-image-input').click();return}
 if(name==='importAudio'){one('#ecs-audio-input').click();return}
 if(name==='recordStart'){startVoiceRecording();return}
 if(name==='recordStop'){stopVoiceRecording();return}
 if(name==='voicePlay'){synthPlay();return}
 if(name==='voiceStop'){if(window.speechSynthesis)window.speechSynthesis.cancel();speechStatus='Lecture arrêtée.';renderSide();return}
 if(name==='removeAudio'){if(media.audioUrl)URL.revokeObjectURL(media.audioUrl);media.audioUrl=null;audio.removeAttribute('src');renderTimeline();renderSide();return}
 if(name==='removeVideo'){pause();if(media.videoUrl)URL.revokeObjectURL(media.videoUrl);media.videoUrl=null;S.trimStart=0;video.removeAttribute('src');renderTimeline();renderSide();saveLocal();return}
 if(name==='png'){drawPng();return}
 if(name==='librarySave'){if(projectLibrary)projectLibrary.saveCurrent();else saveProject();return}
 if(name==='save'){saveProject();return}
 if(name==='load'){one('#ecs-project-input').click();return}
 if(name==='reset'){if(!confirm('Créer un nouveau projet ? Les modifications non exportées seront perdues.'))return false;projectLibrary?.clearCurrent();snapshot();S.name='Sans titre';one('#ecs-name').value=S.name;S.elements=[];S.bg='#fffaf1';S.duration=5;S.trimStart=0;S.time=0;S.filter='none';selected=null;pause();for(const url of [media.videoUrl,media.audioUrl,media.imageUrl])if(url)URL.revokeObjectURL(url);media.videoUrl=null;media.audioUrl=null;media.imageUrl=null;media.bgImage=null;video.removeAttribute('src');audio.removeAttribute('src');video.dataset.filename='';audio.dataset.filename='';images.clear();try{localStorage.removeItem('eloah_reel_editor_image_assets')}catch{};framePhotos.clear();brandEmbeddedImages.clear();brandImageCache.clear();try{localStorage.removeItem('eloah_reel_editor_brand_assets')}catch{};for(const url of frameObjectUrls)URL.revokeObjectURL(url);frameObjectUrls.clear();try{localStorage.removeItem('eloah_reel_editor_frame_assets')}catch{};setTab('models');renderTimeline();saveLocal();return true}
 if(name==='export'){exportVideo();return}
}
root.addEventListener('click',ev=>{
 if(projectLibrary?.click(ev))return;

 const chosenTool=ev.target.closest('[data-ink-tool]');
 if(chosenTool){
  inkMode=chosenTool.dataset.inkTool;inkDraft=null;inkPointer=null;
  saveInkPrefs();if(activeTab!=='tools')activeTab='tools';renderSide();return;
 }
 const togglePalette=ev.target.closest('[data-ink-palette-toggle]');
 if(togglePalette){inkPaletteOpen=!inkPaletteOpen;renderSide();return}
 const clearDrawings=ev.target.closest('[data-ink-clear]');
 if(clearDrawings){
  const count=S.elements.filter(x=>x.kind==='inkStroke').length;
  if(!count){toast('Aucun dessin à effacer.');return}
  if(!confirm('Supprimer '+count+' tracé(s) de ce Reel ?'))return;
  snapshot();S.elements=S.elements.filter(x=>x.kind!=='inkStroke');
  selected=null;renderTimeline();renderSide();saveLocal();draw();
  toast(count+' tracés supprimés.');return;
 }
 if(reelImporter?.handleClick(ev))return;

 const brandViewBtn=ev.target.closest('[data-brand-view]');
 if(brandViewBtn){brandView=brandViewBtn.dataset.brandView;brandSearch='';renderSide();return}
 const brandCreate=ev.target.closest('[data-brand-create]');
 if(brandCreate){brandCreating=!brandCreating;renderSide();if(brandCreating)one('#ecs-brand-new-name')?.focus();return}
 const brandConfirm=ev.target.closest('[data-brand-create-confirm]');
 if(brandConfirm){
  const name=one('#ecs-brand-new-name')?.value.trim();
  if(!name){toast('Donne un nom à cette identité.');return}
  const result=window.ELOAHBrand.create(name);
  if(!result)return toast('Limite de 24 identités visuelles atteinte.');
  brandKitId=result.kit.id;brandView='overview';brandCreating=false;brandSearch='';
  try{localStorage.setItem('eloah_reel_active_brand',brandKitId)}catch{}
  brandStatus(result,'Identité '+result.kit.name+' créée.');renderSide();return;
 }
 const brandQuickColor=ev.target.closest('[data-brand-quickcolor]');
 if(brandQuickColor){
  const kit=brandKit(),i=Number(brandQuickColor.dataset.brandQuickcolor);
  if(!kit?.colors[i])return;
  snapshot();S.bg=kit.colors[i][1];S.brand=kit.name;saveLocal();draw();
  toast('Couleur '+kit.colors[i][0]+' appliquée au fond.');return;
 }
 const brandApplyElement=ev.target.closest('[data-brand-apply-to-element]');
 if(brandApplyElement){
  const kit=brandKit(),element=S.elements.find(e=>e.id===selected);
  if(!element){toast('Sélectionne d’abord un texte, une forme ou un graphique sur le Reel.');return}
  if(['image','brandAsset','photoFrame'].includes(element.kind)){toast('La couleur d’accent s’applique aux textes, graphiques et formes, pas aux photos.');return}
  snapshot();const accent=kit.colors[Math.min(2,kit.colors.length-1)][1];element.color=accent;if(element.kind==='chart')element.chartCustomColor=accent;saveLocal();draw();
  toast('Couleur de marque appliquée à l’élément sélectionné.');return;
 }
 const brandApply=ev.target.closest('[data-brand-apply]');
 if(brandApply){brandApplyIdentity();return}
 const brandLayout=ev.target.closest('[data-brand-layout]');
 if(brandLayout){brandCompose(brandLayout.dataset.brandLayout);return}
 const brandSave=ev.target.closest('[data-brand-save-model]');
 if(brandSave){brandSaveModel();return}
 const brandUse=ev.target.closest('[data-brand-use-model]');
 if(brandUse){brandUseModel(brandUse.dataset.brandUseModel);return}
 const brandRemoveModel=ev.target.closest('[data-brand-remove-model]');
 if(brandRemoveModel){
  const kit=brandKit();if(!confirm('Supprimer définitivement ce modèle enregistré dans '+kit.name+' ?'))return;
  brandStatus(window.ELOAHBrand.removeModel(kit.id,brandRemoveModel.dataset.brandRemoveModel),'Modèle supprimé.');renderSide();return;
 }
 const brandUpload=ev.target.closest('[data-brand-upload]');
 if(brandUpload){brandUploadCategory=brandUpload.dataset.brandUpload;brandUploadTargetId=brandKit()?.id;one('#ecs-brand-image-input')?.click();return}
 const brandLogo=ev.target.closest('[data-brand-insert-logo]');
 if(brandLogo){brandInsertAsset('logo');return}
 const brandRemoveLogo=ev.target.closest('[data-brand-remove-logo]');
 if(brandRemoveLogo){const kit=brandKit();if(!confirm('Retirer le logo importé de '+kit.name+' ?'))return;brandStatus(window.ELOAHBrand.setLogo(kit.id,null),'Logo retiré.');renderSide();draw();return}
 const brandSignature=ev.target.closest('[data-brand-insert-signature]');
 if(brandSignature){brandAddSignature();return}
 const brandHeading=ev.target.closest('[data-brand-add-heading]');
 if(brandHeading){brandAddHeading();return}
 const brandAddColor=ev.target.closest('[data-brand-add-color]');
 if(brandAddColor){brandStatus(window.ELOAHBrand.addColor(brandKit()?.id),'Nouvelle couleur ajoutée.');renderSide();return}
 const brandDeleteColor=ev.target.closest('[data-brand-delete-color]');
 if(brandDeleteColor){brandStatus(window.ELOAHBrand.removeColor(brandKit()?.id,Number(brandDeleteColor.dataset.brandDeleteColor)),'Couleur retirée.');renderSide();return}
 const brandAssetAdd=ev.target.closest('[data-brand-asset-insert]');
 if(brandAssetAdd){brandInsertAsset(brandAssetAdd.dataset.brandAssetInsert);return}
 const brandAssetDelete=ev.target.closest('[data-brand-asset-delete]');
 if(brandAssetDelete){
  const kit=brandKit();
  if(!confirm('Supprimer cette ressource de '+kit.name+' ?'))return;
  brandStatus(window.ELOAHBrand.removeAsset(kit.id,brandAssetDelete.dataset.brandAssetDelete),'Ressource supprimée.');renderSide();draw();return;
 }
 const brandElements=ev.target.closest('[data-brand-open-elements]');
 if(brandElements){activeTab='elements';elementsCategory=brandElements.dataset.brandOpenElements;renderSide();return}
 const brandExport=ev.target.closest('[data-brand-export]');
 if(brandExport){
  const kit=brandKit(),json=window.ELOAHBrand.exportKit(kit.id);
  if(!json)return toast('Identité introuvable.');
  download(new Blob([json],{type:'application/json;charset=utf-8'}),'eloah-marque-'+kit.id.replace(/[^a-z0-9-]/ig,'')+'.json');
  toast('Identité '+kit.name+' exportée avec ses réglages et ressources.');return;
 }
 const brandImport=ev.target.closest('[data-brand-import]');
 if(brandImport){one('#ecs-brand-json-input')?.click();return}
 const textViewBtn=ev.target.closest('[data-text-view]');
 if(textViewBtn){textView=textViewBtn.dataset.textView;textSearch='';renderSide();return}
 const textPresetBtn=ev.target.closest('[data-text-preset]');
 if(textPresetBtn){createTextPreset(textPresetBtn.dataset.textPreset);return}
 const textAdd=ev.target.closest('[data-text-add]');
 if(textAdd){createTextBlock(textAdd.dataset.textAdd);return}
 const textApp=ev.target.closest('[data-text-app]');
 if(textApp){
  const name=textApp.dataset.textApp;
  if(name==='studio')textView='g0';
  else if(name==='craft')textView='g5';
  else if(name==='motion'){
   const e=createTextBlock('simple');
   e.text='LE TEXTE PREND VIE';e.color='#f0d877';e.textMode='typewriter';e.fontFamily='poster';
   saveLocal();renderSide();draw();toast('MotionText : animation machine à écrire ajoutée.');
   return;
  }
  activeTab='text';renderSide();return;
 }
 const magicGenerate=ev.target.closest('[data-text-magic-generate]');
 if(magicGenerate){const idea=one('#ecs-magic-idea')?.value||textMagicInput;textMagicInput=idea;const tone=one('#ecs-magic-tone')?.value||textMagicTone;textMagicTone=tone;
  textMagicSuggestions=magicSuggestions(idea,tone);
  if(!textMagicSuggestions.length){toast('Écris une idée pour recevoir des suggestions.');return}
  renderSide();return;
 }
 const magicAdd=ev.target.closest('[data-text-magic-add]');
 if(magicAdd){
  const i=Number(magicAdd.dataset.textMagicAdd);if(!Number.isInteger(i)||!textMagicSuggestions[i])return;
  const e=createTextBlock('simple');e.text=textMagicSuggestions[i];e.font=58;e.w=950;e.x=65;e.h=400;
  saveLocal();renderSide();draw();toast('Texte proposé ajouté. Tu peux encore le réécrire.');return;
 }
 const textAlign=ev.target.closest('[data-text-align]');
 if(textAlign){const e=S.elements.find(x=>x.id===selected&&(x.kind==='text'||x.kind==='textCombo'));if(!e)return;
  snapshot();e.align=textAlign.dataset.textAlign;saveLocal();renderSide();draw();return;
 }
  const chartRowButton=ev.target.closest('[data-chart-add-row]');
 if(chartRowButton){updateChartTable(d=>{if(d.labels.length>=24){toast('Maximum de 24 catégories.');return}d.labels.push('Catégorie '+(d.labels.length+1));d.values.push(d.names.map(()=>0))});return}
 const chartSeriesAdd=ev.target.closest('[data-chart-add-series]');
 if(chartSeriesAdd){updateChartTable(d=>{if(d.names.length>=3){toast('Maximum de 3 séries affichées.');return}d.names.push('Série '+(d.names.length+1));d.values.forEach(row=>row.push(0))});return}
 const chartSeriesRemove=ev.target.closest('[data-chart-remove-series]');
 if(chartSeriesRemove){updateChartTable(d=>{if(d.names.length<=1){toast('Une série est nécessaire.');return}d.names.pop();d.values.forEach(row=>row.pop())});return}
 const chartRemoveRow=ev.target.closest('[data-chart-remove-row]');
 if(chartRemoveRow){updateChartTable(d=>{if(d.labels.length<=1){toast('Il faut au moins une catégorie.');return}const i=Number(chartRemoveRow.dataset.chartRemoveRow);d.labels.splice(i,1);d.values.splice(i,1)});return}
 const chartGroup=ev.target.closest('[data-chart-group]');if(chartGroup){chartView=chartGroup.dataset.chartGroup;chartSearch='';renderSide();return}
 const chartAdd=ev.target.closest('[data-chart-add]');if(chartAdd){createChart(chartAdd.dataset.chartAdd);return}
 const chartData=ev.target.closest('[data-chart-open-data]');if(chartData){
  const selectedChart=S.elements.find(e=>e.id===selected&&e.kind==='chart');
  if(selectedChart){setTab('properties');requestAnimationFrame(()=>one('#ecs-chart-data')?.focus())}
  else createChart('eloah-chart-vertical',true);
  return;
 }
 const shapeGroup=ev.target.closest('[data-shape-group]');
 if(shapeGroup){shapeView=shapeGroup.dataset.shapeGroup;shapeSearch='';renderSide();return}
 const shapeAdd=ev.target.closest('[data-shape-add]');
 if(shapeAdd){
   const def=window.ELOAHShapes?.byId.get(shapeAdd.dataset.shapeAdd);if(!def)return;
   const linear=window.ELOAHShapes.isLine(def),name=def.label;
   const detail=def.params.style||'',vertical=linear&&detail==='vertical';
   const organic=linear&&['diag','elbow','step','zigzag','wave','arc','curve','hook','bracket','loop'].includes(detail);
   const dimensions=vertical?{w:220,h:780}:organic?{w:710,h:560}:linear?{w:810,h:235}:{w:550,h:550};
   const e=add('shapeAsset',{variant:def.id,color:'#182632',strokeWidth:0,strokeColor:'#ffffff',
    lineStyle:['dash','arrowdash'].includes(detail)?'dash':detail==='dot'?'dot':'solid',
    lineWidth:detail==='thick'?43:detail==='thin'?10:20,lineCap:'round',
    opacity:1,rotation:0,flipX:false,flipY:false,w:dimensions.w,h:dimensions.h,
    x:Math.round((1080-dimensions.w)/2),y:Math.round((1920-dimensions.h)/2)});
   toast(name+' ajouté — modifie les réglages ou déplace la forme sur le Reel.');return;
 }
 const flipShape=ev.target.closest('[data-shape-flip]');
 if(flipShape){
  const e=S.elements.find(x=>x.id===selected&&x.kind==='shapeAsset');if(!e)return;
  const prop=flipShape.dataset.shapeFlip;if(!['flipX','flipY'].includes(prop))return;
  snapshot();e[prop]=!e[prop];saveLocal();renderSide();draw();return;
 }
 const mockupGroup=ev.target.closest('[data-mockup-group]');
 if(mockupGroup){mockupView=mockupGroup.dataset.mockupGroup;mockupSearch='';renderSide();return}
 const mockupAdd=ev.target.closest('[data-mockup-add]');
 if(mockupAdd){
  const item=window.ELOAHMockups?.byId.get(mockupAdd.dataset.mockupAdd);if(!item)return;
  const size=window.ELOAHFrames.dimensions(item);
  const e=add('photoFrame',{variant:item.id,isMockup:true,mockVideo:false,videoSlot:0,color:item.palette.accent,borderSize:9,frameSlots:[],w:size.w,h:size.h,x:Math.round((1080-size.w)/2),y:Math.round((1920-size.h)/2)});
  activeFrameSlot=0;mockupView='home';mockupSearch='';renderSide();toast(item.name+' ajouté. Remplis ses emplacements dans Modifier.');
  return;
 }
 const gridGroup=ev.target.closest('[data-grid-group]');
 if(gridGroup){gridView=gridGroup.dataset.gridGroup;gridSearch='';renderSide();return}
 const gridAdd=ev.target.closest('[data-grid-add]');
 if(gridAdd){
  const def=window.ELOAHGrids?.byId.get(gridAdd.dataset.gridAdd);if(!def)return;
  const size=window.ELOAHFrames.dimensions(def);
  const el=add('photoFrame',{variant:def.id,isGrid:true,gridGap:def.defaultGap||12,color:'#ffffff',borderSize:0,frameSlots:[],x:Math.round((1080-size.w)/2),y:Math.round((1920-size.h)/2),w:size.w,h:size.h});
  activeFrameSlot=0;gridView='all';gridSearch='';renderSide();
  toast(def.label+' · '+def.customSlots.length+' cases ajoutées. Ajoute tes photos dans Modifier.');
  return;
 }
  const frameGroup=ev.target.closest('[data-frame-group]');if(frameGroup){frameView=frameGroup.dataset.frameGroup;frameSearch='';renderSide();return}
 const frameAdd=ev.target.closest('[data-frame-add]');if(frameAdd){
   const def=window.ELOAHFrames?.byId.get(frameAdd.dataset.frameAdd);if(!def)return;
   const sz=window.ELOAHFrames.dimensions(def);
   const newFrame=add('photoFrame',{variant:def.id,color:def.accent,w:sz.w,h:sz.h,x:Math.round((1080-sz.w)/2),y:Math.round((1920-sz.h)/2),borderSize:17,frameSlots:[]});
   activeFrameSlot=0;elementsCategory='frames';frameView='home';frameSearch='';renderSide();toast(def.label+' ajouté. Remplis-le avec une photo dans Modifier.');return;
 }
 const animGroup=ev.target.closest('[data-animation-group]');if(animGroup){animationView=animGroup.dataset.animationGroup;animationSearch='';renderSide();return}
 const sticker=ev.target.closest('[data-sticker]');if(sticker){
  const item=window.ELOAHAnimations?.byId.get(sticker.dataset.sticker);if(!item)return;
  const element=add('sticker',{variant:item.id,color:item.color,x:270,y:650,w:540,h:540,motion:item.motion,animation:'none',speed:1});
  elementsCategory='animations';animationView='home';animationSearch='';activeTab='elements';renderSide();renderTimeline();
  seek(element.start);toast(item.name+' ajouté — ▶ pour voir son animation.');return;
 }
 const motionBtn=ev.target.closest('[data-apply-motion]');if(motionBtn){
  const element=S.elements.find(e=>e.id===selected);
  if(!element){toast('Sélectionne un élément sur la page.');return}
  snapshot();
  if(element.kind==='sticker'){element.motion=motionBtn.dataset.applyMotion;element.animation='none'}else element.animation=motionBtn.dataset.applyMotion;
  saveLocal();seek(element.start);renderSide();toast('Mouvement appliqué : '+motionBtn.textContent+'. Lance ▶ pour prévisualiser.');return;
 }
 const illGroup=ev.target.closest('[data-ill-group]');if(illGroup){illustrationView=illGroup.dataset.illGroup;illustrationSearch='';renderSide();return}
 const illAdd=ev.target.closest('[data-ill-add]');if(illAdd){
  const item=window.ELOAHIllustrations?.byId.get(illAdd.dataset.illAdd);
  if(!item)return;
  const gradient=item.id.startsWith('fade-'),animated=item.group==='Animations';
  add('vector',{variant:item.id,color:item.color,x:gradient?125:260,y:gradient?460:730,w:gradient?830:560,h:gradient?900:560,animation:animated?'pop':'none'});
  toast(item.name+' ajouté. Tu peux le déplacer, recolorer et animer.');
  return;
 }
  const photoClose=ev.target.closest('[data-photo-close]');if(photoClose){closePhotoModal();return}
 const photoGroup=ev.target.closest('[data-photo-group]');if(photoGroup){photoView=photoGroup.dataset.photoGroup;photoSearch='';renderSide();return}
 const photoOpen=ev.target.closest('[data-photo-open]');if(photoOpen){openPhoto(photoOpen.dataset.photoOpen);return}
 const photoAdd=ev.target.closest('[data-photo-add]');if(photoAdd){usePhoto(photoAdd.dataset.photoAdd,false);return}
 const photoBackground=ev.target.closest('[data-photo-background]');if(photoBackground){usePhoto(photoBackground.dataset.photoBackground,true);return}
 const videoClose=ev.target.closest('[data-stock-close]');if(videoClose){closeStockPreview();return}
 const videoGroup=ev.target.closest('[data-stock-group]');if(videoGroup){stockView=videoGroup.dataset.stockGroup;stockSearch='';renderSide();return}
 const videoOpen=ev.target.closest('[data-stock-open]');if(videoOpen){openStockVideo(videoOpen.dataset.stockOpen);return}
 const videoAdd=ev.target.closest('[data-stock-add]');if(videoAdd){importStockVideo(videoAdd.dataset.stockAdd);return}
  const retry=ev.target.closest('[data-retry-music]');if(retry){publicMusic.error='';publicMusic.loaded=false;loadPublicMusic();return}
 const publicPreview=ev.target.closest('[data-real-preview]');if(publicPreview){previewPublicMusic(publicPreview.dataset.realPreview);return}
 const publicAdd=ev.target.closest('[data-real-add]');if(publicAdd){addPublicMusic(publicAdd.dataset.realAdd);return}
 const audioPanel=ev.target.closest('[data-audio-view]');
 if(audioPanel){if(window.speechSynthesis)window.speechSynthesis.cancel();audioView=audioPanel.dataset.audioView;activeTab='audio';renderSide();return}
 const soundPreview=ev.target.closest('[data-preview-track]');if(soundPreview){previewSound(soundPreview.dataset.previewTrack);return}
 const soundAdd=ev.target.closest('[data-add-track]');if(soundAdd){addSound(soundAdd.dataset.addTrack);return}
 const cat=ev.target.closest('[data-cat]');if(cat){elementsCategory=cat.dataset.cat==='overview'?null:cat.dataset.cat;textView='home';textSearch='';chartView='home';chartSearch='';illustrationView='home';illustrationSearch='';animationView='home';animationSearch='';frameView='home';frameSearch='';gridView='all';gridSearch='';mockupView='home';mockupSearch='';shapeView='home';shapeSearch='';activeTab='elements';renderSide();return}
 const animButton=ev.target.closest('[data-animation]');if(animButton){const e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne d’abord un élément sur le Reel.');return}snapshot();e.animation=animButton.dataset.animation;saveLocal();toast('Animation appliquée : '+animButton.textContent);return}
 const recent=ev.target.closest('[data-recent]');if(recent){const e=S.elements.find(x=>x.id===Number(recent.dataset.recent));if(e){const {id,...copy}=e;const clone=add(e.kind,{...copy,x:Math.min(1080-e.w,e.x+38),y:Math.min(1920-e.h,e.y+38)});if(e.kind==='image'&&images.has(e.id)){images.set(clone.id,images.get(e.id));saveReelImageAssetsLocal()}if(e.kind==='brandAsset'&&brandEmbeddedImages.has(e.id)){brandEmbeddedImages.set(clone.id,brandEmbeddedImages.get(e.id));saveBrandMediaLocal()}if(e.kind==='photoFrame'){for(let i=0;i<frameSlotCount(e);i++){const src=framePhotos.get(e.id+':'+i);if(src)framePhotos.set(clone.id+':'+i,src)}saveFrameMediaLocal()}toast('Élément dupliqué sur la page.')}return}
 const tb=ev.target.closest('[data-tab]');if(tb&&root.contains(tb)){setTab(tb.dataset.tab);return}
 const themed=ev.target.closest('[data-theme]');if(themed){snapshot();const t=themes[themed.dataset.theme];S.bg=t.bg;S.brand=t.brand;S.elements=[{id:nextId++,kind:'text',text:t.title,x:90,y:720,w:900,h:450,color:t.color,font:92,start:0,end:S.duration}];selected=null;renderTimeline();renderSide();saveLocal();return}
 const sel=ev.target.closest('[data-select]');if(sel){selected=Number(sel.dataset.select);setTab('properties');renderTimeline();return}
 const b=ev.target.closest('[data-action]');if(b)action(b.dataset.action)
});
one('#ecs-name').addEventListener('change',e=>{S.name=e.target.value.slice(0,90)||'Mon Reel';saveLocal()});
one('.ecs-sidebody').addEventListener('change',e=>{
 if(projectLibrary?.change(e))return;
 if(reelImporter?.handleChange(e))return;

 if(e.target.id==='ecs-brand-kit'){
  brandKitId=e.target.value;brandView='overview';brandSearch='';brandCreating=false;
  try{localStorage.setItem('eloah_reel_active_brand',brandKitId)}catch{}
  renderSide();return;
 }
 if(e.target.dataset.brandFont){
  const result=window.ELOAHBrand.edit(brandKit()?.id,{[e.target.dataset.brandFont]:e.target.value});
  brandStatus(result,'Police de marque enregistrée.');renderSide();return;
 }
 if(e.target.dataset.brandColor!==undefined){
  brandStatus(window.ELOAHBrand.recolor(brandKit()?.id,Number(e.target.dataset.brandColor),e.target.value),'Couleur enregistrée.');renderSide();return;
 }
 if(e.target.dataset.brandColorName!==undefined){
  brandStatus(window.ELOAHBrand.colorName(brandKit()?.id,Number(e.target.dataset.brandColorName),e.target.value));
  renderSide();return;
 }
 if(e.target.dataset.brandField){
  const kit=brandKit();if(kit&&kit.name===S.brand&&e.target.dataset.brandField==='name'){S.brand=e.target.value;saveLocal()}
  renderSide();return;
 }
 if(e.target.id==='ecs-magic-tone'){textMagicTone=e.target.value;return}
 if(e.target.dataset.textToggle){
  const element=S.elements.find(x=>x.id===selected&&(x.kind==='text'||x.kind==='textCombo'));if(!element)return;
  const kind=e.target.dataset.textToggle;
  snapshot();
  if(kind==='textBackground')element.backgroundColor=e.target.checked?'#171717':null;
  else if(['italic','shadow'].includes(kind))element[kind]=e.target.checked;
  saveLocal();renderSide();draw();return;
 }
 if(e.target.hasAttribute('data-text-transparent')){
  const element=S.elements.find(x=>x.id===selected&&x.kind==='textCombo');if(!element)return;
  snapshot();element.comboBackground=e.target.checked?'transparent':(window.ELOAHText?.byId.get(element.variant)?.back||'#fffdfa');
  saveLocal();renderSide();draw();return;
 }
 if(e.target.dataset.chartCell||e.target.dataset.chartSeries){
  const cell=e.target.dataset.chartCell,series=e.target.dataset.chartSeries;
  const value=e.target.value;
  updateChartTable(d=>{
   if(cell){const [ri,col]=cell.split(':').map(Number);if(!Number.isInteger(ri)||ri<0||ri>=d.labels.length)return;
    if(col===0)d.labels[ri]=String(value).slice(0,25)||'Sans titre';
    else if(col<=d.names.length)d.values[ri][col-1]=Number.isFinite(Number(value))?Number(value):0;
   }else if(series!==undefined){const i=Number(series);if(Number.isInteger(i)&&i>=0&&i<d.names.length)d.names[i]=String(value).slice(0,25)||'Série '+(i+1)}
  });
  return;
 }
 if(e.target.dataset.chartFlag){
  const eChart=S.elements.find(x=>x.id===selected&&x.kind==='chart');if(!eChart)return;
  snapshot();eChart[e.target.dataset.chartFlag]=e.target.checked;saveLocal();draw();return;
 }
 if(e.target.hasAttribute('data-frame-slot')){activeFrameSlot=Math.max(0,Number(e.target.value)||0);renderSide();draw();return}
 if(e.target.id==='ecs-tts-speed'){voiceSpeed=Number(e.target.value);return}
 if(e.target.id==='ecs-tts-voice'){const voices=window.speechSynthesis?.getVoices().filter(v=>v.lang.toLowerCase().startsWith('fr'))||[];voiceSelection=voices[Number(e.target.value)]?.name||'';return}
 const p=e.target.dataset.p,setting=e.target.dataset.setting;
 if(p){const target=p==='bg'||p==='duration'||p==='trimStart'?S:S.elements.find(q=>q.id===selected);if(!target)return;snapshot();let val=['text','color','bg','values','animation','motion','lineStyle','lineCap','strokeColor','chartPalette','chartTitle','dataText','chartBackground','fontFamily','secondaryFont','subtext','eyebrow','textMode','align','outlineColor','backgroundColor','comboBackground','accentColor'].includes(p)?e.target.value:Number(e.target.value);if(!Number.isFinite(val)&&typeof val==='number')return;if(p==='duration'){val=Math.max(1,Math.min(media.videoUrl?Math.max(1,(video.duration||60)-S.trimStart):60,val));S.duration=val;S.elements.forEach(x=>x.end=Math.min(val,x.end));seek(S.time)}else if(p==='trimStart'){S.trimStart=Math.max(0,Math.min(val,Math.max(0,(video.duration||0)-1)));S.duration=Math.min(S.duration,Math.max(1,(video.duration||S.duration)-S.trimStart));S.elements.forEach(x=>x.end=Math.min(S.duration,x.end));seek(S.time)}else if(p==='start')target.start=Math.max(0,Math.min(val,target.end-.1));else if(p==='end')target.end=Math.min(S.duration,Math.max(val,target.start+.1));else{target[p]=val;if(p==='chartPalette'&&target.kind==='chart')target.chartCustomColor=null}if(p==='duration'||p==='trimStart'||p==='start'||p==='end')renderTimeline();saveLocal();draw();if(['chartPalette','dataText','textMode','comboBackground','fontFamily','secondaryFont','backgroundColor'].includes(p))renderSide();return}
 if(setting){snapshot();S[setting]=e.target.value;saveLocal();draw()}
});
one('.ecs-sidebody').addEventListener('input',e=>{
 if(projectLibrary?.input(e))return;

 if(e.target.hasAttribute('data-ink-color')){
  if(/^#[0-9a-f]{6}$/i.test(e.target.value))inkColor=e.target.value;
  saveInkPrefs();return;
 }
 if(e.target.hasAttribute('data-ink-width')){
  inkWidth=Math.max(2,Math.min(70,Number(e.target.value)||14));
  const output=e.target.nextElementSibling;if(output?.tagName==='OUTPUT')output.textContent=inkWidth+' px';
  saveInkPrefs();return;
 }
 if(reelImporter?.handleInput(e))return;

 if(e.target.id==='ecs-brand-search'){
  brandSearch=e.target.value;
  const results=one('#ecs-brand-results');if(results)results.innerHTML=brandSearchMarkup(brandSearch,brandKit());
  return;
 }
 if(e.target.dataset.brandField){
  const kit=brandKit(),field=e.target.dataset.brandField;
  const result=window.ELOAHBrand.edit(kit?.id,{[field]:e.target.value});
  if(result?.ok===false)toast(result.message);
  return;
 }
 if(e.target.id==='ecs-text-search'){
  textSearch=e.target.value;
  const needle=textSearch.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-type-card').forEach(card=>{card.hidden=!!needle&&!card.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(needle)});
  all('[data-type-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-type-card')].some(card=>!card.hidden)});
  return;
 }
 if(e.target.id==='ecs-magic-idea'){textMagicInput=e.target.value;return}
 if(['text','subtext','eyebrow'].includes(e.target.dataset.p)){
  const selectedText=S.elements.find(x=>x.id===selected&&(x.kind==='text'||x.kind==='textCombo'));
  if(selectedText){selectedText[e.target.dataset.p]=e.target.value;saveLocal();draw()}return;
 }
 if(e.target.id==='ecs-chart-search'){
  chartSearch=e.target.value;
  const query=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-chart-tile').forEach(el=>{el.hidden=!!query&&!el.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query)});
  all('[data-chart-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-chart-tile')].some(el=>!el.hidden)});
  return;
 }
 if(e.target.id==='ecs-chart-data'){
   const active=S.elements.find(x=>x.id===selected&&x.kind==='chart');if(!active)return;
   active.dataText=e.target.value;saveLocal();draw();return;
 }
 if(e.target.id==='ecs-shape-search'){
  shapeSearch=e.target.value;
  const q=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-shape-tile').forEach(t=>{t.hidden=!!q&&!t.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q)});
  all('[data-shape-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-shape-tile')].some(tile=>!tile.hidden)});
  return;
 }
 if(e.target.hasAttribute('data-shape-opacity')){
  const element=S.elements.find(el=>el.id===selected&&el.kind==='shapeAsset');if(!element)return;
  element.opacity=Math.min(1,Math.max(0,Number(e.target.value)/100));
  const v=e.target.parentElement?.querySelector('.ecs-opacity-value');if(v)v.textContent=Math.round(element.opacity*100)+' %';
  saveLocal();draw();return;
 }
 if(e.target.id==='ecs-mockup-search'){
  mockupSearch=e.target.value;
  const term=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-mock-tile').forEach(el=>{el.hidden=!!term&&!el.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(term)});
  all('[data-mockup-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-mock-tile')].some(el=>!el.hidden)});
  return;
 }
 if(e.target.id==='ecs-grid-search'){
  gridSearch=e.target.value;
  const needle=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-grid-tile').forEach(item=>{item.hidden=!!needle&&!item.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(needle)});
  all('[data-grid-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-grid-tile')].some(tile=>!tile.hidden)});
  return;
 }
 if(e.target.hasAttribute('data-grid-gap')){
  const frame=frameSelected();if(!frame?.isGrid)return;
  frame.gridGap=Math.max(0,Math.min(55,Number(e.target.value)||0));
  const txt=e.target.nextElementSibling;if(txt?.classList.contains('ecs-note'))txt.textContent=frame.gridGap+' px';
  draw();saveLocal();return;
 }
  if(e.target.id==='ecs-frame-search'){
  frameSearch=e.target.value;
  const term=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-frame-tile').forEach(button=>{button.hidden=!!term&&!button.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(term)});
  all('[data-frame-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-frame-tile')].some(tile=>!tile.hidden)});
  return;
 }
 if(e.target.dataset.frameOpt){
   const f=frameSelected();if(!f)return;
   if(!Array.isArray(f.frameSlots))f.frameSlots=[];
   if(!f.frameSlots[activeFrameSlot])f.frameSlots[activeFrameSlot]={zoom:1,panX:0,panY:0};
   const v=Number(e.target.value);
   f.frameSlots[activeFrameSlot][e.target.dataset.frameOpt]=v/100;
   const label=e.target.nextElementSibling;if(label?.classList.contains('ecs-note'))label.textContent=v+' %';
   draw();saveLocal();return;
 }
 if(e.target.id==='ecs-animation-search'){
  animationSearch=e.target.value;
  const needle=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-anim-card').forEach(button=>{button.hidden=!!needle&&!button.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(needle)});
  all('[data-anim-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-anim-card')].some(card=>!card.hidden)});
  return;
 }
 if(e.target.id==='ecs-ill-search'){
  illustrationSearch=e.target.value;const term=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  all('.ecs-ill-tile').forEach(tile=>{tile.hidden=!!term&&!tile.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(term)});
  all('[data-ill-section]').forEach(section=>section.hidden=![...section.querySelectorAll('.ecs-ill-tile')].some(tile=>!tile.hidden));
  return;
 }
  if(e.target.id==='ecs-photo-search'){
   photoSearch=e.target.value;const v=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   all('.ecs-photo-tile').forEach(card=>{card.hidden=!!v&&!card.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(v)});
   all('[data-photo-section]').forEach(section=>section.hidden=![...section.querySelectorAll('.ecs-photo-tile')].some(card=>!card.hidden));
   return;
 }
 if(e.target.id==='ecs-video-search'){
   const search=e.target.value.toLocaleLowerCase('fr').trim();stockSearch=search;
   all('.ecs-video-card').forEach(card=>card.hidden=!!search&&!card.dataset.search.includes(search));
   all('[data-video-section]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-video-card')].some(card=>!card.hidden)});
   return;
 }
  if(e.target.id==='ecs-audio-search'){const term=e.target.value.trim().toLocaleLowerCase('fr');all('.ecs-soundrow').forEach(row=>row.hidden=!row.dataset.search.includes(term));all('[data-soundsection]').forEach(section=>{section.hidden=![...section.querySelectorAll('.ecs-soundrow')].some(row=>!row.hidden)});return}
 if(e.target.id==='ecs-tts-text'){voiceText=e.target.value;return}
 if(e.target.id==='ecs-element-search'){const term=e.target.value.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');all('.ecs-category').forEach(button=>{button.hidden=!button.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(term)});return}
 const p=e.target.dataset.p;if(p==='text'||p==='values'){const el=S.elements.find(q=>q.id===selected);if(el){el[p]=e.target.value;draw()}}if(p==='color'||p==='bg'||p==='strokeColor'){if(p==='bg')S.bg=e.target.value;else{const el=S.elements.find(q=>q.id===selected);if(el)el[p]=e.target.value}draw();saveLocal()}
});
function coords(ev){const r=canvas.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*1080,y:(ev.clientY-r.top)/r.height*1920}}
canvas.addEventListener('pointerdown',ev=>{
 const pt=coords(ev);if(inkDown(ev,pt))return;
 ev.preventDefault();const p=pt,hit=[...S.elements].reverse().find(e=>S.time>=e.start&&S.time<=e.end&&p.x>=e.x&&p.x<=e.x+e.w&&p.y>=e.y&&p.y<=e.y+e.h);
 if(hit){selected=hit.id;if(hit.kind==='photoFrame')activeFrameSlot=frameSlotNumberAt(hit,p);snapshot();drag={id:hit.id,mode:p.x>hit.x+hit.w-60&&p.y>hit.y+hit.h-60?'resize':'move',px:p.x,py:p.y,x:hit.x,y:hit.y,w:hit.w,h:hit.h};canvas.setPointerCapture(ev.pointerId);setTab('properties')}else{selected=null;drag=null;renderSide()}
 renderTimeline();draw()
});
canvas.addEventListener('pointermove',ev=>{const pt=coords(ev);if(inkMove(ev,pt))return;if(!drag)return;const p=pt,el=S.elements.find(e=>e.id===drag.id);if(!el)return;const dx=p.x-drag.px,dy=p.y-drag.py;
 if(drag.mode==='move'){el.x=Math.max(0,Math.min(1080-el.w,drag.x+dx));el.y=Math.max(0,Math.min(1920-el.h,drag.y+dy))}
 else{el.w=Math.max(50,Math.min(1080-el.x,drag.w+dx));el.h=Math.max(45,Math.min(1920-el.y,drag.h+dy))}
 draw()
});
canvas.addEventListener('pointerup',ev=>{if(inkUp(ev,coords(ev)))return;if(drag){drag=null;renderSide();saveLocal()}});
canvas.addEventListener('pointercancel',ev=>{inkUp(ev,coords(ev),true)});
canvas.addEventListener('dblclick',ev=>{const p=coords(ev),e=[...S.elements].reverse().find(x=>x.kind==='text'&&p.x>=x.x&&p.x<=x.x+x.w&&p.y>=x.y&&p.y<=x.y+x.h);if(e){const t=prompt('Modifier le texte',e.text);if(t!==null){snapshot();e.text=t;selected=e.id;setTab('properties');saveLocal()}}});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&root.querySelector('.ecs-photo-modal')){closePhotoModal();return}if(ev.key==='Escape'&&stockPreview){closeStockPreview();return}if(root.style.display==='none'||!root.contains(document.activeElement)&&!canvas.matches(':hover'))return;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(ev.key==='Delete'||ev.key==='Backspace'){ev.preventDefault();action('delete')}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?redo():undo()}});
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
async function loadVideo(file){pause();if(media.videoUrl)URL.revokeObjectURL(media.videoUrl);media.videoUrl=URL.createObjectURL(file);video.src=media.videoUrl;video.dataset.filename=file.name;try{await new Promise((res,rej)=>{video.onloadedmetadata=res;video.onerror=()=>rej(new Error('Vidéo illisible'))});const oldDuration=S.duration;
 S.trimStart=0;S.duration=Math.min(60,Math.max(1,Math.round(video.duration*10)/10||5));
 S.elements.forEach(x=>{if(Math.abs(x.end-oldDuration)<.11)x.end=S.duration;else x.end=Math.min(S.duration,x.end)});
 seek(0);renderTimeline();renderSide();toast('Vidéo ajoutée : '+file.name);saveLocal()}catch(e){toast('Impossible de lire la vidéo : '+e.message)}}
async function loadImage(file,kind,slotOverride=null){
 const url=URL.createObjectURL(file),im=new Image();im.src=url;
 try{await im.decode()}catch{URL.revokeObjectURL(url);toast('Image non lisible : '+file.name);return false}
 if(kind==='frame'){
  const f=frameSelected();
  if(!f){URL.revokeObjectURL(url);toast('Sélectionne un cadre pour y placer la photo.');return false}
  frameObjectUrls.add(url);
  const slot=slotOverride===null?activeFrameSlot:Math.min(frameSlotCount(f)-1,Math.max(0,slotOverride));
  setFramePhoto(f,slot,im);toast('Photo placée dans la case '+(slot+1)+' : '+file.name);
 }else if(kind==='element'){
  const scale=Math.min(890/im.naturalWidth,1040/im.naturalHeight);
  const w=Math.max(60,Math.round(im.naturalWidth*scale)),h=Math.max(60,Math.round(im.naturalHeight*scale));
  const e=add('image',{x:Math.round((1080-w)/2),y:Math.round((1920-h)/2),w,h,sourceName:file.name});
  images.set(e.id,im);
 }else{
  if(media.imageUrl)URL.revokeObjectURL(media.imageUrl);
  media.imageUrl=url;media.bgImage=im;toast('Image de fond ajoutée : '+file.name);
 }
 draw();saveLocal();if(kind==='element'||kind==='background')saveReelImageAssetsLocal();return true
}
async function loadAudio(file){if(media.audioUrl)URL.revokeObjectURL(media.audioUrl);media.audioUrl=URL.createObjectURL(file);audio.src=media.audioUrl;audio.dataset.filename=file.name;audio.load();renderTimeline();renderSide();toast('Audio ajouté : '+file.name)}
one('#ecs-video-input').addEventListener('change',e=>{if(e.target.files[0])loadVideo(e.target.files[0]);e.target.value=''});
one('#ecs-audio-input').addEventListener('change',e=>{if(e.target.files[0])loadAudio(e.target.files[0]);e.target.value=''});
one('#ecs-image-input').addEventListener('change',async e=>{
 const a=[...e.target.files],kind=importKind,slotStart=activeFrameSlot;
 for(let i=0;i<a.length;i++){
  if(kind==='frame'&&slotStart+i>=frameSlotCount(frameSelected())){toast('Toutes les cases du cadre sont déjà remplies.');break}
  await loadImage(a[i],kind,kind==='frame'?slotStart+i:null);
 }
 e.target.value='';
});
const stage=one('.ecs-stagewrap');
stage.addEventListener('dragover',e=>{e.preventDefault();stage.classList.add('ecs-dragover')});
stage.addEventListener('dragleave',()=>stage.classList.remove('ecs-dragover'));
stage.addEventListener('drop',async e=>{
 e.preventDefault();stage.classList.remove('ecs-dragover');
 const point=coords(e),hit=[...S.elements].reverse().find(q=>q.kind==='photoFrame'&&point.x>=q.x&&point.x<=q.x+q.w&&point.y>=q.y&&point.y<=q.y+q.h);
 if(hit){selected=hit.id;activeFrameSlot=frameSlotNumberAt(hit,point);renderSide();renderTimeline()}
 let slot=activeFrameSlot;
 for(const f of [...e.dataTransfer.files]){
  if(f.type.startsWith('video/'))await loadVideo(f);
  else if(f.type.startsWith('audio/'))await loadAudio(f);
  else if(f.type.startsWith('image/')){
   const frame=frameSelected();
   await loadImage(f,frame?'frame':'background',frame?slot++:null);
  }
 }
});
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),4000)}
function drawPng(){const c=document.createElement('canvas');c.width=1080;c.height=1920;paint(c.getContext('2d'),S.time,false);c.toBlob(b=>b?download(b,'eloah-couverture.png'):toast('Impossible de créer le PNG.'),'image/png')}

/* Les photos utilisées dans le Reel sont conservées dans les projets exportés. */
function encodeReelImage(im,maxSide=1200,quality=.78){
 if(!im?.complete||!im.naturalWidth)return null;
 const scale=Math.min(1,maxSide/Math.max(im.naturalWidth,im.naturalHeight));
 const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*scale));
 c.height=Math.max(1,Math.round(im.naturalHeight*scale));const p=c.getContext('2d');
 if(!p)return null;p.drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/webp',quality);
}
function captureReelImages(maxSide=1350,maxChars=15000000){
 const assets=[];let total=0,skipped=0;
 const ids=new Set(S.elements.filter(e=>e.kind==='image').map(e=>Number(e.id)));
 for(const [id,im] of images.entries()){
  if(!ids.has(Number(id)))continue;
  try{const data=encodeReelImage(im,maxSide,.76);if(!data||total+data.length>maxChars){skipped++;continue}
   assets.push({id:Number(id),data});total+=data.length}
  catch(e){skipped++;console.warn('Photo non embarquée',id,e)}
 }
 let background=null;
 if(media.bgImage)try{background=encodeReelImage(media.bgImage,maxSide,.77);
  if(background&&total+background.length>maxChars){skipped++;background=null}
 }catch{skipped++;background=null}
 return {assets,background,skipped};
}
function saveReelImageAssetsLocal(){
 try{const bundle=captureReelImages(900,3100000);
  localStorage.setItem('eloah_reel_editor_image_assets',JSON.stringify({images:bundle.assets,background:bundle.background}));
  return bundle.skipped===0;
 }catch(e){console.warn('Photos du Reel : stockage local limité',e);return false}
}
async function restoreReelImages(data,idMap=null){
 const list=Array.isArray(data?.images)?data.images:[];let count=0;
 for(const v of list.slice(0,90)){
  const id=idMap?.get(String(v.id))??Number(v.id);
  if(!S.elements.some(e=>e.id===id&&e.kind==='image'))continue;
  if(typeof v.data!=='string'||!/^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/i.test(v.data)||v.data.length>5500000)continue;
  const im=new Image();im.src=v.data;
  try{await im.decode();images.set(id,im);count++}catch(e){console.warn('Photo illisible',id,e)}
 }
 if(typeof data?.background==='string'&&/^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/i.test(data.background)){
  const im=new Image();im.src=data.background;
  try{await im.decode();media.bgImage=im;media.imageUrl=null}catch{}
 }
 if(count||media.bgImage)draw();
 return count;
}

function saveProject(){
 S.name=one('#ecs-name').value||'Mon Reel';saveLocal();
 const frameAssets=captureFrameAssets(1400,18000000);
 const mediaOfBrand=captureBrandAssets(19500000),photos=captureReelImages(1500,16500000);
 const data={version:5,...serial(),frameAssets,brandAssets:mediaOfBrand.items,
   imageAssets:photos.assets,backgroundImage:photos.background,
   otherMediaNotIncluded:!!(media.videoUrl||media.audioUrl)};
 download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'eloah-reel-projet.json');
 toast('Projet exporté avec '+frameAssets.length+' photo(s) de cadre, '+mediaOfBrand.items.length+
   ' ressource(s) de marque et '+photos.assets.length+' photo(s).'+
   (photos.skipped||mediaOfBrand.skipped?' Certaines images volumineuses ne sont pas incluses.':'')+
   ' Les vidéos et musiques restent à conserver séparément.');
}
one('#ecs-project-input').addEventListener('change',async ev=>{
 const f=ev.target.files[0];if(!f)return;
 try{
  const data=JSON.parse(await f.text());if(!Array.isArray(data.elements))throw Error('Format inconnu');
  projectLibrary?.clearCurrent();
  snapshot();framePhotos.clear();brandEmbeddedImages.clear();brandImageCache.clear();images.clear();media.bgImage=null;
  const idMap=new Map(),elements=data.elements.map(e=>{const id=nextId++;idMap.set(String(e.id),id);return {...e,id}});
  apply({name:data.name||'Mon Reel',duration:Math.max(1,Math.min(60,data.duration||5)),trimStart:0,bg:data.bg||'#fffaf1',filter:data.filter||'none',brand:data.brand||'ELOAH',elements});
  const count=await restoreFrameAssets(data.frameAssets,idMap);
  const brandCount=restoreBrandAssets(data.brandAssets,idMap);
  const imageCount=await restoreReelImages({images:data.imageAssets,background:data.backgroundImage},idMap);
  saveLocal();saveFrameMediaLocal();saveBrandMediaLocal();saveReelImageAssetsLocal();draw();
  toast('Projet ouvert avec '+count+' photo(s) de cadre, '+brandCount+' ressource(s) de marque et '+
   imageCount+' photo(s). Les autres vidéos et musiques doivent être réimportées.');
 }catch(e){toast('Projet impossible à ouvrir : '+e.message)}
 ev.target.value='';
});
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
const chartFileInput=document.createElement('input');
chartFileInput.type='file';chartFileInput.id='ecs-chart-file-input';chartFileInput.accept='.csv,.tsv,.txt,text/csv,text/plain';
chartFileInput.className='ecs-fileinput';chartFileInput.setAttribute('aria-label','Choisir un tableau CSV à importer');
root.append(chartFileInput);
chartFileInput.addEventListener('change',async ev=>{
 const file=ev.target.files?.[0];ev.target.value='';if(!file)return;
 const element=S.elements.find(e=>e.id===selected&&e.kind==='chart');if(!element)return toast('Sélectionne un graphique avant d’importer le fichier.');
 if(file.size>1024*1024)return toast('Fichier trop volumineux : limite 1 Mo.');
 try{
  const data=await file.text();
  const parsed=window.ELOAHCharts.parse(data);
  if(!parsed.labels.length)throw Error('Aucune ligne de données valide.');
  snapshot();element.dataText=data;saveLocal();renderSide();draw();
  toast(parsed.labels.length+' catégories et '+parsed.names.length+' séries importées.');
 }catch(e){toast('Import CSV impossible : '+e.message)}
});

try{const saved=JSON.parse(localStorage.getItem('eloah_reel_editor')||'null');if(saved&&Array.isArray(saved.elements)){Object.assign(S,saved);S.trimStart=0;S.time=0;S.playing=false;nextId=Math.max(1,...S.elements.map(e=>+e.id+1||1))}}catch{}
// Entrées de fichiers privées à l'espace Marque. Les médias ne sont pas envoyés sur un serveur.
const brandImageInput=document.createElement('input');
brandImageInput.type='file';brandImageInput.id='ecs-brand-image-input';
brandImageInput.accept='image/png,image/jpeg,image/webp';brandImageInput.multiple=true;
brandImageInput.className='ecs-fileinput';brandImageInput.setAttribute('aria-label','Ajouter des images à ma marque');
root.append(brandImageInput);
brandImageInput.addEventListener('change',async ev=>{
 const list=[...(ev.target.files||[])];ev.target.value='';if(!list.length)return;
 const kitId=brandUploadTargetId||brandKit()?.id,kind=brandUploadCategory;
 let success=0,errors=[];
 for(const file of (kind==='logo'?list.slice(0,1):list.slice(0,12))){
  try{
   const data=await resizeBrandImage(file,kind==='logo');
   const result=kind==='logo'?window.ELOAHBrand.setLogo(kitId,data):
    window.ELOAHBrand.addAsset(kitId,{data,name:file.name,category:kind});
   if(!result)throw Error('Limite de ressources atteinte.');
   if(result.result?.ok===false||result.ok===false)throw Error(result.result?.message||result.message||'Impossible de sauvegarder.');
   success++;
  }catch(e){errors.push(file.name+' : '+e.message)}
 }
 if(activeTab==='brand')renderSide();
 if(success)toast(success+' ressource(s) ajoutée(s) à cette identité.');
 if(errors.length)toast('Import incomplet : '+errors.slice(0,2).join('; '));
});
const brandJsonInput=document.createElement('input');
brandJsonInput.type='file';brandJsonInput.id='ecs-brand-json-input';
brandJsonInput.accept='.json,application/json';brandJsonInput.className='ecs-fileinput';
brandJsonInput.setAttribute('aria-label','Importer un kit de marque ELOAH');
root.append(brandJsonInput);
brandJsonInput.addEventListener('change',async ev=>{
 const file=ev.target.files?.[0];ev.target.value='';if(!file)return;
 if(file.size>9*1024*1024)return toast('Fichier de marque trop volumineux : limite 9 Mo.');
 try{
  const result=window.ELOAHBrand.importKit(await file.text());
  brandKitId=result.kit.id;brandView='overview';brandCreating=false;brandSearch='';
  try{localStorage.setItem('eloah_reel_active_brand',brandKitId)}catch{}
  brandStatus(result,'Identité '+result.kit.name+' importée.');
  if(activeTab==='brand')renderSide();
 }catch(e){toast('Import du kit impossible : '+e.message)}
});
one('#ecs-name').value=S.name;renderSide();renderTimeline();
try{const persisted=JSON.parse(localStorage.getItem('eloah_reel_editor_frame_assets')||'[]');restoreFrameAssets(persisted).catch(e=>console.warn(e))}catch{}
try{const storedBrand=JSON.parse(localStorage.getItem('eloah_reel_editor_brand_assets')||'[]');restoreBrandAssets(storedBrand)}catch{}
try{const savedImages=JSON.parse(localStorage.getItem('eloah_reel_editor_image_assets')||'null');if(savedImages)restoreReelImages(savedImages).catch(e=>console.warn(e))}catch{}
requestAnimationFrame(tick);
})();
