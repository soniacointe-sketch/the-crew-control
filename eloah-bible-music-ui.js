/* ELOAH · Bible en musique
 * Lecture par verset avec SpeechSynthesis et accompagnement WebAudio NUMERA.
 * Aucun compte privé n'est lu ; les requêtes externes concernent uniquement le chapitre demandé.
 * Les exports WAV/MIDI sont instrumentaux, pas des fichiers de voix off.
 */
(function(){
"use strict";
const B=window.ELOAH_BIBLE_MUSIC,N=window.ELOAH_NUMERA_ENGINE,A=window.ELOAH_NUMERA_AUDIO;
if(!B||!N||!A)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const asTime=sec=>{const n=Math.max(0,Math.round(sec));return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")};
let chapterDoc=null,doc=null,greekDoc=null,musicScore=null,playing=false,paused=false,voiceMode=false,verseIndex=0,epoch=0,
currentVoice=null,busy=false,raf=0,completed=0;
const canvas=$("visual"),canvasCtx=canvas.getContext("2d"),defaultVerse=6;
const say=t=>{$("status").textContent=t},exportSay=t=>{$("exportStatus").textContent=t};
function availableVoices(){
 if(!("speechSynthesis" in window))return[];
 return window.speechSynthesis.getVoices().filter(v=>String(v.lang).toLowerCase().startsWith("fr"));
}
function voices(){
 const list=availableVoices(),prior=$("voice").value;
 $("voice").innerHTML='<option value="">Voix française automatique</option>'+list.map((v,i)=>'<option value="'+i+'">'+esc(v.name+" · "+v.lang)+'</option>').join("");
 $("voice").value=prior&&list[Number(prior)]?prior:"";
}
const engineOptions=()=>({mode:$("style").value,scale:$("scale").value,bpm:Number($("bpm").value),
 greekVerses:$("musicLanguage").value==="greek"&&greekDoc?Object.fromEntries(greekDoc.verses.map(v=>[v.number,v.text])):null,
 root:48,volume:.44,drums:$("drums").checked,pad:$("pad").checked,variation:.3,barsPerVerse:1});
function stop(opts={}){
 epoch++;
 playing=false;paused=false;voiceMode=false;
 if("speechSynthesis" in window)window.speechSynthesis.cancel();
 A.stop();
 $("progressBar").style.width="0%";
 $("readAll").textContent="▶ Lire avec la musique";
 $("pause").textContent="Ⅱ Pause";
 if(raf)cancelAnimationFrame(raf);
 raf=0;
 if(!opts.silent)say("Lecture arrêtée. Le passage est conservé.");
 highlight(-1);
 draw(0);
}
function resetBook(){
 const name=$("book").value,b=B.books.find(x=>x.code===name)||B.books[0];
 $("chapter").innerHTML=Array.from({length:b.chapters},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join("");
}
function applySelection(){
 if(!chapterDoc)return;
 const first=Math.max(1,Number($("startVerse").value)||1);
 const endInput=$("endVerse").value.trim();
 const last=endInput===""?null:Number(endInput);
 try{
  doc=B.selectRange(chapterDoc,first,last);
  musicScore=B.deriveMusic(doc,engineOptions());
  renderDoc();
  say((doc.complete?"Passage chargé":"Extrait partiel chargé")+" : "+doc.reference+" · "+doc.verses.length+" verset(s). "+(doc.warning||"Clique sur Lire."));
 }catch(e){say("Plage impossible : "+e.message)}
}
async function load(){
 if(busy)return;
 stop({silent:true});
 busy=true;$("loadChapter").disabled=true;say("Chargement du chapitre depuis la Bible Louis Segond 1910…");
 const book=$("book").value,chapter=Number($("chapter").value),stamp=epoch;
 try{
  chapterDoc=await B.fetchChapter(book,chapter);
  if(epoch!==stamp)return;
  applySelection();
 }catch(e){say("Lecture en ligne indisponible : "+e.message+" Tu peux coller un passage dans la zone de texte.");}
 finally{busy=false;$("loadChapter").disabled=false}
}
function loadManual(){
 stop({silent:true});
 greekDoc=null;
 try{
  chapterDoc=B.fromManual($("manualText").value,{reference:"Texte biblique collé"});
  doc=chapterDoc;musicScore=B.deriveMusic(doc,engineOptions());renderDoc();
  say("Texte personnel prêt : "+doc.verses.length+" lignes · création musicale générée sans requête externe.");
 }catch(e){say("Impossible de composer le passage : "+e.message)}
}
function rebuildMusic(){
 if(!doc)return;
 stop({silent:true});
 try{musicScore=B.deriveMusic(doc,engineOptions());renderDoc();say("Accompagnement musical recalculé. Lance la lecture pour l'entendre.");}
 catch(e){say("Génération impossible : "+e.message)}
}
function renderDoc(){
 if(!doc||!musicScore)return;
 $("readingTitle").textContent=doc.reference+" · Lecture en musique";
 $("coverTitle").textContent=doc.reference.replace(/:.*/,"");
 $("coverSub").textContent=doc.version==="lsg"?"LOUIS SEGOND 1910":"TEXTE FOURNI";
 $("countVerses").textContent=doc.verses.length;
 $("countNotes").textContent=musicScore.stats.notes;
 $("duration").textContent=asTime(musicScore.durationSeconds);
 $("copyright").textContent=(doc.credit||"Louis Segond 1910")+" · "+(doc.complete?"Chapitre complet":"Extraits / plage chargée")+". "+(doc.warning||"");
 $("sourceCredit").textContent=(doc.credit||"Source non précisée")+(doc.provider?" · "+doc.provider:"");
 $("verses").innerHTML=doc.verses.map((v,i)=>
  '<button type="button" class="verse" data-index="'+i+'" aria-pressed="false" aria-label="Lire à partir du verset '+v.number+'"><strong>'+v.number+'</strong>'+esc(v.text)+'</button>'
 ).join("");
 $("readProgress").textContent="0 / "+doc.verses.length;
 $("currentVerse").textContent="Passage prêt · clique sur un verset pour commencer à cet endroit";
 highlight(-1);draw(0);
}
function highlight(index){
 if(!doc)return;
 const v=doc.verses[index];
 $("verses").querySelectorAll("[data-index]").forEach(el=>{
  const yes=Number(el.dataset.index)===index;el.classList.toggle("playing",yes);el.setAttribute("aria-pressed",String(yes));
 });
 if(v){
  $("currentVerse").textContent=doc.reference.replace(/:.*/,"")+" · verset "+v.number;
  $("readProgress").textContent=(index+1)+" / "+doc.verses.length;
  $("progressBar").style.width=(100*(index+1)/doc.verses.length)+"%";
  const btn=$("verses").querySelector('[data-index="'+index+'"]');
  if(btn){btn.scrollIntoView({block:"nearest",behavior:"smooth"});}
 }
}
function singleVerseScore(index){
 const v=doc.verses[index];
 const pass={...doc,verses:[v]};
 return B.deriveMusic(pass,engineOptions());
}
function selectedVoice(){
 const list=availableVoices(),value=$("voice").value;
 return value===""?list[0]||null:list[Number(value)]||null;
}
function beginVoiceVerse(session){
 if(!playing||paused||session!==epoch||!doc)return;
 if(verseIndex>=doc.verses.length){finish();return}
 const v=doc.verses[verseIndex];highlight(verseIndex);
 if($("withMusic").checked){
  try{A.start(singleVerseScore(verseIndex),{loop:true}).catch(e=>say("Musique indisponible : "+e.message+" ; la lecture vocale continue."));}
  catch(e){say("Accompagnement musical indisponible : "+e.message)}
 }else A.stop();
 const utterance=new SpeechSynthesisUtterance(v.text);
 utterance.lang="fr-FR";utterance.rate=Number($("readSpeed").value)/100;utterance.volume=.95;
 const voice=selectedVoice();if(voice)utterance.voice=voice;
 utterance.onend=()=>{if(!playing||epoch!==session)return;verseIndex++;completed++;beginVoiceVerse(session);};
 utterance.onerror=e=>{if(!playing||epoch!==session)return;
  if(e.error==="canceled"||e.error==="interrupted")return;
  say("Erreur de voix : "+e.error+". Essaie une autre voix française.");
  // Skip the problematic verse rather than silently claiming successful narration.
  stop({silent:true});
 };
 window.speechSynthesis.speak(utterance);
}
function finish(){
 playing=false;voiceMode=false;paused=false;A.stop();
 $("readAll").textContent="▶ Recommencer la lecture";
 $("pause").textContent="Ⅱ Pause";
 $("progressBar").style.width="100%";
 say("Lecture terminée : "+completed+" verset(s) lus. Le texte et la partition restent disponibles.");
}
function musicOnly(index,session){
 const pass=index>0?{...doc,verses:doc.verses.slice(index)}:doc;
 const score=index>0?B.deriveMusic(pass,engineOptions()):musicScore;
 A.start(score,{loop:false,onEnd:()=>{if(epoch===session&&playing)finish();}})
  .then(()=>{if(epoch!==session)return;voiceMode=false;
   say("Lecture instrumentale en cours · "+asTime(score.durationSeconds)+" de musique composée à partir des versets.");
  }).catch(e=>{say("Audio indisponible : "+e.message);stop({silent:true})});
}
function start(index=0){
 if(!doc||!doc.verses.length){say("Charge d'abord un passage biblique.");return}
 if(!$("withVoice").checked&&!$("withMusic").checked){say("Active la voix, la musique, ou les deux.");return}
 stop({silent:true});playing=true;paused=false;completed=0;verseIndex=index;const session=epoch;
 $("readAll").textContent="♪ Recommencer la lecture";
 if($("withVoice").checked){
  if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){
   say("Aucune voix synthétique disponible. Passe en musique instrumentale.");
   if($("withMusic").checked){musicOnly(index,session);return}
   stop({silent:true});return;
  }
  voiceMode=true;
  beginVoiceVerse(session);
  say("Lecture vocale en cours : "+doc.reference+". Chaque verset fait naître son propre accompagnement musical.");
 }else musicOnly(index,session);
 animate();
}
function pause(){
 if(!playing){say("Aucune lecture à mettre en pause.");return}
 if(paused){
  paused=false;$("pause").textContent="Ⅱ Pause";
  if(voiceMode){
   if("speechSynthesis" in window)window.speechSynthesis.resume();
   if($("withMusic").checked){
    A.start(singleVerseScore(verseIndex),{loop:true}).catch(e=>say("Musique indisponible à la reprise : "+e.message));
   }
  }else{
   // Music-only playback cannot resume sample-accurately with this WebAudio engine.
   musicOnly(verseIndex,epoch);
   say("Reprise du mouvement instrumental depuis le début du verset.");
  }
  return;
 }
 paused=true;$("pause").textContent="▶ Reprendre";
 if(voiceMode&&"speechSynthesis" in window)window.speechSynthesis.pause();
 A.stop();say("Lecture en pause. Appuie sur Reprendre.");
}
function animate(){
 if(raf)cancelAnimationFrame(raf);
 function frame(){
  const progress=A.isPlaying()?A.getProgress():0;
  if(playing&&!voiceMode&&!paused&&doc?.verses?.length){
   const base=verseIndex;
   const visible=Math.min(doc.verses.length-1,base+Math.floor(progress*(doc.verses.length-base)));
   if(visible!==completed){completed=visible;highlight(visible);}
  }
  draw(progress);
  if(playing)raf=requestAnimationFrame(frame);else raf=0;
 }
 raf=requestAnimationFrame(frame);
}
function draw(position){
 if(!canvasCtx)return;
 const rect=canvas.getBoundingClientRect(),W=Math.max(270,rect.width),H=Math.max(200,rect.height),dpr=Math.min(2,window.devicePixelRatio||1);
 if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr)}
 const c=canvasCtx;c.setTransform(dpr,0,0,dpr,0,0);
 const grd=c.createRadialGradient(W*.5,H*.45,0,W*.5,H*.45,W*.65);
 grd.addColorStop(0,"#532949");grd.addColorStop(.55,"#21132b");grd.addColorStop(1,"#0b0a14");
 c.fillStyle=grd;c.fillRect(0,0,W,H);
 const n=Math.max(1,Math.min(96,doc?.verses?.length||12));
 const r=Math.min(W*.27,H*.33),Cx=W*.5,Cy=H*.46,selected=Math.min(n-1,Math.floor(n*position));
 for(let i=0;i<n;i++){
  const angle=Math.PI*2*i/n-Math.PI/2;
  const mag=.55+((i*37+11)%17)/40,rad=r*(1+mag*.35);
  const x=Cx+Math.cos(angle)*rad,y=Cy+Math.sin(angle)*rad;
  c.beginPath();c.arc(x,y,i===selected&&playing?4.6:2.3,0,Math.PI*2);
  c.fillStyle=i===selected&&playing?"#fbe5bb":i%3?"#b971b5":"#f0c4a0";c.fill();
  if(i>0){
   const pA=Math.PI*2*(i-1)/n-Math.PI/2;
   c.strokeStyle="rgba(223,166,202,.20)";c.beginPath();
   c.moveTo(Cx+Math.cos(pA)*rad,Cy+Math.sin(pA)*rad);c.lineTo(x,y);c.stroke();
  }
 }
 for(let k=0;k<4;k++){c.beginPath();c.arc(Cx,Cy,r*(.58+k*.2),0,Math.PI*2);c.strokeStyle="rgba(236,197,215,.14)";c.stroke();}
 c.textAlign="center";c.textBaseline="middle";c.fillStyle="#f5d6a4";c.font=Math.round(Math.min(40,r*.33))+"px Georgia";
 c.fillText("Α Ω",Cx,Cy-10);c.font="11px system-ui";c.fillStyle="#dfbcd2";c.fillText("VOIX · LETTRES · MUSIQUE",Cx,Cy+21);
}
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3500);
}
function filename(ext){
 const ref=(doc?.reference||"passage").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9-]/g,"-").slice(0,40);
 return "ELOAH-BIBLE-MUSIC-"+ref+"."+ext;
}
async function exportWav(){
 if(!musicScore||busy)return;
 if(musicScore.durationSeconds>155){exportSay("Pour éviter un WAV trop volumineux sur mobile, choisis une plage plus courte (moins de 2 min 35 de musique). Le MIDI reste exportable.");return}
 busy=true;$("wav").disabled=true;
 exportSay("Fabrication du WAV instrumental dans ton navigateur… La voix de lecture n'y est pas enregistrée.");
 try{const wav=await A.renderWAV(musicScore);download(wav,filename("wav"));exportSay("WAV créé · "+(wav.size/1048576).toFixed(1)+" Mo. Il contient uniquement la musique générée.");}
 catch(e){exportSay("WAV impossible : "+e.message)}
 finally{busy=false;$("wav").disabled=false}
}
function exportMidi(){if(!musicScore)return;
 try{download(A.renderMIDI(musicScore),filename("mid"));exportSay("MIDI exporté : notes, accords et rythmes générés à partir des versets.");}
 catch(e){exportSay("Erreur MIDI : "+e.message)}
}
function exportJson(){
 if(!doc||!musicScore)return;
 const project={format:"eloah-bible-music-1",savedAt:new Date().toISOString(),reference:doc.reference,
   provider:doc.provider,credit:doc.credit,version:doc.version,verses:doc.verses,
   musicOptions:engineOptions(),musicScore,disclaimer:"Le score instrumental ne reproduit aucune mélodie biblique ancienne. La voix de synthèse du navigateur n'est pas incluse."};
 download(new Blob([JSON.stringify(project,null,2)],{type:"application/json;charset=utf-8"}),filename("json"));
 exportSay("Projet exporté : texte, référence et partition instrumentale.");
}
function exportPng(){
 if(!canvasCtx||!musicScore)return;
 draw(0);
 const art=document.createElement("canvas");art.width=1280;art.height=720;
 const c=art.getContext("2d");
 if(!c)return;
 c.fillStyle="#140c1f";c.fillRect(0,0,1280,720);
 c.drawImage(canvas,0,0,1280,720);
 c.fillStyle="rgba(16,9,25,.85)";c.fillRect(0,530,1280,190);
 c.fillStyle="#f7d9a7";c.font="bold 23px system-ui";c.fillText("ELOAH NUMERA · BIBLE EN MUSIQUE",43,59);
 c.font="54px Georgia";c.fillText(doc.reference.slice(0,34),44,626);
 c.fillStyle="#ebcade";c.font="17px system-ui";c.fillText(doc.verses.length+" versets · "+musicScore.stats.notes+" notes · "+musicScore.stats.bpm+" BPM",45,670);
 art.toBlob(blob=>{if(blob)download(blob,filename("png"));},"image/png");
 exportSay("Visuel musical PNG préparé.");
}
$("book").innerHTML=B.books.map((b,i)=>'<option value="'+b.code+'">'+(i===0?"ANCIEN TESTAMENT · ":"")+(i===39?"NOUVEAU TESTAMENT · ":"")+esc(b.name)+'</option>').join("");
$("book").value="John";resetBook();$("chapter").value="14";
$("startVerse").value=String(defaultVerse);$("endVerse").value=String(defaultVerse);
$("bookPresets").innerHTML=B.specials.map((s,i)=>'<button type="button" data-example="'+i+'">'+esc(s.label)+'</button>').join("");
$("bookPresets").addEventListener("click",e=>{
 const btn=e.target.closest("[data-example]");if(!btn)return;
 const sample=B.specials[Number(btn.dataset.example)];
 $("book").value=sample.book;resetBook();$("chapter").value=String(sample.chapter);
 $("startVerse").value=String(sample.start);$("endVerse").value=sample.end==null?"":String(sample.end);load();
});
$("book").addEventListener("change",()=>{resetBook();$("startVerse").value="1";$("endVerse").value="";});
$("chapter").addEventListener("change",()=>{$("startVerse").value="1";$("endVerse").value="";});
$("loadChapter").addEventListener("click",load);
$("useManual").addEventListener("click",loadManual);
$("clearManual").addEventListener("click",()=>{$("manualText").value="";say("Zone de saisie effacée, passage chargé conservé.")});
$("readAll").addEventListener("click",()=>start(0));
$("verses").addEventListener("click",e=>{const btn=e.target.closest("[data-index]");if(btn)start(Number(btn.dataset.index))});
$("stop").addEventListener("click",()=>stop());
$("pause").addEventListener("click",pause);
$("wav").addEventListener("click",exportWav);$("midi").addEventListener("click",exportMidi);
$("json").addEventListener("click",exportJson);$("png").addEventListener("click",exportPng);
$("readSpeed").addEventListener("input",()=>{$("speedOutput").textContent=(Number($("readSpeed").value)/100).toLocaleString("fr-FR",{maximumFractionDigits:2})+"×";});
["style","scale","bpm","drums","pad"].forEach(id=>$(id).addEventListener("change",rebuildMusic));
voices();if("speechSynthesis" in window)window.speechSynthesis.addEventListener?.("voiceschanged",voices);
window.addEventListener("pagehide",()=>stop({silent:true}));
if("ResizeObserver" in window)new ResizeObserver(()=>draw(A.getProgress())).observe(canvas);
load();
})();
