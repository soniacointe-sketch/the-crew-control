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

let images=new Map(),activeTab='models',elementsCategory=null,selected=null,nextId=1,drag=null,history=[],future=[],lastFrame=performance.now(),busy=false,toastTimer=0,importKind='background';
const S={name:'Mon Reel',duration:5,trimStart:0,time:0,playing:false,bg:'#fffaf1',filter:'none',brand:'Power & Glam',elements:[]};
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

function elementsMarkup(){
 if(elementsCategory==='illustrations')return illustrationCatalog();
 if(elementsCategory==='animations')return stickerAnimations();
 if(elementsCategory==='frames')return frameCatalog();
 if(elementsCategory==='grids')return gridCatalog();
 if(elementsCategory==='mockups')return mockupCatalog();
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
function saveLocal(){try{localStorage.setItem('eloah_reel_editor',JSON.stringify(serial()))}catch{}}
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
  if(e.kind==='chart'){
    const values=String(e.values||'35,55,25,45').split(/[;,\s]+/).map(Number).filter(v=>Number.isFinite(v)&&v>0).slice(0,12);
    if(values.length){const palette=[e.color||'#419fc0','#d7654f','#dda84d','#5c9679','#ab72b2','#c37c99'];
      c.save();c.fillStyle='#ffffffdf';c.fillRect(e.x,e.y,e.w,e.h);
      if(e.variant==='pie'){
        const total=values.reduce((a,b)=>a+b,0),r=Math.min(e.w,e.h)*.4,cx=e.x+e.w/2,cy=e.y+e.h/2;let at=-Math.PI/2;
        values.forEach((v,i)=>{const next=at+v/total*Math.PI*2;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r,at,next);c.closePath();c.fillStyle=palette[i%palette.length];c.fill();at=next});
      }else{
        const max=Math.max(...values),gap=e.w*.035,bw=(e.w*.84-gap*(values.length-1))/values.length;
        values.forEach((v,i)=>{const h=v/max*e.h*.75;c.fillStyle=palette[i%palette.length];c.fillRect(e.x+e.w*.08+i*(bw+gap),e.y+e.h*.87-h,bw,h)});
      }c.restore();
    }
  }
  if(e.kind==='text')drawText(c,e);
  if(e.kind==='image'){const im=images.get(e.id);if(im?.complete)try{c.drawImage(im,e.x,e.y,e.w,e.h)}catch{}}
  if(e.kind==='vector'&&window.ELOAHIllustrations)window.ELOAHIllustrations.render(c,e);
  if(e.kind==='sticker'&&window.ELOAHAnimations)window.ELOAHAnimations.render(c,e);
  if(e.kind==='photoFrame'&&e.isMockup&&window.ELOAHMockups)window.ELOAHMockups.draw(c,e,framePhotos,mark&&selected===e.id?activeFrameSlot:-1,video);
  else if(e.kind==='photoFrame'&&window.ELOAHFrames)window.ELOAHFrames.draw(c,e,framePhotos,mark&&selected===e.id?activeFrameSlot:-1);
  c.restore();
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
 const clip=(e,kind)=>'<button class="ecs-clip '+kind+(selected===e.id?' selected':'')+'" data-select="'+e.id+'" style="left:'+(e.start*70)+'px;width:'+Math.max(16,(e.end-e.start)*70)+'px">'+xss(e.kind==='text'?e.text:e.kind==='photoFrame'?(e.isGrid?'Grille · ':e.isMockup?'Maquette · ':'Cadre · ')+((window.ELOAHFrames?.byId.get(e.variant)?.label||window.ELOAHFrames?.byId.get(e.variant)?.name)||'Photos'):(e.kind==='image'?'Image':e.kind))+'</button>';
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

function renderSide(){
 all('.ecs-railbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeTab));
 const titles={models:'Modèles',elements:'Éléments',text:'Texte',brand:'Marque',import:'Importer',tools:'Outils de montage',projects:'Mes projets',photos:'Photos',audio:'Audio',videos:'Vidéos',properties:'Modifier l’élément'};
 one('.ecs-sidehead').textContent=titles[activeTab]||'Modifier';const box=one('.ecs-sidebody');let html='';
 if(activeTab==='models')html='<p class="ecs-note">Choisis un point de départ. Tu pourras modifier tous les éléments.</p><div class="ecs-cardgrid">'+Object.entries(themes).map(([key,t],i)=>'<button class="ecs-model m'+(i+1)+'" data-theme="'+key+'">'+xss(t.title)+'</button>').join('')+'</div><p class="ecs-note">Modèles originaux ELOAH, non issus de la bibliothèque Canva.</p>';
 if(activeTab==='elements')html=elementsMarkup();
 if(activeTab==='text')html='<p class="ecs-note">Clique pour ajouter un texte, puis déplace-le directement sur le Reel.</p><div class="ecs-list"><button class="ecs-itembtn" data-action="heading"><strong style="font-size:23px">Ajouter un titre</strong></button><button class="ecs-itembtn" data-action="subtitle">Ajouter un sous-titre</button><button class="ecs-itembtn" data-action="addText">Ajouter un texte simple</button></div>';
 if(activeTab==='brand')html='<label class="ecs-sidelabel">Univers</label><select data-setting="brand">'+['Power & Glam','The Crew Orchies','Sonia Velka','ELOAH','Le Lion Blanc','Autre'].map(x=>'<option '+(x===S.brand?'selected':'')+'>'+x+'</option>').join('')+'</select>'+color('Couleur du fond','bg',S.bg)+'<p class="ecs-note">Les modèles apportent des palettes adaptées à tes univers.</p>'+btn('brandLabel','Ajouter la signature');
 if(activeTab==='import')html='<div class="ecs-upload"><strong>Importe tes fichiers</strong><p class="ecs-note">Glisse tes fichiers directement sur la page ou choisis ci-dessous.</p>'+btn('importVideo','Vidéo',true)+btn('importImage','Photo')+btn('importAudio','Audio')+'</div><p class="ecs-note">Fichiers traités dans le navigateur. Les photos peuvent être un fond ou un élément mobile.</p>'+btn('addImage','Photo comme élément');
 if(activeTab==='tools')html=range('Durée du Reel (secondes)','duration',1,60,.5,S.duration)+color('Fond','bg',S.bg)+'<label class="ecs-sidelabel">Effet de couleur</label><select data-setting="filter">'+[['none','Naturel'],['cinema','Cinéma'],['gold','Lumière dorée'],['vivid','Couleurs intenses'],['mono','Noir et blanc']].map(([k,v])=>'<option value="'+k+'" '+(S.filter===k?'selected':'')+'>'+v+'</option>').join('')+'</select>'+btn('png','Exporter une image PNG')+'<p class="ecs-note">Les filtres modifient la vidéo et les photos de fond. Le son est conservé selon les capacités du navigateur à l’export.</p>';
 if(activeTab==='projects')html='<p class="ecs-note">Sauvegarde ton projet en JSON pour retrouver les textes, positions et couleurs.</p>'+btn('save','Sauvegarder projet',true)+btn('load','Ouvrir un projet')+btn('reset','Nouveau projet')+'<p class="ecs-note">Les vidéos, photos et musiques ne sont pas intégrées au fichier JSON : conserve-les séparément et réimporte-les après ouverture.</p>';
 if(activeTab==='photos')html=photoCatalog();
 if(activeTab==='audio')html=renderAudio();
 if(activeTab==='videos')html=videoCatalog();
 if(activeTab==='properties'){
  const e=S.elements.find(q=>q.id===selected);
  if(!e)html='<div class="ecs-empty">Sélectionne un texte, une forme ou une image sur le plan de travail.</div>';
  else{
   html='<p class="ecs-note">Fais glisser cet élément sur le Reel. Pour le redimensionner, tire le petit carré dans son angle inférieur droit.</p>';
   if(e.kind==='text')html+='<label class="ecs-sidelabel">Texte</label><textarea rows="4" data-p="text">'+xss(e.text)+'</textarea>'+range('Taille des caractères','font',14,250,1,e.font);
   if(e.kind==='photoFrame')html+=frameProperties(e);
   if(e.kind==='chart')html+='<label class="ecs-sidelabel">Valeurs séparées par des virgules</label><input data-p="values" value="'+xss(e.values||'35,55,25,45')+'">';
   if(e.kind==='sticker')html+='<p class="ecs-note">Sticker animé : '+xss(window.ELOAHAnimations?.byId.get(e.variant)?.name||'Animation ELOAH')+'</p><label class="ecs-sidelabel">Mouvement</label><select data-p="motion">'+Object.entries(window.ELOAHAnimations?.motionNames||{}).map(([v,n])=>'<option value="'+v+'" '+((e.motion||'pulse')===v?'selected':'')+'>'+n+'</option>').join('')+'</select>'+range('Vitesse (0,2× à 4×)','speed',.2,4,.1,e.speed||1);
   else html+='<label class="ecs-sidelabel">Animation</label><select data-p="animation">'+[['none','Aucune'],['fade','Apparition douce'],['pop','Zoom dynamique'],['slide','Entrée latérale'],['pulse','Pulsation'],['float','Flottement'],['bounce','Rebond'],['wobble','Oscillation'],['swing','Balancement'],['rotate','Rotation'],['twinkle','Clignotement'],['shake','Vibration']].map(([v,n])=>'<option value="'+v+'" '+((e.animation||'none')===v?'selected':'')+'>'+n+'</option>').join('')+'</select>';

   if(e.kind!=='image')html+=color('Couleur','color',e.color);
   html+='<div class="ecs-rows"><div>'+range('Position X','x',0,1080,1,Math.round(e.x))+'</div><div>'+range('Position Y','y',0,1920,1,Math.round(e.y))+'</div></div><div class="ecs-rows"><div>'+range('Largeur','w',20,1080,1,Math.round(e.w))+'</div><div>'+range('Hauteur','h',20,1920,1,Math.round(e.h))+'</div></div><div class="ecs-rows"><div>'+range('Début (s)','start',0,S.duration,.1,e.start)+'</div><div>'+range('Fin (s)','end',0,S.duration,.1,e.end)+'</div></div>'+btn('duplicate','Dupliquer')+btn('delete','Supprimer');
  }
 }
 box.innerHTML=html;
 if(activeTab==='videos')requestAnimationFrame(scheduleStockThumbnails);
}
function setTab(tab){if(tab==='elements')elementsCategory=null;if(tab==='audio')audioView='home';if(tab==='videos'){stockView='home';stockSearch=''}if(tab==='photos'){photoView='home';photoSearch=''}activeTab=tab;renderSide();if(tab==='audio'&&!publicMusic.loaded&&!publicMusic.loading&&!publicMusic.error)loadPublicMusic();if(window.innerWidth<691)one('.ecs-sidebar').classList.add('ecs-open')}
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
 if(['heading','subtitle','addText','brandLabel'].includes(name)){add('text',name==='heading'?{text:'MON GRAND TITRE',font:90,y:770,h:310,color:'#2e2e2e'}:name==='subtitle'?{text:'Ton sous-titre ici',font:49,y:1100,h:160,color:'#303030'}:name==='brandLabel'?{text:S.brand.toUpperCase(),font:42,y:1700,h:140,color:'#c69b46'}:{text:'Écris ton texte',font:70,y:970,h:180});return}
 if(name==='duplicate'){let e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne un élément à dupliquer.');return}const {id:originalId,...copy}=e;const cloned=add(e.kind,{...copy,x:Math.min(Math.max(0,1080-e.w),e.x+36),y:Math.min(Math.max(0,1920-e.h),e.y+36)});if(e.kind==='image'&&images.has(e.id))images.set(cloned.id,images.get(e.id));if(e.kind==='photoFrame'){for(let i=0;i<frameSlotCount(e);i++){const src=framePhotos.get(e.id+':'+i);if(src)framePhotos.set(cloned.id+':'+i,src)}saveFrameMediaLocal()}return}
 if(name==='delete'){let e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne un élément à supprimer.');return}snapshot();S.elements=S.elements.filter(x=>x.id!==selected);if(e.kind==='photoFrame'){for(let i=0;i<frameSlotCount(e);i++)framePhotos.delete(e.id+':'+i);saveFrameMediaLocal()}selected=null;setTab('elements');renderTimeline();saveLocal();return}
 if(name==='forward'||name==='backward'){let i=S.elements.findIndex(x=>x.id===selected);if(i<0)return;snapshot();let e=S.elements.splice(i,1)[0];S.elements.splice(name==='forward'?S.elements.length:0,0,e);saveLocal();return}
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
 if(name==='save'){saveProject();return}
 if(name==='load'){one('#ecs-project-input').click();return}
 if(name==='reset'){if(!confirm('Créer un nouveau projet ? Les modifications non exportées seront perdues.'))return;snapshot();S.elements=[];S.bg='#fffaf1';S.duration=5;S.trimStart=0;S.time=0;S.filter='none';selected=null;pause();for(const url of [media.videoUrl,media.audioUrl,media.imageUrl])if(url)URL.revokeObjectURL(url);media.videoUrl=null;media.audioUrl=null;media.imageUrl=null;media.bgImage=null;video.removeAttribute('src');audio.removeAttribute('src');images.clear();framePhotos.clear();for(const url of frameObjectUrls)URL.revokeObjectURL(url);frameObjectUrls.clear();try{localStorage.removeItem('eloah_reel_editor_frame_assets')}catch{};setTab('models');renderTimeline();saveLocal();return}
 if(name==='export'){exportVideo();return}
}
root.addEventListener('click',ev=>{
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
 const cat=ev.target.closest('[data-cat]');if(cat){elementsCategory=cat.dataset.cat==='overview'?null:cat.dataset.cat;illustrationView='home';illustrationSearch='';animationView='home';animationSearch='';frameView='home';frameSearch='';gridView='all';gridSearch='';mockupView='home';mockupSearch='';activeTab='elements';renderSide();return}
 const animButton=ev.target.closest('[data-animation]');if(animButton){const e=S.elements.find(x=>x.id===selected);if(!e){toast('Sélectionne d’abord un élément sur le Reel.');return}snapshot();e.animation=animButton.dataset.animation;saveLocal();toast('Animation appliquée : '+animButton.textContent);return}
 const recent=ev.target.closest('[data-recent]');if(recent){const e=S.elements.find(x=>x.id===Number(recent.dataset.recent));if(e){const {id,...copy}=e;const clone=add(e.kind,{...copy,x:Math.min(1080-e.w,e.x+38),y:Math.min(1920-e.h,e.y+38)});if(e.kind==='image'&&images.has(e.id))images.set(clone.id,images.get(e.id));if(e.kind==='photoFrame'){for(let i=0;i<frameSlotCount(e);i++){const src=framePhotos.get(e.id+':'+i);if(src)framePhotos.set(clone.id+':'+i,src)}saveFrameMediaLocal()}toast('Élément dupliqué sur la page.')}return}
 const tb=ev.target.closest('[data-tab]');if(tb&&root.contains(tb)){setTab(tb.dataset.tab);return}
 const themed=ev.target.closest('[data-theme]');if(themed){snapshot();const t=themes[themed.dataset.theme];S.bg=t.bg;S.brand=t.brand;S.elements=[{id:nextId++,kind:'text',text:t.title,x:90,y:720,w:900,h:450,color:t.color,font:92,start:0,end:S.duration}];selected=null;renderTimeline();renderSide();saveLocal();return}
 const sel=ev.target.closest('[data-select]');if(sel){selected=Number(sel.dataset.select);setTab('properties');renderTimeline();return}
 const b=ev.target.closest('[data-action]');if(b)action(b.dataset.action)
});
one('#ecs-name').addEventListener('change',e=>{S.name=e.target.value.slice(0,90)||'Mon Reel';saveLocal()});
one('.ecs-sidebody').addEventListener('change',e=>{
 if(e.target.hasAttribute('data-frame-slot')){activeFrameSlot=Math.max(0,Number(e.target.value)||0);renderSide();draw();return}
 if(e.target.id==='ecs-tts-speed'){voiceSpeed=Number(e.target.value);return}
 if(e.target.id==='ecs-tts-voice'){const voices=window.speechSynthesis?.getVoices().filter(v=>v.lang.toLowerCase().startsWith('fr'))||[];voiceSelection=voices[Number(e.target.value)]?.name||'';return}
 const p=e.target.dataset.p,setting=e.target.dataset.setting;
 if(p){const target=p==='bg'||p==='duration'||p==='trimStart'?S:S.elements.find(q=>q.id===selected);if(!target)return;snapshot();let val=['text','color','bg','values','animation','motion'].includes(p)?e.target.value:Number(e.target.value);if(!Number.isFinite(val)&&typeof val==='number')return;if(p==='duration'){val=Math.max(1,Math.min(media.videoUrl?Math.max(1,(video.duration||60)-S.trimStart):60,val));S.duration=val;S.elements.forEach(x=>x.end=Math.min(val,x.end));seek(S.time)}else if(p==='trimStart'){S.trimStart=Math.max(0,Math.min(val,Math.max(0,(video.duration||0)-1)));S.duration=Math.min(S.duration,Math.max(1,(video.duration||S.duration)-S.trimStart));S.elements.forEach(x=>x.end=Math.min(S.duration,x.end));seek(S.time)}else if(p==='start')target.start=Math.max(0,Math.min(val,target.end-.1));else if(p==='end')target.end=Math.min(S.duration,Math.max(val,target.start+.1));else target[p]=val;if(p==='duration'||p==='trimStart'||p==='start'||p==='end')renderTimeline();saveLocal();draw();return}
 if(setting){snapshot();S[setting]=e.target.value;saveLocal();draw()}
});
one('.ecs-sidebody').addEventListener('input',e=>{
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
 const p=e.target.dataset.p;if(p==='text'||p==='values'){const el=S.elements.find(q=>q.id===selected);if(el){el[p]=e.target.value;draw()}}if(p==='color'||p==='bg'){if(p==='bg')S.bg=e.target.value;else{const el=S.elements.find(q=>q.id===selected);if(el)el.color=e.target.value}draw()}
});
function coords(ev){const r=canvas.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*1080,y:(ev.clientY-r.top)/r.height*1920}}
canvas.addEventListener('pointerdown',ev=>{
 ev.preventDefault();const p=coords(ev),hit=[...S.elements].reverse().find(e=>S.time>=e.start&&S.time<=e.end&&p.x>=e.x&&p.x<=e.x+e.w&&p.y>=e.y&&p.y<=e.y+e.h);
 if(hit){selected=hit.id;if(hit.kind==='photoFrame')activeFrameSlot=frameSlotNumberAt(hit,p);snapshot();drag={id:hit.id,mode:p.x>hit.x+hit.w-60&&p.y>hit.y+hit.h-60?'resize':'move',px:p.x,py:p.y,x:hit.x,y:hit.y,w:hit.w,h:hit.h};canvas.setPointerCapture(ev.pointerId);setTab('properties')}else{selected=null;drag=null;renderSide()}
 renderTimeline();draw()
});
canvas.addEventListener('pointermove',ev=>{if(!drag)return;const p=coords(ev),el=S.elements.find(e=>e.id===drag.id);if(!el)return;const dx=p.x-drag.px,dy=p.y-drag.py;
 if(drag.mode==='move'){el.x=Math.max(0,Math.min(1080-el.w,drag.x+dx));el.y=Math.max(0,Math.min(1920-el.h,drag.y+dy))}
 else{el.w=Math.max(50,Math.min(1080-el.x,drag.w+dx));el.h=Math.max(45,Math.min(1920-el.y,drag.h+dy))}
 draw()
});
canvas.addEventListener('pointerup',()=>{if(drag){drag=null;renderSide();saveLocal()}});
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
  const e=add('image',{x:140,y:490,w:790,h:790,sourceName:file.name});images.set(e.id,im);
 }else{
  if(media.imageUrl)URL.revokeObjectURL(media.imageUrl);
  media.imageUrl=url;media.bgImage=im;toast('Image de fond ajoutée : '+file.name);
 }
 draw();saveLocal();return true
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
function saveProject(){
 S.name=one('#ecs-name').value||'Mon Reel';saveLocal();
 const frameAssets=captureFrameAssets(1400,18000000);
 const data={version:3,...serial(),frameAssets,otherMediaNotIncluded:!!(media.videoUrl||media.audioUrl||images.size)};
 download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'eloah-reel-projet.json');
 toast('Projet enregistré avec '+frameAssets.length+' photo(s) de cadre. Les vidéos et musiques restent à conserver séparément.');
}
one('#ecs-project-input').addEventListener('change',async ev=>{
 const f=ev.target.files[0];if(!f)return;
 try{
  const data=JSON.parse(await f.text());if(!Array.isArray(data.elements))throw Error('Format inconnu');
  snapshot();framePhotos.clear();
  const idMap=new Map(),elements=data.elements.map(e=>{const id=nextId++;idMap.set(String(e.id),id);return {...e,id}});
  apply({name:data.name||'Mon Reel',duration:Math.max(1,Math.min(60,data.duration||5)),trimStart:0,bg:data.bg||'#fffaf1',filter:data.filter||'none',brand:data.brand||'ELOAH',elements});
  const count=await restoreFrameAssets(data.frameAssets,idMap);
  saveLocal();saveFrameMediaLocal();
  toast('Projet ouvert avec '+count+' photo(s) de cadre. Réimporte les autres vidéos et musiques si nécessaire.');
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
try{const saved=JSON.parse(localStorage.getItem('eloah_reel_editor')||'null');if(saved&&Array.isArray(saved.elements)){Object.assign(S,saved);S.trimStart=0;S.time=0;S.playing=false;nextId=Math.max(1,...S.elements.map(e=>+e.id+1||1))}}catch{}
one('#ecs-name').value=S.name;renderSide();renderTimeline();
try{const persisted=JSON.parse(localStorage.getItem('eloah_reel_editor_frame_assets')||'[]');restoreFrameAssets(persisted).catch(e=>console.warn(e))}catch{}
requestAnimationFrame(tick);
})();
