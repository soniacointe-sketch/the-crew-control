/* ELOAH NUMERA · ALPHA OPUS — Lecteur complet / douze tableaux.
 * WebAudio local, sélecteur de scènes, visualisation de partition, exports WAV/MIDI/PNG/JSON.
 */
(function(){
"use strict";
const E=window.ELOAH_ALPHA_OPUS,A=window.ELOAH_NUMERA_AUDIO;
if(!E||!A)return;
const $=id=>document.getElementById(id),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let opus=null,selected=0,playingType=null,playSceneIndex=-1,raf=0,lastRefresh=0,exporting=false;
const canvas=$("opusArt"),cx=canvas.getContext("2d");
const lengthTime=v=>{const n=Math.round(Math.max(0,v));return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")};
const say=t=>{$("opusStatus").textContent=t},notice=t=>{$("exportStatus").textContent=t};
function options(){
 return {format:$("format").value,bpm:Number($("bpm").value),root:Number($("root").value),
  density:Number($("density").value)/100,volume:Number($("volume").value)/100,
  percussion:$("percussion").checked,harmonies:$("harmonies").checked};
}
function settingsText(){
 $("bpmLabel").textContent=$("bpm").value+" BPM";
 $("densityLabel").textContent=$("density").value+" %";
 $("volumeLabel").textContent=$("volume").value+" %";
}
function updateTrackSelection(highlight){
 $("movements").querySelectorAll(".track").forEach(el=>{
  const k=Number(el.dataset.index);
  el.setAttribute("aria-pressed",String(k===selected));
  el.classList.toggle("current",Boolean(highlight&&k===highlight));
 });
}
function renderTracks(){
 const host=$("movements");host.replaceChildren();
 opus.movements.forEach((m,i)=>{
  const btn=document.createElement("button");
  btn.type="button";btn.className="track";btn.dataset.index=i;
  btn.setAttribute("aria-label","Sélectionner "+m.roman+" · "+m.title);
  btn.setAttribute("aria-pressed",String(i===selected));
  const r=document.createElement("span");r.className="roman";r.textContent=m.roman;
  const title=document.createElement("span");const top=document.createElement("strong");top.textContent=m.title;
  const sub=document.createElement("small");sub.textContent=m.subtitle+" · "+m.alpha;
  title.append(top,sub);
  const length=document.createElement("span");length.className="length";length.textContent=lengthTime(m.durationSeconds);
  btn.append(r,title,length);host.append(btn);
 });
}
function showSelected(){
 if(!opus)return;
 const s=opus.movements[selected];
 $("movementDetails").innerHTML='<div class="eyebrow">'+esc(s.alpha)+' · TABLEAU '+s.roman+'</div>'+
  '<h3>'+esc(s.title)+'</h3><p>'+esc(s.story)+'</p>'+
  '<div><strong>Formule ALPHA : </strong>'+esc(s.code)+'</div>'+
  '<div class="line">Source musicale : <b>'+esc(s.input)+'</b> · '+s.notes+' notes · '+s.chords+' accords · '+lengthTime(s.durationSeconds)+'</div>'+
  '<div class="line"><a href="'+esc(s.source)+'" target="_blank" rel="noopener noreferrer">Lire la référence historique ↗</a></div>'+
  '<div class="line">Correspondance créative : '+esc(s.evidence)+'. Les notes ne prétendent pas restituer un son antique.</div>';
 $("coverLabel").textContent=s.roman+" · "+s.title;
 updateTrackSelection(playingType?playSceneIndex:-1);
 render(0,true);
}
function stop(showMessage=true){
 A.stop();playingType=null;playSceneIndex=-1;
 if(raf)cancelAnimationFrame(raf);raf=0;
 $("opusProgressBar").style.width="0%";
 $("opusProgress").setAttribute("aria-valuenow","0");
 $("elapsed").textContent="00:00";
 $("opusPlay").textContent="▶ Écouter les 12 tableaux";
 updateTrackSelection(-1);
 if(showMessage)say("Lecture arrêtée. La partition reste prête pour être rejouée.");
 render(0,true);
}
function regenerate(){
 stop(false);
 try{
  opus=E.compose(options());selected=0;
  $("totalChapters").textContent=opus.movements.length;
  $("opusDuration").textContent=lengthTime(opus.totalSeconds);
  $("opusNotes").textContent=opus.notes;
  $("opusBpm").textContent=opus.config.bpm;
  $("totalTime").textContent=lengthTime(opus.totalSeconds);
  renderTracks();showSelected();
  say("Œuvre créée : "+opus.movements.length+" tableaux · "+opus.notes+" notes · "+lengthTime(opus.totalSeconds)+". Clique sur Écouter pour activer le son.");
 }catch(err){say("Erreur de composition : "+err.message);}
}
function scoreMode(){
 if(playingType==="all")return opus?.audio;
 if(playingType==="scene")return opus?.movements[playSceneIndex]?.audio;
 return null;
}
async function playback(which){
 if(!opus)return;
 stop(false);
 const isAll=which==="all";
 const selectedScene=selected;
 const song=isAll?opus.audio:opus.movements[selectedScene].audio;
 const kind=isAll?"all":"scene";
 playingType=kind;playSceneIndex=isAll?-1:selectedScene;
 $("opusPlay").textContent=isAll?"♪ Relancer les 12 tableaux":"▶ Écouter les 12 tableaux";
 try{
  await A.start(song,{loop:false,onEnd:()=>{
   if(playingType===kind){stop(false);say("Fin de la "+(kind==="all"?"suite complète.":"scène.")+" Tu peux écouter à nouveau ou exporter la composition.");}
  }});
  if(!A.isPlaying())throw Error("Contexte audio non initialisé.");
  say(isAll?"Lecture des douze tableaux : "+lengthTime(opus.totalSeconds)+" de création.":"Lecture du tableau "+opus.movements[selectedScene].roman+" · "+opus.movements[selectedScene].title+".");
  updateTrackSelection(isAll?0:selectedScene);
  frame();
 }catch(err){stop(false);say("Son indisponible : "+err.message+". Utilise un navigateur autorisant Web Audio et relance par un clic.");}
}
function color(i,alpha=1){
 const colors=opus?opus.movements.map(x=>x.accent):["#f2d19b"];
 const hex=colors[i%colors.length];
 if(alpha>=1)return hex;
 const rgb=[1,3,5].map(k=>parseInt(hex.slice(k,k+2),16));
 return "rgba("+rgb.join(",")+","+alpha+")";
}
function artSize(){
 if(!cx)return [0,0];
 const box=canvas.getBoundingClientRect(),w=Math.max(240,box.width),h=Math.max(220,box.height),ratio=Math.min(2,window.devicePixelRatio||1);
 if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}
 cx.setTransform(ratio,0,0,ratio,0,0);return [w,h];
}
function render(pos=0,still=false){
 if(!cx||!opus)return;
 const [w,h]=artSize(),centerX=w*.5,centerY=h*.47,r=Math.min(w*.31,h*.34);
 const background=cx.createRadialGradient(centerX,centerY,0,centerX,centerY,Math.max(w,h)*.7);
 background.addColorStop(0,"#523050");background.addColorStop(.32,"#23172f");background.addColorStop(1,"#0f0a17");
 cx.fillStyle=background;cx.fillRect(0,0,w,h);
 cx.save();cx.translate(centerX,centerY);
 for(let ring=0;ring<4;ring++){
  cx.beginPath();cx.arc(0,0,r*(.52+ring*.22),0,Math.PI*2);
  cx.strokeStyle="rgba(237,198,220,"+(.21-ring*.04)+")";cx.lineWidth=1;cx.stroke();
 }
 const current=playingType==="scene"?playSceneIndex:Math.min(11,Math.floor(pos*12));
 const phase=playingType?pos:0;
 for(let i=0;i<12;i++){
  const mid=-Math.PI/2+(i+.5)*Math.PI*2/12,a0=mid-.24,a1=mid+.24;
  const selectedOrNow=i===current||!playingType&&i===selected;
  cx.beginPath();cx.arc(0,0,r*1.25,a0,a1);
  cx.lineWidth=selectedOrNow?9:4;cx.lineCap="round";cx.strokeStyle=color(i,selectedOrNow?1:.49);cx.stroke();
  const dotx=Math.cos(mid)*r*1.25,doty=Math.sin(mid)*r*1.25;
  cx.beginPath();cx.arc(dotx,doty,selectedOrNow?5:3.1,0,Math.PI*2);
  cx.fillStyle=color(i);cx.fill();
  const t=opus.movements[i];
  const notePerc=Math.min(12,t.notes)/12;
  const orbital=r*(.43+notePerc*.2);
  cx.beginPath();cx.arc(Math.cos(mid)*orbital,Math.sin(mid)*orbital,2.6,0,Math.PI*2);
  cx.fillStyle=color(i,.8);cx.fill();
 }
 const pulse=playingType?1+Math.sin(Date.now()/230)*.05:1;
 cx.beginPath();cx.arc(0,0,r*.37*pulse,0,Math.PI*2);
 cx.fillStyle="rgba(15,9,22,.7)";cx.fill();cx.lineWidth=2;cx.strokeStyle="rgba(251,223,179,.83)";cx.stroke();
 cx.fillStyle="#ffe9c5";cx.textAlign="center";cx.textBaseline="middle";
 cx.font=Math.round(Math.min(r*.25,35))+"px Georgia,serif";cx.fillText("Α  Ω",0,-7);
 cx.font=Math.round(Math.min(r*.09,12))+"px system-ui";cx.fillStyle="#e6bfd0";cx.fillText("12 · 24 · 7",0,21);
 cx.restore();
 // Deterministic celestial texture, not a visualized audio recording.
 const seed=opus.audio.seed;
 let state=seed>>>0;
 for(let k=0;k<72;k++){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  const x=((state>>>0)%10000)/10000*w;
  state^=state<<13;state^=state>>>17;state^=state<<5;
  const y=((state>>>0)%10000)/10000*h;
  cx.fillStyle="rgba(238,194,232,"+(.1+(k%5)*.04)+")";
  cx.beginPath();cx.arc(x,y,k%8===0?1.4:.7,0,Math.PI*2);cx.fill();
 }
 if(still)return;
}
function frame(){
 if(!playingType||!A.isPlaying()){raf=0;return;}
 const progress=A.getProgress(),globalP=playingType==="scene"?
  (opus.movements[playSceneIndex].startSeconds+progress*opus.movements[playSceneIndex].durationSeconds)/opus.totalSeconds:progress;
 const time=globalP*opus.totalSeconds,idx=Math.min(11,Math.floor(time/(opus.movements[0].durationSeconds)));
 $("opusProgressBar").style.width=clamp(globalP*100,0,100)+"%";
 $("opusProgress").setAttribute("aria-valuenow",String(Math.round(globalP*100)));
 $("elapsed").textContent=lengthTime(time);
 $("coverLabel").textContent=opus.movements[idx].roman+" · "+opus.movements[idx].title;
 if(playingType==="all"&&idx!==lastRefresh){lastRefresh=idx;updateTrackSelection(idx);}
 render(globalP);
 raf=requestAnimationFrame(frame);
}
function save(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),6000);
}
async function wav(which){
 if(!opus||exporting)return;
 const full=which==="all",score=full?opus.audio:opus.movements[selected].audio;
 exporting=true;
 $("wavFull").disabled=true;$("wavScene").disabled=true;
 notice("Production WAV "+(full?"complète":"du tableau")+" dans le navigateur… La version développée peut demander davantage de mémoire.");
 try{
  const blob=await A.renderWAV(score);
  save(blob,full?"ELOAH-ALPHA-OPUS-integrale.wav":"ELOAH-ALPHA-OPUS-"+String(selected+1).padStart(2,"0")+".wav");
  notice("WAV créé : "+(blob.size/1048576).toFixed(1)+" Mo · fichier audio original "+(full?"complet":"du tableau sélectionné")+".");
 }catch(e){notice("Export WAV impossible sur cet appareil : "+e.message+". Essaie la version essentielle sur un ordinateur récent.");}
 finally{exporting=false;$("wavFull").disabled=false;$("wavScene").disabled=false;}
}
function midi(which){
 if(!opus)return;
 const full=which==="all",score=full?opus.audio:opus.movements[selected].audio;
 try{
  const blob=A.renderMIDI(score);
  save(blob,full?"ELOAH-ALPHA-OPUS-integrale.mid":"ELOAH-ALPHA-OPUS-"+String(selected+1).padStart(2,"0")+".mid");
  notice("MIDI exporté : notes, accords et percussions. Le timbre final dépendra du logiciel de lecture MIDI.");
 }catch(e){notice("Échec export MIDI : "+e.message)}
}
function livret(){
 if(!opus)return;
 const rows=opus.movements.map(x=>({
  chapitre:x.roman,nom:x.title,article:x.alpha,formule:x.code,description:x.story,
  sourceHistorique:x.source,objet:x.input,notes:x.notes,mesures:x.audio.stats.bars,
  departSecondes:x.startSeconds,tempsSecondes:x.durationSeconds
 }));
 const payload={name:opus.title,subtitle:opus.subtitle,version:opus.version,generated:new Date().toISOString(),config:opus.config,
  provenance:opus.sourceData,chapitres:rows,notes:opus.audio.notes,accords:opus.audio.chords,percussions:opus.audio.drumEvents,
  limite:opus.notice};
 save(new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"}),"ELOAH-ALPHA-OPUS-livret-et-partition.json");
 notice("Livret intégral et partition exportés.");
}
function cover(){
 if(!opus)return;
 render(0,true);
 const out=document.createElement("canvas");out.width=1400;out.height=1400;
 const context=out.getContext("2d");if(!context)return;
 const bg=context.createRadialGradient(700,700,5,700,700,1000);
 bg.addColorStop(0,"#4c2c52");bg.addColorStop(.65,"#21162e");bg.addColorStop(1,"#0d0a15");
 context.fillStyle=bg;context.fillRect(0,0,1400,1400);
 const side=canvas.width/canvas.height;
 const W=1400,H=W/side;
 context.drawImage(canvas,0,(1400-H)/2,W,H);
 context.fillStyle="rgba(18,9,26,.82)";context.fillRect(0,1065,1400,335);
 context.fillStyle="#f2d6a5";context.font="bold 34px system-ui";
 context.fillText("ELOAH ✦ NUMERA",75,105);
 context.font="normal 98px Georgia,serif";context.fillText("ALPHA OPUS",75,1195);
 context.font="normal 38px Georgia,serif";context.fillStyle="#f0d5e4";context.fillText("De la lettre à la voix",77,1259);
 context.font="20px system-ui";context.fillText("12 TABLEAUX  ·  24 LETTRES  ·  7 VOYELLES",80,1320);
 out.toBlob(blob=>{if(blob){save(blob,"ELOAH-ALPHA-OPUS-pochette.png");notice("Pochette de l'œuvre créée en PNG.");}else notice("Export PNG indisponible.");},"image/png");
}
$("movements").addEventListener("click",e=>{
 const btn=e.target.closest("button[data-index]");if(!btn)return;
 selected=Number(btn.dataset.index);showSelected();
});
$("opusPlay").addEventListener("click",()=>playback("all"));
$("opusScenePlay").addEventListener("click",()=>playback("scene"));
$("opusStop").addEventListener("click",()=>stop(true));
$("recompose").addEventListener("click",regenerate);
$("wavFull").addEventListener("click",()=>wav("all"));
$("wavScene").addEventListener("click",()=>wav("scene"));
$("midiFull").addEventListener("click",()=>midi("all"));
$("midiScene").addEventListener("click",()=>midi("scene"));
$("jsonScore").addEventListener("click",livret);
$("pngCover").addEventListener("click",cover);
["bpm","density","volume"].forEach(k=>$(k).addEventListener("input",settingsText));
if("ResizeObserver" in window)new ResizeObserver(()=>render(0,true)).observe(canvas);
else window.addEventListener("resize",()=>render(0,true));
document.addEventListener("visibilitychange",()=>{if(document.hidden&&A.isPlaying())stop(false)});
window.addEventListener("pagehide",()=>{A.stop();if(raf)cancelAnimationFrame(raf)});
settingsText();regenerate();
const internal=E.audit();
notice("Œuvre disponible · "+internal.passed+"/"+internal.total+" contrôles de partition réussis. La synthèse utilise Web Audio et la création reste locale.");
})();
